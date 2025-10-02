import React, { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LogOut,
  ClipboardCopy,
  CheckCircle,
  Play,
  Pause,
  Plus,
  ArrowRight,
  BrainCircuit,
  Rocket,
  Users,
  Settings,
} from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const socket = io.connect("https://codingassistant.onrender.com/");

const PomodoroCircle = ({ time, duration, isRunning, onToggle }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = time / duration;
  const offset = circumference * (1 - progress);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-slate-700"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-purple-500 transition-all duration-1000 ease-linear"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className="z-10 flex flex-col items-center">
        <span className="text-3xl font-mono text-white">
          {formatTime(time)}
        </span>
        <button
          onClick={onToggle}
          className="mt-2 text-slate-400 hover:text-white transition-colors"
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </div>
  );
};

const JoinCreate = () => {
  const [roomCode, setRoomCode] = useState("");
  const [email, setEmail] = useState("");
  const [userCount, setUserCount] = useState(1);
  const [ping, setPing] = useState("...");
  const [copied, setCopied] = useState(false);

  const POMODORO_DURATION = 1500;
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);

  const funFacts = useMemo(
    () => [
      "The first computer bug was an actual moth stuck in a Harvard Mark II in 1947!",
      "The original name for Windows was Interface Manager.",
      "The first website is still online: info.cern.ch",
      "Email existed before the World Wide Web!",
    ],
    []
  );
  const [funFactIndex, setFunFactIndex] = useState(0);

  useEffect(() => {
    const code = localStorage.getItem("roomCode");
    if (code) setRoomCode(code);

    // socket.on("room-users", (count) => setUserCount(count));

    const pingInterval = setInterval(() => {
      const start = Date.now();
      socket.emit("ping-check", () => {
        const latency = Date.now() - start;
        setPing(`${latency}ms`);
      });
    }, 5000);

    const funInterval = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 8000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(funInterval);
      // socket.off("room-users");
    };
  }, [funFacts.length]);

  useEffect(() => {
    let timer;
    if (isRunning && pomodoroTime > 0) {
      timer = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      toast.success("Pomodoro session complete!");
      setIsRunning(false);
      setPomodoroTime(POMODORO_DURATION);
    }
    return () => clearInterval(timer);
  }, [isRunning, pomodoroTime]);

  const togglePomodoro = () => setIsRunning((prev) => !prev);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCode) return toast.error("Please enter a room code.");
    try {
      socket.emit("join-room", {
        roomCode,
        userId: jwtDecode(localStorage.getItem("token")).userId,
      });
      localStorage.setItem("roomCode", roomCode);
      toast.success(`Successfully joined room: ${roomCode}`);
    } catch (error) {
      toast.error("Failed to join room. Please check the code.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const newRoomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    setRoomCode(newRoomCode);
    localStorage.setItem("roomCode", newRoomCode);
    socket.emit("join-room", {
      roomCode: newRoomCode,
      userId: jwtDecode(localStorage.getItem("token")).userId,
    });
    // add a check
    toast.success(`Created and joined new room: ${newRoomCode}`);
    handleCopy(newRoomCode);
  };

  const handleSend = async () => {
    if (!email || !roomCode)
      return toast.warn("Please enter a room code and email.");
    try {
      const res = await axios.post(
        "https://codingassistant.onrender.com//send-code",
        {
          roomCode,
          email,
        }
      );
      toast.success(res.data.message || "Email sent successfully!");
    } catch {
      toast.error("Failed to send email.");
    }
  };

  const leaveRoom = () => {
    if (!roomCode) return toast.error("You are not in a room.");
    socket.emit("leave-room", {
      code: roomCode,
      client: localStorage.getItem("userId"),
    });
    localStorage.removeItem("roomCode");
    setRoomCode("");
    toast.success("You have left the room.");
  };

  const handleCopy = async (codeToCopy) => {
    const textToCopy = codeToCopy || roomCode;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const flowSteps = [
    {
      icon: <Plus />,
      title: "Create or Join",
      desc: "Start a new room or enter an existing room code.",
    },
    {
      icon: <Users />,
      title: "Share Code",
      desc: "Invite others by sharing the room code via email.",
    },
    {
      icon: <Rocket />,
      title: "Collaborate",
      desc: "Edit code, chat, and interact in real-time.",
    },
    {
      icon: <Settings />,
      title: "Tuning",
      desc: "Tune it to the way you want to collaborate.",
    },
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen w-full p-4 sm:p-8">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col gap-6">
            <h3 className="text-xl font-bold text-purple-400 text-center">
              📊 Room Dashboard
            </h3>
            <div className="flex flex-col items-center">
              <PomodoroCircle
                time={pomodoroTime}
                duration={POMODORO_DURATION}
                isRunning={isRunning}
                onToggle={togglePomodoro}
              />
            </div>
            <div className="bg-slate-900/70 p-4 rounded-lg text-center">
              <h4 className="font-semibold text-yellow-400 mb-2 flex items-center justify-center gap-2">
                <BrainCircuit size={18} /> Fun Fact
              </h4>
              <p className="italic text-slate-300 text-sm">
                {funFacts[funFactIndex]}
              </p>
            </div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-slate-400 text-sm">Ping</p>
                <p className="text-lg font-mono text-green-400">{ping}</p>
              </div>
              {/* <div>
                <p className="text-slate-400 text-sm">Users</p>
                <p className="text-lg font-mono text-green-400">{userCount}</p>
              </div> */}
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              Join or Create a Collaboration Room
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleCreate}
                className="w-full flex items-center justify-center gap-2 p-3 font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} /> Create New Room
              </button>
              <div className="flex items-center gap-2">
                <div className="w-full h-px bg-slate-700"></div>
                <span className="text-slate-500 text-xs font-semibold">OR</span>
                <div className="w-full h-px bg-slate-700"></div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  onClick={handleJoin}
                  className="px-6 py-3 font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all"
                >
                  Join
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter friend's email to send code"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  onClick={handleSend}
                  className="px-6 py-3 font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-all"
                >
                  Send
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={() => handleCopy()}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <ClipboardCopy size={18} />
                )}
                {copied ? "Code Copied!" : "Copy Room Code"}
              </button>
              <button
                onClick={leaveRoom}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} /> Exit Current Room
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {flowSteps.map((step, idx) => (
              <div
                key={idx}
                className="text-center p-4 rounded-lg transition-all duration-300 hover:bg-slate-800 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {step.icon}
                </div>
                <h4 className="font-bold text-lg text-white mb-1">
                  {step.title}
                </h4>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreate;
