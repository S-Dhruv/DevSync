import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  MessageSquare,
  Send,
  LogOut,
  Users,
  ArrowDown,
  Clock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
const socket = io.connect("http://localhost:5000");
import axios from "axios";

const client = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch {
    return null;
  }
};

const Forums = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("DevSync User");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [leave, setLeave] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const nav = useNavigate();
  const code = localStorage.getItem("roomCode");
  const token = localStorage.getItem("token");
  const fetchMessages = async (roomCode) => {
    try {
      const response = await axios.post("http://localhost:5000/getMessage", {
        roomCode,
      });
      setChat(response.data);
      if (response.data.length > 0) {
        toast.success(`Loaded ${response.data.length} historical messages.`);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load message history.");
    }
  };

  useEffect(() => {
    const id = client(token);

    if (!code || !id) {
      toast.error("Please login and join a room first");
      nav("/");
      return;
    }

    setRoomCode(code);
    setUserId(id);

    const handleRoomMessages = (history) => {
      setChat(history);
      if (history.length > 0) {
        toast.success(`Loaded ${history.length} historical messages.`);
      }
    };

    const handleReceiveMessage = (payload) => {
      const senderId = payload.client;

      if (payload.tempId && senderId === id) {
        setChat((prev) => {
          return prev.map((msg) => {
            if (msg.tempId === payload.tempId) {
              return {
                ...payload,
                username: "You",
                tempId: undefined,
              };
            }
            return msg;
          });
        });
      } else {
        setChat((prev) => [...prev, payload]);
      }
    };

    socket.on("room-messages", handleRoomMessages);
    socket.on("text-message", handleReceiveMessage);

    socket.emit("join-room", { roomCode: code, userId: id });

    return () => {
      socket.off("room-messages", handleRoomMessages);
      socket.off("text-message", handleReceiveMessage);
    };
  }, [nav, code, token]);

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollHeight, scrollTop, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !userId || !roomCode) return;

    const tempId =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const messageContent = message.trim();

    const socketPayload = {
      code: roomCode,
      client: userId,
      message: messageContent,
      tempId: tempId,
    };

    // Perform Optimistic Update
    const localMessage = {
      message: messageContent,
      client: userId,
      username: "You",
      timestamp: new Date().toISOString(),
      tempId: tempId,
    };

    setChat((prev) => [...prev, localMessage]);

    socket.emit("text-message", socketPayload);

    setMessage("");
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { code: code, client: userId });
    localStorage.removeItem("roomCode");
    setRoomCode(null);
    localStorage.setItem("leave", true);
    toast.info("Leaving room...");
    setTimeout(() => {
      nav("/");
    }, 1000);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedMessages = chat.reduce((groups, message, index) => {
    const senderId = message.client || message.userId || "unknown";
    const isCurrentUser = senderId === userId;

    const prevMessage = chat[index - 1];
    const prevSenderId = prevMessage
      ? prevMessage.client || prevMessage.userId || "unknown"
      : null;
    const isSameSender = prevSenderId === senderId;

    if (isSameSender) {
      groups[groups.length - 1].messages.push(message);
    } else {
      groups.push({
        client: senderId,
        isCurrentUser: isCurrentUser,
        username: isCurrentUser
          ? "You"
          : message.username || senderId || "DevSync User",
        messages: [message],
      });
    }

    return groups;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <ToastContainer />
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-gray-700 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Room Chat</h1>
            <div className="flex items-center text-xs text-gray-300">
              <span>Room: {roomCode}</span>
            </div>
          </div>
        </div>
        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Exit Room</span>
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-[url('...')]"
      >
        {chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-blue-900/30 p-6 rounded-full mb-4">
              <MessageSquare className="h-12 w-12" />
            </div>
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm text-gray-500">Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`flex ${
                group.isCurrentUser ? "justify-end" : "justify-start"
              } mb-4`}
            >
              {!group.isCurrentUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-2 mt-1">
                  <span className="text-xs font-bold">
                    {group.username && group.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className={`max-w-[70%] flex flex-col gap-1`}>
                <div
                  className={`flex items-baseline mb-1 ${
                    group.isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="text-xs text-gray-400">
                    {group.username}
                  </span>
                </div>

                {group.messages.map((msg, msgIndex) => (
                  <div
                    key={msgIndex}
                    className={`
            relative px-4 py-3 shadow-md
            ${
              group.isCurrentUser
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto rounded-3xl"
                : "bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-3xl"
            }
            /* ... (omitted corner rounding classes for brevity) ... */
        `}
                  >
                    <p className="text-white break-words">{msg.message}</p>
                  </div>
                ))}
              </div>

              {group.isCurrentUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ml-2 mt-1">
                  <span className="text-xs font-bold">
                    {userId && userId.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div ref={messagesEndRef} />

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 p-4 shadow-lg">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            name="chat"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-gray-800 border border-gray-600 rounded-l-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={`
              px-6 py-3 rounded-r-md transition-colors flex items-center justify-center
              ${
                message.trim()
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forums;
