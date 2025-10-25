import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const AiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

// --- Themed Quiz Upload Component ---
export function QuizUpload({ onQuizUpload, roomCode }) {
  const [jsonData, setJsonData] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        validateQuizData(data);
        setJsonData(JSON.stringify(data, null, 2));
        setError("");
      } catch (err) {
        setError("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const validateQuizData = (data) => {
    if (!Array.isArray(data)) throw new Error("Quiz data must be an array.");
    data.forEach((question) => {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        throw new Error("Invalid question format.");
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const data = JSON.parse(jsonData);
      validateQuizData(data);
      const response = await fetch(
        `https://codingassistant.onrender.com/api/save-quiz`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode, quizData: data }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error saving quiz");
      }
      onQuizUpload(data);
    } catch (err) {
      console.log(err);
      setError("Invalid JSON data. Please check the format and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Upload Quiz Manually
      </h2>
      <p className="text-center text-slate-400 mb-6">
        Upload a JSON file or paste the raw data below.
      </p>

      <div className="mb-4">
        <label
          htmlFor="quiz-file-upload"
          className="w-full flex items-center justify-center p-4 bg-slate-700 text-white rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
        >
          <UploadIcon />
          <span className="font-semibold">Upload from File</span>
        </label>
        <input
          id="quiz-file-upload"
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="mb-4">
        <textarea
          placeholder="Paste your quiz JSON data here..."
          rows={10}
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="w-full p-3 font-mono text-sm bg-slate-900 text-slate-200 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="mb-6">
        <p className="text-slate-300 mb-2">Expected JSON Format:</p>
        <pre className="bg-slate-900/70 p-4 rounded-lg text-xs text-slate-400 overflow-x-auto">
          {`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1
  },
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2
  }
]`}
        </pre>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!jsonData || isUploading}
        className="w-full px-8 py-3 font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 transition-all transform hover:scale-105"
      >
        {isUploading ? "Uploading..." : "Start Quiz with this Data"}
      </button>
    </div>
  );
}
