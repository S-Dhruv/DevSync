import React, { useRef, useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Editor } from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Play,
  ChevronLeft,
  ChevronRight,
  Terminal,
  BookOpen,
  Code,
} from "lucide-react";
import { io } from "socket.io-client";
import { executeCode } from "../assets/api";
import { jwtDecode } from "jwt-decode";

// const socket = io.connect("https://codingassistant.onrender.com/");
const socket = io.connect("https://codingassistant.onrender.com/");
const CodeCollab = () => {
  const nav = useNavigate();
  const editorRef = useRef(null);
  const [value, setValue] = useState("");
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [leave, setLeave] = useState(false);
  const [stdinValue, setStdinValue] = useState("");
  const roomCode = localStorage.getItem("roomCode");
  const token = localStorage.getItem("token");
  const client = () => {
    try {
      const decodedPayloud = jwtDecode(token);
      return decodedPayloud.userId;
    } catch {
      return null;
    }
  };
  // TODO: Add leave Room button
  const leaveRoom = () => {
    if (client === null) {
      toast.error("Unknown Error");
    }
    socket.emit("leave-room", { code: roomCode, client });
    localStorage.removeItem("roomCode");
    setLeave(true);
  };

  const dummyQuestions = [
    {
      title: "Two Sum",
      description:
        "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
      example: {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    },
    {
      title: "Reverse a Linked List",
      description:
        "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
      example: {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The list is reversed node by node.",
      },
    },
    {
      title: "Valid Parentheses",
      description:
        "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      example: {
        input: "s = '()[]{}'",
        output: "true",
        explanation: "All brackets are matched and closed properly.",
      },
    },
  ];

  useEffect(() => {
    setQuestions(dummyQuestions);
    setStdinValue("");
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!roomCode || client === null) {
      toast.error("You are not in a collaboration room. Redirecting...");
      setTimeout(() => nav("/"), 2000);
      return;
    }

    socket.emit("join-room", { roomCode, client });

    socket.on("editor", (change) => {
      if (change !== value && editorRef.current?.getValue() !== change) {
        setValue(change);
      }
    });

    socket.on("leave-room", ({ code, client }) => {
      toast.info(`${client} left room ${code}`);
    });

    return () => {
      socket.off("editor");
      socket.off("leave-room");
    };
  }, [roomCode, client]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditor = useCallback(
    debounce((newValue) => {
      socket.emit("editor", { change: newValue, code: roomCode });
    }, 500),
    [roomCode],
  );

  useEffect(() => {
    return () => handleEditor.cancel();
  }, [handleEditor]);

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue().trim();
    if (!sourceCode) {
      toast.warn("Code editor is empty!");
      return;
    }
    setIsLoading(true);
    setOutput("Running code...");
    try {
      console.log(sourceCode);
      console.log(language);
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
    const resetValue = `// Code reset at ${new Date().toLocaleTimeString()}`;
    setValue(resetValue);
    socket.emit("editor", { change: resetValue, code: roomCode });
    setStdinValue("");
    setOutput(null);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };
  const previousQuestion = () =>
    setCurrentQuestionIndex(
      (prev) => (prev - 1 + questions.length) % questions.length,
    );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <ToastContainer theme="dark" position="top-right" />
      <div className="flex flex-col lg:flex-row gap-4 p-4 h-screen">
        <div className="lg:w-[35%] bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col p-6 shadow-lg">
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
                {currentQuestion.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {currentQuestion.description}
              </p>
              <div className="mt-4">
                <h4 className="font-semibold text-slate-300 mb-2">Example:</h4>
                <div className="bg-slate-900/70 rounded-lg p-4 space-y-2 text-sm font-mono border border-slate-700">
                  <p>
                    <span className="text-cyan-400">Input:</span>{" "}
                    {currentQuestion.example.input}
                  </p>
                  <p>
                    <span className="text-cyan-400">Output:</span>{" "}
                    {currentQuestion.example.output}
                  </p>
                  <p>
                    <span className="text-slate-500">Explanation:</span>{" "}
                    {currentQuestion.example.explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
              Loading Problem...
            </div>
          )}
        </div>

        <div className="lg:w-[65%] flex flex-col gap-4">
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
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={value}
              onMount={onMount}
              onChange={(newValue) => {
                setValue(newValue);
                handleEditor(newValue);
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
          <div className="h-48 bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col shadow-lg">
            <h3 className="text-md font-semibold mb-2 flex items-center gap-2 text-slate-300 border-b border-slate-700 pb-2">
              <Terminal size={16} /> Console
            </h3>
            <div className="font-mono text-sm text-slate-400 whitespace-pre-wrap overflow-y-auto flex-grow pt-2 pr-2">
              {output ? (
                <span
                  className={
                    output.startsWith("Error")
                      ? "text-red-400"
                      : "text-green-400"
                  }
                >{`> ${output}`}</span>
              ) : (
                <span className="text-slate-600">{`> Output will appear here...`}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCollab;
