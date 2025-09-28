import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import CodeIcon from "@mui/icons-material/Code";
import QuizIcon from "@mui/icons-material/Quiz";
import ForumIcon from "@mui/icons-material/Forum";
import VideoChatRoundedIcon from "@mui/icons-material/VideoChatRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogged, setIsLogged] = useState(
    localStorage.getItem("token") !== null
  );

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogOut = () => {
    localStorage.removeItem("isLogin");
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    setIsLogged(false);
    navigate("/");
  };

  const navItems = [
    { name: "Home", link: "/dashboard", icon: <HomeIcon /> },
    { name: "Resources", link: "/docs", icon: <ArticleIcon /> },
    { name: "Board", link: "/editor", icon: <EditRoundedIcon /> },
    { name: "Collab", link: "/collab", icon: <CodeIcon /> },
    { name: "Quiz", link: "/test", icon: <QuizIcon /> },
    { name: "Chat Room", link: "/forums", icon: <ForumIcon /> },
    { name: "Video Call", link: "/videoCall", icon: <VideoChatRoundedIcon /> },
  ];

  const hideNavbarPaths = ["/", "/signup", "/login"];
  if (hideNavbarPaths.includes(location.pathname)) return null;

  const handleNavigation = (path) => navigate(path);

  return (
    <>
      <motion.div
        initial={{ width: "60px" }}
        animate={{
          width: isOpen ? "200px" : "60px",
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        className="fixed top-0 left-0 h-screen bg-[#1e1e1e] text-white z-40 flex flex-col shadow-lg"
      >
        <div className="flex justify-center items-center p-2 border-b border-gray-800">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            {isOpen ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-6">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.link);
                  }}
                  className={cn(
                    "flex items-center transition-colors",
                    isOpen ? "px-4" : "justify-center",
                    location.pathname === item.link
                      ? "text-purple-400 "
                      : "text-gray-400 hover:text-white"
                  )}
                  title={!isOpen ? item.name : ""}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isOpen && <span className="ml-3 text-sm">{item.name}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-800 flex flex-col gap-3">
          <button
            onClick={() => navigate("/profile")}
            className={cn(
              "flex items-center transition-colors w-full",
              isOpen ? "px-4 py-2" : "justify-center py-2",
              "text-green-400 hover:text-green-300"
            )}
          >
            <span className="text-xl">
              <PersonIcon />
            </span>
            {isOpen && <span className="ml-3 text-sm">Profile</span>}
          </button>

          <button
            onClick={handleLogOut}
            className={cn(
              "flex items-center transition-colors w-full",
              isOpen ? "px-4 py-2" : "justify-center py-2",
              "text-red-400 hover:text-red-300"
            )}
          >
            <span className="text-xl">
              <LogoutRoundedIcon />
            </span>
            {isOpen && <span className="ml-3 text-sm">Log Out</span>}
          </button>
        </div>
      </motion.div>

      <div
        className="min-h-screen transition-all duration-300"
        style={{ paddingLeft: isOpen ? "200px" : "60px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default Sidebar;
