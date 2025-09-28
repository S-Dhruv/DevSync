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
// const  socket = io.connect("http://localhost:5000");

const Forums = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [leave, setLeave] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const nav = useNavigate();
  const code = localStorage.getItem("roomCode");
  const token = localStorage.getItem("token");

  const client = ()=>{
    try{
      const decoded = jwtDecode(token);
      return decoded.userId;
    }
    catch{
      return null;
    }
  }

  useEffect(() => {
    if (!code || client == null) {
      toast.error("Please login and join a room first");
      nav("/");
    } else {
      setRoomCode(code);
      setUser(client);
      socket.emit("join-room", { roomCode: code, userId: client });
      
      // TODO : chat from db only
      // const savedChat = localStorage.getItem(`chat_${code}`);
      // if (savedChat) {
      //   setChat(JSON.parse(savedChat));
      // }
    }

  }, []);

  useEffect(() => {
    setLeave(localStorage.getItem("leave"));
    // make db call
    const handleReceiveMessage = (payload) => {
      setChat((prev) => {
        if (
          prev.some(
            (msg) =>
              msg.message === payload.message && msg.client === payload.client
          )
        ) {
          return prev;
        }
        const updatedChat = [
          ...prev,
          { ...payload, timestamp: new Date().toISOString() },
        ];
        // localStorage.setItem(`chat_${roomCode}`, JSON.stringify(updatedChat));
        return updatedChat;
      });
    };

    socket.on("text-message", handleReceiveMessage);

    return () => socket.off("text-message", handleReceiveMessage);
  }, [roomCode]);

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("text-message", {
        message,
        client: user,
        code: roomCode,
      });
      setMessage("");
    }
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { roomCode: code, userId: client });
    localStorage.removeItem("roomCode");
    setRoomCode(null);
    localStorage.setItem("leave", true);
    setTimeout(() => {
      nav("/");
    }, 2000);
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
    const prevMessage = chat[index - 1];
    const isSameSender = prevMessage && prevMessage.client === message.client;

    if (isSameSender) {
      groups[groups.length - 1].messages.push(message);
    } else {
      groups.push({
        client: message.client,
        isCurrentUser: message.client === user,
        messages: [message],
      });
    }

    return groups;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-gray-700 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Room Chat</h1>
            <div className="flex items-center text-xs text-gray-300">
              {/* <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {onlineUsers} online
              </span> */}
              {/* <span className="mx-2">•</span> */}
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

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBmaWxsPSJub25lIiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iLjIiLz4KPC9zdmc+')]"
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
                    {group.client.charAt(0).toUpperCase()}
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
                    {group.isCurrentUser ? "You" : group.client}
                  </span>
                </div>

                {group.messages.map((msg, msgIndex) => (
                  <div
                    key={msgIndex}
                    className={`
                      relative px-4 py-3 rounded-2xl shadow-md
                      ${
                        group.isCurrentUser
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto"
                          : "bg-gradient-to-r from-gray-700 to-gray-800 text-white"
                      }
                      ${
                        msgIndex === 0 && group.isCurrentUser
                          ? "rounded-tr-sm"
                          : ""
                      }
                      ${
                        msgIndex === 0 && !group.isCurrentUser
                          ? "rounded-tl-sm"
                          : ""
                      }
                    `}
                  >
                    <p className="text-white break-words">{msg.message}</p>
                    <span className="text-xs text-gray-300 flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))}
              </div>

              {group.isCurrentUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ml-2 mt-1">
                  <span className="text-xs font-bold">
                    {user.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {/* Message Input */}
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
