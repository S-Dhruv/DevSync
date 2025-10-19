import { useState, useEffect } from "react";
import { RoomEntry } from "../components/Room-entry";
import { QuizUpload } from "../components/Quiz-upload";
import { QuizRenderer } from "../components/Quiz-render";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// FIX: Fix take quiz when no quiz is there
// FIX: Error saving result after quiz

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

export default function Test() {
  const nav = useNavigate();
  const [roomCode, setRoomCode] = useState(localStorage.getItem("roomCode"));
  const [quizData, setQuizData] = useState(null);
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(jwtDecode(token).userId);
  const [isHost, setIsHost] = useState(jwtDecode(token).role === "admin");
  const [quizSubject, setQuizSubject] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("easy");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("default");

  useEffect(() => {
    if (roomCode && userId) {
      setIsHost(jwtDecode(token).role === "admin");
    }
    setLoading(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [roomCode, userId]);

  const handleRoomJoin = (code, id) => {
    localStorage.setItem("roomCode", code);
    // localStorage.setItem("userId", id);
    setRoomCode(code);
    setUserId(id);
    setIsHost(jwtDecode(token).role === "admin");
    setView("default");
  };

  const handleQuizUpload = (data) => {
    setQuizData(data);
    setView("quizRender");
  };

  const handleExitRoom = () => {
    localStorage.removeItem("roomCode");
    // localStorage.removeItem("userId");
    // localStorage.removeItem("role");
    setRoomCode(null);
    setUserId(null);
    setIsHost(false);
    setQuizData(null);
    setView("default");
    nav("/");
  };

  const generateQuiz = async () => {
    try {
      if (!quizSubject.trim()) {
        alert("Please enter a subject."); // You might want to replace alerts with a styled modal
        return;
      }

      const response = await fetch(
        "https://dev-sync-indol.vercel.app/api/init-quiz",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjects: [quizSubject],
            difficulty: quizDifficulty,
            roomCode,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setQuizData(data.quizData);
        setView("quizRender");
      } else {
        alert(data.message || "Failed to generate quiz.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while generating the quiz.");
    }
  };

  // --- UI Rendering with improved styling ---

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <h1 className="text-3xl font-bold animate-pulse">Loading...</h1>
      </main>
    );
  }

  if (!roomCode || !userId) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Quiz Room
          </h1>
          <p className="text-center text-slate-400 mb-8">
            Join a room to start a quiz session.
          </p>
          <RoomEntry onRoomJoin={handleRoomJoin} />
        </div>
      </main>
    );
  }

  const renderContent = () => {
    switch (view) {
      case "roomEntry":
        return <RoomEntry onRoomJoin={handleRoomJoin} />;
      case "quizUpload":
        return isHost ? (
          <QuizUpload onQuizUpload={handleQuizUpload} roomCode={roomCode} />
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center shadow-lg">
            <p className="text-red-400 text-lg font-semibold">Access Denied</p>
            <p className="text-slate-300 mt-2">
              Only the host can upload quizzes.
            </p>
            <button
              className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
              onClick={() => setView("default")}
            >
              Back to Lobby
            </button>
          </div>
        );
      case "quizRender":
        return <QuizRenderer roomCode={roomCode} userId={userId} />;
      case "generateAI":
        return (
          <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">
              Generate Quiz with AI
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject (e.g., Java, React)"
                value={quizSubject}
                onChange={(e) => setQuizSubject(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <select
                value={quizDifficulty}
                onChange={(e) => setQuizDifficulty(e.target.value)}
                className="w-full p-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg px-4 py-3 hover:from-purple-700 hover:to-indigo-700 transition-transform transform hover:scale-105 shadow-lg"
                onClick={generateQuiz}
              >
                <AiIcon />
                Generate Quiz
              </button>
              <button
                className="w-full bg-slate-600 text-slate-200 px-4 py-3 rounded-lg hover:bg-slate-500 transition"
                onClick={() => setView("default")}
              >
                Back
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg w-full text-center shadow-lg">
              <p className="text-slate-400 text-sm">ROOM CODE</p>
              <p className="text-2xl font-mono tracking-widest text-green-400 my-1">
                {roomCode}
              </p>
              <p className="text-slate-300">
                You are the{" "}
                <strong className="font-semibold text-indigo-400">
                  {isHost ? "Host" : "Participant"}
                </strong>
              </p>
            </div>

            {isHost && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button
                  className="flex items-center justify-center p-4 bg-slate-700 text-white rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-200 shadow-md group"
                  onClick={() => setView("quizUpload")}
                >
                  <UploadIcon />
                  <span className="font-semibold">Upload Quiz</span>
                </button>
                <button
                  className="flex items-center justify-center p-4 bg-slate-700 text-white rounded-lg hover:bg-purple-600 hover:scale-105 transition-all duration-200 shadow-md group"
                  onClick={() => setView("generateAI")}
                >
                  <AiIcon />
                  <span className="font-semibold">AI Generate</span>
                </button>
              </div>
            )}

            <div className="w-full flex flex-col gap-4">
              <button
                className="w-full flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={() => setView("quizRender")}
              >
                <PlayIcon />
                <span className="font-bold text-lg">Take Quiz</span>
              </button>

              <button
                className="w-full flex items-center justify-center p-4 bg-red-800 text-white rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-200 shadow-md"
                onClick={handleExitRoom}
              >
                <ExitIcon />
                <span className="font-semibold">Exit Room</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Quiz Lobby
        </h1>
        {renderContent()}
      </div>
    </main>
  );
}
