import React, { useRef, useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Editor } from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  RotateCcw,
  Play,
  ChevronLeft,
  ChevronRight,
  Terminal,
  BookOpen,
  Code,
} from "lucide-react";
import JSZip from "jszip";
import { executeCode } from "/src/assets/api.js";
import axios from "axios";
const Platform = () => {
  const zip = new JSZip();
  const nav = useNavigate();
  const { testId } = useParams();
  const [roomCode, setRoomCode] = useState(
    localStorage.getItem("roomCode") || "",
  );
  const [dummyQuestions, setDummyQuestions] = useState([]);
  const [onQuestion, setOnQuestion] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [expectedOutputs, setExpectedOutputs] = useState([]);
  const [code, setCode] = useState("");
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.post("https://codingassistant.onrender.com/api/get-test", {
          roomCode,
          testId,
        });
        // console.log(
        //   "Fetched questions:",
        //   res.data.test.questions.map((q) => ({
        //     questionName: q.questionName[0],
        //     testCases: q.testCases,
        //     output: q.Output,
        //     _id: q._id,
        //   })),
        // );
        setDummyQuestions(
          res.data.test.questions.map((q) => ({
            questionName: q.questionName[0],
            testCases: q.testCases,
            output: q.Output,
            _id: q._id,
          })),
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [roomCode, testId]);
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const [value, setValue] = useState(
    "// Please select the language before starting",
  );
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("");
  const [questions, setQuestions] = useState(dummyQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stdinValue, setStdinValue] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(35);
  const [terminalOutput, setTerminalOutput] = useState([]);
  useEffect(() => {
    if (questions.length > 0) {
      console.log(questions);
      setValue(
        `// Start coding for ${questions[currentQuestionIndex].questionName}`,
      );
      setStdinValue(""); // Clear input on question change
      setOutput(null);
    }
  }, [currentQuestionIndex, questions]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };
  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue().trim();
    if (!sourceCode) {
      toast.warn("Code editor is empty!");
      return;
    }
    setIsLoading(true);
    setOutput("Running code...");
    try {
      // console.log(sourceCode);
      // console.log(language);
      const { run: result } = await executeCode(
        sourceCode,
        language,
        stdinValue,
      );

      setOutput(result?.output || "No output returned.");
    } catch (error) {
      console.error("Code execution error:", error);
      setOutput(`Execution failed. Please try again. ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCode = () => {
    const resetValue = `// Code reset at ${new Date().toLocaleTimeString()} for question ${currentQuestionIndex + 1}`;
    setValue(resetValue);
    setOutput(null);
    setStdinValue("");
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };
  const previousQuestion = () =>
    setCurrentQuestionIndex(
      (prev) => (prev - 1 + questions.length) % questions.length,
    );

  const currentQuestion = questions[currentQuestionIndex];
  const stopResizing = useCallback(() => {
    document.removeEventListener("mousemove", resizePanel);
    document.removeEventListener("mouseup", stopResizing);
  }, []);
  useEffect(() => {
    setQuestions(dummyQuestions);
  }, [dummyQuestions]);
  const resizePanel = useCallback((e) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidthInPixels = e.clientX - containerRect.left;
    const newWidthPercent = (newWidthInPixels / containerRect.width) * 100;

    // Set bounds (20% to 80%)
    const clampedWidth = Math.max(20, Math.min(80, newWidthPercent));

    setLeftPanelWidth(clampedWidth);
  }, []);

  const startResizing = useCallback(
    (e) => {
      e.preventDefault();
      document.addEventListener("mousemove", resizePanel);
      document.addEventListener("mouseup", stopResizing);
    },
    [resizePanel, stopResizing],
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // new state
  const handleSubmit = async () => {
    const formData = new FormData();
    setIsSubmitting(true);
    setTerminalOutput([]);
    formData.append("language", language);
    formData.append("question", JSON.stringify(currentQuestion.questionName));
    let index = 1;
    for (const f of currentQuestion.testCases) {
      const file = new File([f], `input${index}.in`, { type: "text/plain" });
      formData.append("inputs", file);
      index++;
    }
    // console.log(formData);
    const code = editorRef.current?.getValue().trim();
    const codeFile = new File([code], `main.${language}`, {
      type: "text/plain",
    });
    formData.append("code", codeFile);
    // console.log(codeFile);
    const validations = JSON.stringify(currentQuestion.output, null, 2);
    // console.log(validations);
    const validationFile = new File([validations], "validations.json", {
      type: "application/json",
    });
    formData.append("validations", validationFile);

    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    try {
      const response = await axios.post(
        "https://code-exec-rwoe.onrender.com/submit",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Code submitted successfully!");
      // console.log(response.data.finalOutput);
      setTerminalOutput(response.data.finalOutput || ["No output received."]);
    } catch (err) {
      toast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <ToastContainer theme="dark" position="top-right" />
      <div
        ref={containerRef}
        className="flex gap-0 p-4 min-h-screen relative"
        style={{ minHeight: "100vh", paddingRight: 0 }}
      >
        <div
          style={{ width: `${leftPanelWidth}%` }}
          className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg mr-2 transition-width duration-100 ease-linear"
        >
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <BookOpen size={20} /> Problem Description
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousQuestion}
                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                title="Previous Question"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextQuestion}
                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                title="Next Question"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          {currentQuestion ? (
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              <h3 className="text-xl font-semibold text-white">
                {currentQuestion.questionName}
              </h3>
              <button onClick={handleSubmit}>Submit</button>
              <div className="mt-4">
                <h4 className="font-semibold text-slate-300 mb-2">
                  Test Cases:
                </h4>
                {currentQuestion.testCases &&
                currentQuestion.testCases.length > 0 ? (
                  currentQuestion.testCases.map((test, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/70 rounded-lg p-4 space-y-2 text-sm font-mono border border-slate-700 mb-2"
                    >
                      <p>
                        <span className="text-cyan-400">Input:</span> {test}
                      </p>
                      <p>
                        <span className="text-cyan-400">Expected Output:</span>{" "}
                        {currentQuestion.output[index]}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic">
                    No test cases available.
                  </p>
                )}
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col shadow-lg">
                <h3 className="text-md font-semibold mb-2 flex items-center gap-2 text-slate-300 border-b border-slate-700 pb-2">
                  <Code size={16} /> Program Input (stdin)
                </h3>
                <textarea
                  rows={3}
                  value={stdinValue}
                  onChange={(e) => setStdinValue(e.target.value)}
                  placeholder="Enter input here (e.g., test numbers, lines of text) for your program to read."
                  className="w-full bg-slate-700 text-cyan-300 font-mono text-sm border border-slate-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
              Loading Problem...
            </div>
          )}
        </div>
        <div
          ref={resizerRef}
          onMouseDown={startResizing}
          className="w-2 cursor-col-resize bg-slate-700 hover:bg-purple-500 transition-colors duration-200"
          style={{ height: "100vh", margin: "0 -1px" }}
        ></div>
        <div
          style={{ width: `${100 - leftPanelWidth}%` }}
          className="flex flex-col gap-4 pl-2"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Code
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-700 text-white pl-9 pr-3 py-2 text-sm rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                >
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
              <button
                onClick={resetCode}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Reset Code"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <button
              onClick={runCode}
              disabled={isLoading}
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-semibold text-sm disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-wait transform hover:scale-105"
            >
              <Play size={16} />
              {isLoading ? "Running..." : "Run Code"}
            </button>
          </div>

          <div className="flex-grow bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
            <div
              style={{
                height: "100%",
                padding: "20px",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            >
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={value}
                onMount={onMount}
                onChange={(newValue) => {
                  setValue(newValue);
                }}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  padding: { top: 20, bottom: 20 },
                  lineNumbers: "on",
                  roundedSelection: false,
                }}
              />
            </div>
          </div>

          {/* Console Output */}
          <div className="h-48 bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col shadow-lg">
            <h3 className="text-md font-semibold mb-2 flex items-center gap-2 text-slate-300 border-b border-slate-700 pb-2">
              <Terminal size={16} /> Console
            </h3>

            {isSubmitting ? (
              <div className="flex items-center justify-center flex-grow text-slate-300 font-mono">
                Running submission...
              </div>
            ) : terminalOutput.length > 0 ? (
              <div className="font-mono text-sm text-slate-400 whitespace-pre-wrap overflow-y-auto flex-grow pt-2 pr-2">
                {terminalOutput.map((line, index) => (
                  <div
                    key={index}
                    className={
                      line === "Correct"
                        ? "text-green-400"
                        : line === "Wrong"
                          ? "text-red-400"
                          : "text-yellow-400"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center flex-grow text-slate-400 font-mono">
                Output will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Platform;
