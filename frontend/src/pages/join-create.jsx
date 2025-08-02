import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import { LogOut, ClipboardCopy, CheckCircle } from "lucide-react";
import roomStore from "@/store/roomStore";
import axios from "axios";

const socket = io.connect("https://codingassistant.onrender.com");

const JoinCreate = () => {
  const { join, create } = roomStore();
  const [roomCode, setRoomCode] = useState("");
  const [email, setEmail] = useState("");
  const code = localStorage.getItem("roomCode");
  const userId = localStorage.getItem("userId");

  const [userCount, setUserCount] = useState(1);
  const [ping, setPing] = useState("...");
  const [funFactIndex, setFunFactIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Pomodoro State
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 mins
  const [isRunning, setIsRunning] = useState(false);

  const funFacts = [
    "The first computer bug was an actual moth stuck in a Harvard Mark II in 1947!",
    "The original name for Windows was Interface Manager.",
    "Typewriters were the inspiration for modern QWERTY keyboards.",
    "The first website is still online: info.cern.ch",
    "Email existed before the world wide web!",
  ];

  useEffect(() => {
    if (code) setRoomCode(code);

    socket.on("room-users", (count) => {
      setUserCount(count);
    });

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
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && pomodoroTime > 0) {
      timer = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, pomodoroTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const togglePomodoro = () => setIsRunning((prev) => !prev);

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const result = await join(roomCode);
      if (result.success) {
        setTimeout(() => {
          console.log("Emitting join-room:", { roomCode, userId });
          socket.emit("join-room", { roomCode, userId });
          localStorage.setItem("roomCode", roomCode);
          socket.emit("get-room-history", { roomCode, userId });
          toast.success(`You have successfully joined room ${roomCode}`);
        }, 500);
      }
    } catch (error) {
      toast.error("Please check your room code");
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await create();
    if (result.message === "Please login first") {
      toast.error("Please login first");
    } else {
      let room = result.roomCode;

      setTimeout(() => {
        toast.success("Please reload to receive your code");
        socket.emit("join-room", { roomCode: room, userId });
        socket.emit("get-room-history", { roomCode: room, userId });
        console.log("room");
      }, 1000);
      await navigator.clipboard.writeText(room);
    }
  };

  const handleSend = async () => {
    try {
      const res = await axios.post(
        "https://codingassistant.onrender.com/send-code",
        { roomCode, email },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.message === "Email sent successfully") {
        toast.success("Email sent!");
      } else {
        toast.error("Sending failed");
      }
    } catch {
      toast.error("Failed to send email");
    }
  };

  const leaveRoom = () => {
    if (!roomCode) return toast.error("You already left!");
    socket.emit("leave-room", { code: roomCode, client: userId });
    localStorage.removeItem("roomCode");
    setRoomCode("");
    toast.success("Room exited");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center px-4 sm:px-8 py-8 bg-[#171717] min-h-screen w-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        {/* 📊 Room Stats + Pomodoro */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between h-[450px] overflow-y-auto">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-bold text-purple-300">📊 Room Stats</h3>
            <p className="text-lg text-white">📶 Ping: {ping}</p>
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <h4 className="text-md font-semibold text-yellow-400 mb-2">
                💡 Fun Fact
              </h4>
              <p className="italic text-gray-300">{funFacts[funFactIndex]}</p>
            </div>

            {/* Pomodoro Timer */}
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <h4 className="text-md font-semibold text-green-400 mb-2">
                ⏱️ Pomodoro Timer
              </h4>
              <p className="text-white text-2xl font-mono">
                {formatTime(pomodoroTime)}
              </p>
              <Button
                variant="outlined"
                onClick={togglePomodoro}
                className="mt-2 text-white border-white"
              >
                {isRunning ? "Pause" : "Start"}
              </Button>
            </div>

            {/* Room Settings Panel */}
            {roomCode && (
              <div className="mt-4 bg-gray-700 p-4 rounded-lg text-center w-full">
                <h4 className="text-md font-semibold text-blue-400 mb-2">
                  ⚙️ Room Settings
                </h4>
                <p className="text-white text-sm">Room Code:</p>
                <p className="text-green-300 font-mono text-lg">{roomCode}</p>
                <button
                  onClick={handleCopy}
                  className="mt-2 flex items-center justify-center text-white gap-2 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-all"
                >
                  {copied ? (
                    <CheckCircle size={18} />
                  ) : (
                    <ClipboardCopy size={18} />
                  )}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create/Join Form */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between h-[450px]">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-purple-400 text-center">
              Join or Create a Room
            </h2>

            <Button
              startIcon={<AddRoundedIcon />}
              variant="contained"
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              fullWidth
            >
              Create Room
            </Button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white w-full"
              />
              <Button
                startIcon={<MeetingRoomRoundedIcon />}
                onClick={handleJoin}
                className="bg-green-600 hover:bg-green-700 text-white"
                variant="contained"
              >
                Join
              </Button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter email to send code"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white w-full"
              />
              <button
                onClick={handleSend}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={leaveRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md w-40"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Exit Room</span>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mt-12 bg-gray-800 rounded-xl p-6 shadow-md text-white">
        {/* --- User Flow --- */}
        <h3 className="text-2xl font-semibold text-purple-400 mb-6 text-center">
          🚀 How It Works (User Flow)
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {[
            {
              title: "Create or Join Room",
              desc: "Start by creating a new room or entering an existing room code.",
            },
            {
              title: "Share the Code",
              desc: "Invite others to collaborate by sharing the room code via email.",
            },
            {
              title: "Live Collaboration",
              desc: "Edit code, chat, and interact in real time with room members.",
            },
            {
              title: "Track Room History",
              desc: "Keep track of who joins/leaves and when it happens.",
            },
          ].map((step, idx, arr) => (
            <div
              className="flex flex-col items-center text-center relative w-full md:w-1/4"
              key={idx}
            >
              <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2">
                {idx + 1}
              </div>
              <h4 className="font-semibold text-lg">{step.title}</h4>
              <p className="text-sm text-gray-300">{step.desc}</p>

              {/* Arrow */}
              {idx < arr.length - 1 && (
                <div className="hidden md:block absolute right-[-12%] top-5 text-purple-400 text-2xl">
                  ➜
                </div>
              )}
              {/* Mobile Arrow */}
              {idx < arr.length - 1 && (
                <div className="block md:hidden text-purple-400 text-xl mt-2">
                  ⬇
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- Internal Working --- */}
        <h3 className="text-2xl font-semibold text-purple-400 my-8 text-center">
          ⚙️ Internal Working (Socket Flow)
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {[
            {
              title: "Socket Connects",
              desc: "Client establishes a connection with the backend server using Socket.IO.",
            },
            {
              title: "Join Room",
              desc: "User emits a join-room event with roomCode and userId to the server.",
            },
            {
              title: "Broadcast + Save",
              desc: "Server adds user to room, updates roomHistory, and broadcasts to all clients.",
            },
            {
              title: "Emit Room History",
              desc: "Client emits get-room-history → server replies with room-history event.",
            },
          ].map((step, idx, arr) => (
            <div
              className="flex flex-col items-center text-center relative w-full md:w-1/4"
              key={idx}
            >
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2">
                {idx + 1}
              </div>
              <h4 className="font-semibold text-lg">{step.title}</h4>
              <p className="text-sm text-gray-300">{step.desc}</p>

              {/* Arrow */}
              {idx < arr.length - 1 && (
                <div className="hidden md:block absolute right-[-12%] top-5 text-blue-400 text-2xl">
                  ➜
                </div>
              )}
              {/* Mobile Arrow */}
              {idx < arr.length - 1 && (
                <div className="block md:hidden text-blue-400 text-xl mt-2">
                  ⬇
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default JoinCreate;
