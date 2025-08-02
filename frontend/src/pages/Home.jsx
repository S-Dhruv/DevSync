import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import roomStore from "@/store/roomStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import CoolBackground from "../pages/CoolBackground.jsx";
import FakeTerminal from "../pages/FakeTerminal.jsx";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import FeaturePanels from "./FeaturesPanel.jsx";
import JoinCreate from "./join-create.jsx";
import Footer from "../pages/Footer.jsx";
const Home = () => {
  const nav = useNavigate();
  const [introDone, setIntroDone] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [titleText, setTitleText] = useState("");
  const fullTitle = "Its time to lock in";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const hasSeenIntro = localStorage.getItem("hasSeenIntro");

    if (hasSeenIntro !== "true") {
      setShowIntro(true);
    } else {
      setIntroDone(true);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) return;

    if (titleText.length < fullTitle.length) {
      const timeout = setTimeout(() => {
        setTitleText(fullTitle.slice(0, titleText.length + 1));
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      const timer = setTimeout(() => {
        setIntroDone(true);
        localStorage.setItem("hasSeenIntro", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [titleText, showIntro]);

  const goToDashboard = () => nav("/dashboard");
  const goToLogin = () => nav("/login");
  const goToSignup = () => nav("/signup");

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] relative">
      {/* Optional glowing background effect */}
      <div className="absolute w-60 h-60 rounded-full bg-purple-500 blur-3xl opacity-20 top-20 left-10 animate-pulse pointer-events-none"></div>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 z-10 relative">
        {!introDone ? (
          <>
            <h1 className="text-5xl md:text-6xl font-extrabold text-green-400 mb-6 transition-all duration-700 ease-in-out">
              {titleText}
            </h1>
            <FakeTerminal />
          </>
        ) : (
          <>
            {/* Header */}
            <div className="w-full px-4 max-w-7xl mx-auto mb-10 text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white">
                <span className="text-purple-400">Dev</span>Sync
                <span className="text-gray-200 text-2xl block mt-2 font-light">
                  – Sync in with your peers
                </span>
              </h1>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl gap-8 items-center">
              <div className="flex items-center justify-center">
                <CoolBackground />
              </div>
              <div className="text-center md:text-left px-4">
                <h2 className="text-2xl font-semibold text-gray-300 mb-4">
                  Start your DevSync journey
                </h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto md:mx-0">
                  Collaborate with peers, run real-time code, and boost your
                  productivity from one powerful platform.
                </p>

                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start md:justify-start justify-center">
                  <Button
                    onClick={goToDashboard}
                    variant="contained"
                    startIcon={<MeetingRoomRoundedIcon />}
                    sx={{
                      backgroundColor: "#7c3aed",
                      "&:hover": { backgroundColor: "#6d28d9" },
                      color: "white",
                      fontWeight: "bold",
                      paddingX: 3,
                      paddingY: 1.5,
                      fontSize: "1rem",
                      borderRadius: "0.75rem",
                    }}
                  >
                    Go to Dashboard
                  </Button>

                  <Button
                    onClick={goToLogin}
                    variant="outlined"
                    sx={{
                      borderColor: "#10b981",
                      color: "#10b981",
                      "&:hover": {
                        borderColor: "#059669",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                      },
                      fontWeight: "bold",
                      paddingX: 3,
                      paddingY: 1.5,
                      fontSize: "1rem",
                      borderRadius: "0.75rem",
                    }}
                  >
                    Login
                  </Button>

                  <Button
                    onClick={goToSignup}
                    variant="outlined"
                    startIcon={<AddRoundedIcon />}
                    sx={{
                      borderColor: "#3b82f6",
                      color: "#3b82f6",
                      "&:hover": {
                        borderColor: "#2563eb",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      },
                      fontWeight: "bold",
                      paddingX: 3,
                      paddingY: 1.5,
                      fontSize: "1rem",
                      borderRadius: "0.75rem",
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>

            {/* Scroll Prompt */}
            <div className="mt-12 animate-bounce text-gray-400 text-sm text-center">
              ↓ Scroll down to explore features
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      {introDone && (
        <div className="pt-10 pb-32 px-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mt-10 mb-6 animate-pulse">
            Features which <span className="text-purple-400">DevSync</span>{" "}
            provides
          </h1>
          <FeaturePanels />
        </div>
      )}

      <ToastContainer />
      <Footer/>
    </div>
  );
};

export default Home;
