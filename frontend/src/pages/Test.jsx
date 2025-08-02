import { useState, useEffect } from "react";
import { RoomEntry } from "../components/Room-entry";
import { QuizUpload } from "../components/Quiz-upload";
import { QuizRenderer } from "../components/Quiz-render";
import { useNavigate } from "react-router-dom";

export default function Test() {
  const nav = useNavigate();
  const [roomCode, setRoomCode] = useState(localStorage.getItem("roomCode"));
  const [quizData, setQuizData] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [isHost, setIsHost] = useState(
    localStorage.getItem("role") === "admin"
  );
  const [quizSubject, setQuizSubject] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("easy");

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("default"); // Add state for view: "default", "roomEntry", "quizUpload", "quizRender"
  useEffect(() => {
    if (roomCode && userId) {
      setIsHost(localStorage.getItem("role") === "admin");
    }
    setLoading(false);
    window.scrollTo({
      top: 150, // Adjust this value to control how far down the page should scroll
      behavior: "smooth", // Enables smooth scrolling
    });
  }, [roomCode, userId]);

  const handleRoomJoin = (code, id) => {
    localStorage.setItem("roomCode", code);
    localStorage.setItem("userId", id);
    setRoomCode(code);
    setUserId(id);
    setIsHost(localStorage.getItem("role") === "admin");
    setView("default");
  };

  const handleQuizUpload = (data) => {
    setQuizData(data);
    setView("quizRender");
  };

  const handleExitRoom = () => {
    localStorage.removeItem("roomCode");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setRoomCode(null);
    setUserId(null);
    setIsHost(false);
    setQuizData(null);
    setView("default");
    nav("/");
  };

  if (loading) {
    return (
      <main className="container mx-auto p-4 max-w-4xl text-center">
        <h1 className="text-3xl font-bold my-8">Loading...</h1>
      </main>
    );
  }

  if (!roomCode || !userId) {
    return (
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center my-8">Quiz Room</h1>
        <RoomEntry onRoomJoin={handleRoomJoin} />
      </main>
    );
  }
  const generateQuiz = async () => {
    try {
      if (!quizSubject.trim()) {
        alert("Please enter a subject.");
        return;
      }

      const response = await fetch(
        "https://codingassistant.onrender.com/api/init-quiz",
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

  const renderContent = () => {
    switch (view) {
      case "roomEntry":
        return <RoomEntry onRoomJoin={handleRoomJoin} />;
      case "quizUpload":
        return isHost ? (
          <QuizUpload onQuizUpload={handleQuizUpload} roomCode={roomCode} />
        ) : (
          <div className="text-center p-4">
            <p className="text-red-500">Only hosts can upload quizzes.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setView("default")}
            >
              Back
            </button>
          </div>
        );
      case "quizRender":
        return <QuizRenderer roomCode={roomCode} userId={userId} />;
      case "generateAI":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-center">
                Generate Quiz via AI
              </h2>

              <input
                type="text"
                placeholder="Subject (e.g., Java)"
                value={quizSubject}
                onChange={(e) => setQuizSubject(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />

              <select
                value={quizDifficulty}
                onChange={(e) => setQuizDifficulty(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button
                className="w-full bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 transition"
                onClick={generateQuiz}
              >
                Generate Quiz
              </button>

              <button
                className="w-full mt-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                onClick={() => setView("default")}
              >
                Back
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-100 p-4 rounded-lg w-full max-w-md text-center mb-4">
              <p>
                <strong>Room Code:</strong> {roomCode}
              </p>
              <p>
                <strong>Role:</strong> {isHost ? "Host" : "Participant"}
              </p>
            </div>

            {isHost && (
              <div className="flex flex-col gap-2 w-full max-w-md">
                <button
                  className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  onClick={() => setView("quizUpload")}
                >
                  Upload Quiz (Manual)
                </button>
                <button
                  className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => setView("generateAI")}
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            <button
              className="w-full max-w-md p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setView("quizRender")}
            >
              Take Quiz
            </button>

            <button
              className="w-full max-w-md p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              onClick={handleExitRoom}
            >
              Exit Room
            </button>
          </div>
        );
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl ">
      <h1 className="text-3xl font-bold text-center my-8">Quiz Room</h1>
      {renderContent()}
    </main>
  );
}
