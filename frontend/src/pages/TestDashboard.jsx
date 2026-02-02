import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function TestDashboard() {
  const nav = useNavigate();
  const BASE = `https://codingassistant.onrender.com`;
  const [testLinks, setTestLinks] = useState([]);
  const [roomCode, setRoomCode] = useState(
    localStorage.getItem("roomCode") || "",
  );

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const resp = await axios.post("https://codingassistant.onrender.com/api/get-tests", {
          roomCode: roomCode,
        });
        setTestLinks(resp.data.tests);
      } catch (err) {
        toast.error(err.message || "Failed to fetch test links");
      }
    };

    fetchLinks();
  }, [roomCode]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">
      <ToastContainer theme="dark" position="top-right" />
      <h1 className="text-4xl font-bold mb-6 text-purple-400">
        Test Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {testLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => nav(`/platform/${link._id}`)}
            className="bg-slate-800 hover:bg-purple-600 transition-colors duration-300 rounded-lg p-6 flex items-center justify-center text-lg font-semibold shadow-lg hover:scale-105 transform active:scale-95"
          >
            {link.testName}
          </button>
        ))}
        {testLinks.length === 0 && (
          <p className="col-span-full text-center text-slate-400 italic">
            No tests available yet.
          </p>
        )}
      </div>
    </div>
  );
}
