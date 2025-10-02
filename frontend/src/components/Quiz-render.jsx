import React, { useState, useEffect } from "react";
import { RoomEntry } from "../components/Room-entry";
import { QuizUpload } from "../components/Quiz-upload";
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

export function QuizRenderer({ roomCode, userId }) {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const nav = useNavigate();
  //https://codingassistant.onrender.com
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await axios.post(
          "https://codingassistant.onrender.com//api/get-quiz",
          { roomCode }
        );
        setQuizData(response.data.quizData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [roomCode]);

  if (loading) {
    return (
      <div className="text-center text-slate-300 animate-pulse">
        Loading Quiz...
      </div>
    );
  }

  if (!quizData || quizData.length === 0) {
    return (
      <div className="text-center text-red-400">
        Failed to load quiz or quiz is empty.
      </div>
    );
  }

  const question = quizData[currentQuestion];
  const totalQuestions = quizData.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (index) => {
    if (submitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === question.correctAnswer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
    setAnswers([
      ...answers,
      { questionIndex: currentQuestion, selectedAnswer, isCorrect },
    ]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      setShowResults(true);
      saveResults();
    }
  };

  const saveResults = async () => {
    try {
      await axios.post(`https://codingassistant.onrender.com//results`, {
        userId,
        roomCode,
        score,
        totalQuestions,
        answers,
      });
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  const handleExit = () => {
    nav("/");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!showResults ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2 text-slate-400">
              <p className="text-sm font-semibold">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
              <p className="text-sm font-semibold">{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white my-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isCorrectAnswer =
                submitted && index === question.correctAnswer;
              const isWrongAnswer =
                submitted &&
                selectedAnswer === index &&
                index !== question.correctAnswer;
              const isSelected = selectedAnswer === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                                        ${
                                          isCorrectAnswer
                                            ? "bg-green-500/20 border-green-500 text-white"
                                            : ""
                                        }
                                        ${
                                          isWrongAnswer
                                            ? "bg-red-500/20 border-red-500 text-white"
                                            : ""
                                        }
                                        ${
                                          !submitted && isSelected
                                            ? "bg-indigo-500/30 border-indigo-500"
                                            : ""
                                        }
                                        ${
                                          !submitted && !isSelected
                                            ? "bg-slate-700 border-slate-600 hover:bg-slate-600/50 hover:border-slate-500"
                                            : ""
                                        }
                                        ${
                                          submitted
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer"
                                        }
                                    `}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="px-8 py-3 font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 transition-all transform hover:scale-105"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                {currentQuestion < totalQuestions - 1
                  ? "Next Question"
                  : "View Results"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Quiz Complete!
          </h2>
          <p className="text-slate-300 text-lg mt-4">You scored</p>
          <p className="text-6xl font-bold text-green-400 my-4">
            {score} / {totalQuestions}
          </p>
          <ul className="mt-6 text-left space-y-2 max-w-xs mx-auto">
            {answers.map((answer, index) => (
              <li
                key={index}
                className="flex items-center text-slate-300 bg-slate-700/50 p-2 rounded-md"
              >
                <span
                  className={`mr-3 h-2.5 w-2.5 rounded-full ${
                    answer.isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                Question {index + 1}:{" "}
                {answer.isCorrect ? "Correct" : "Incorrect"}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <button
              onClick={handleExit}
              className="px-8 py-3 font-bold rounded-lg text-white bg-slate-600 hover:bg-slate-500 transition-all"
            >
              Exit to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
