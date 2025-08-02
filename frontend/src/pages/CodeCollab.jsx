import React, { useRef, useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Editor } from "@monaco-editor/react";
import { executeCode } from "../assets/api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const socket = io.connect("https://codingassistant.onrender.com");
// const  socket = io.connect("https://codingassistant.onrender.com");
const CodeCollab = () => {
  const nav = useNavigate();
  const [value, setValue] = useState("");
  const [output, setOutput] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [leave, setLeave] = useState(false);
  const editorRef = useRef();
  const code = localStorage.getItem("roomCode");
  const client = localStorage.getItem("userId");

  const leaveRoom = () => {
    socket.emit("leave-room", { code, client });
    localStorage.removeItem("roomCode");
    localStorage.removeItem("userId");
    console.log(`${client} left room ${code}`);
    setLeave(!localStorage.getItem("leave"));
    localStorage.removeItem("leave");
  };
  useEffect(() => {
    window.scrollTo({
      top: 150,
      behavior: "smooth",
    });
  }, []);
  useEffect(() => {
    setLeave(localStorage.getItem("leave"));
    if (!code || !client) {
      toast.error("Please enter a room");
      setTimeout(() => {
        nav("/");
      }, 2000);
      return;
    }
    const dummyQuestions = [
      {
        title: "Two Sum",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        example: {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]",
        },
      },
      {
        title: "Reverse a Linked List",
        description: "Reverse a singly linked list.",
        example: {
          input: "1->2->3->4->5->NULL",
          output: "5->4->3->2->1->NULL",
          explanation: "Reverse the direction of all pointers",
        },
      },
      {
        title: "Valid Parentheses",
        description:
          "Check if a string containing just the characters '(', ')', '{', '}', '[' and ']' is valid.",
        example: {
          input: "s = '()'",
          output: "true",
          explanation: "The brackets match and are properly closed",
        },
      },
    ];
    setQuestions(dummyQuestions);
    socket.emit("join-room", { roomCode: code, client });

    socket.on("editor", (change) => {
      if (change !== value && editorRef.current?.getValue() !== change) {
        setValue(change);
      }
    });

    socket.on("leave-room", ({ code, client }) => {
      localStorage.removeItem("roomCode");
      localStorage.removeItem("userId");
      console.log(`${client} left room ${code}`);
    });

    return () => {
      socket.off("editor");
      socket.off("leave-room");
    };
  }, [value, code]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };
  const handleEditor = useCallback(
    debounce((value) => {
      setValue(value);
      socket.emit("editor", { change: value, code });
    }, 500), // Adjust debounce delay as needed
    [code]
  );
  useEffect(() => {
    return () => {
      handleEditor.cancel();
    };
  }, []);

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue().trim();
    if (!sourceCode) {
      toast.warn("Code editor is empty!");
      return;
    }

    setOutput("Running..."); // Show loading state

    try {
      const { run: result } = await executeCode(sourceCode);
      setOutput(result?.output || "No output returned.");
    } catch (error) {
      console.error("Code execution error:", error);
      setOutput("Execution failed. Please try again.");
    }
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex + 1 < questions.length ? prevIndex + 1 : 0
    );
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex === 0 ? questions.length - 1 : prevIndex - 1
    );
  };

  const currentQuestion = questions[currentQuestionIndex];

  // if (leave) {
  //   return (
  //     <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold mb-4">You've left the room</h2>
  //         <button
  //           onClick={() => nav("/home")}
  //           className="px-6 py-2 bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition duration-200"
  //         >
  //           Return Home
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
      <div className="flex gap-4 h-[calc(100vh-2rem)]">
        {/* Problem Description Panel */}
        <div className="w-[400px] bg-[#2a2a2a] rounded-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Problem Description</h2>
            <div className="flex gap-2">
              <button
                onClick={previousQuestion}
                className="px-4 py-2 bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition"
              >
                Previous
              </button>
              <button
                onClick={nextQuestion}
                className="px-4 py-2 bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition"
              >
                Next
              </button>
            </div>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto">
            <h3 className="text-xl font-semibold">{currentQuestion?.title}</h3>
            <p className="text-[#93a3b8]">{currentQuestion?.description}</p>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Example:</h4>
              <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-2">
                <p className="text-[#93a3b8]">
                  Input: {currentQuestion?.example?.input}
                </p>
                <p className="text-[#93a3b8]">
                  Output: {currentQuestion?.example?.output}
                </p>
                <p className="text-[#93a3b8]">
                  Explanation: {currentQuestion?.example?.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-[#404040] focus:outline-none focus:border-[#3b82f6]"
                defaultValue="javascript"
              >
                <option value="java">Java</option>
              </select>
              <button
                onClick={runCode}
                className="px-6 py-2 bg-[#2ea043] text-white rounded-lg hover:bg-[#2c974b] transition flex items-center gap-2"
              >
                Run Code
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#93a3b8] hover:text-white transition">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#93a3b8] hover:text-white transition">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#2a2a2a] rounded-lg overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="java"
              value={value}
              onChange={handleEditor}
              onMount={onMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                roundedSelection: false,
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console Output */}
          <div className="h-[200px] bg-[#2a2a2a] rounded-lg mt-4 p-4">
            <h3 className="text-lg font-semibold mb-2">Console Output:</h3>
            <div className="font-mono text-[#93a3b8] whitespace-pre-wrap overflow-y-auto h-[calc(100%-2rem)]">
              {output || "// Output will appear here after running the code"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCollab;
