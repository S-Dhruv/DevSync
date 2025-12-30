import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
    SiMongodb, SiExpress, SiReact, SiNodedotjs,
    SiSocketdotio, SiWebrtc, SiDocker
} from "react-icons/si";
import { FaAws } from "react-icons/fa";

const RippleIntro = ({ onDone }) => {
    useEffect(() => {
        // Reduced to 800ms for a punchy entrance
        const t = setTimeout(onDone, 800);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className="fixed inset-0 z-50 bg-[#0e0e11] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 ripple-mask" />
        </div>
    );
};

const DevWidget = ({ className }) => {
    return (
        <div className={`w-64 h-64 border border-white/10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#14141c] to-[#0e0e11] transition-all duration-500 hover:rotate-2 hover:scale-[1.05] hover:border-purple-500 group shadow-2xl ${className}`}>
            <div className="text-sm font-mono text-gray-400 transition-colors duration-500 group-hover:text-emerald-400 p-6">
                <p>&gt; devsync.init()</p>
                <p>&gt; socket.connect()</p>
                <p>&gt; webrtc.ready()</p>
                <p>&gt; docker.spawn()</p>
                <div className="h-[1px] w-full bg-white/5 my-3" />
                <p className="text-purple-400">✔ infrastructure_online</p>
                <p className="text-emerald-500 animate-pulse">● listening...</p>
            </div>
        </div>
    );
};

const Hero = () => {
    const nav = useNavigate();
    const [step, setStep] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        // Faster step transitions to match the new intro speed
        const timer1 = setTimeout(() => setStep(1), 400);
        const timer2 = setTimeout(() => setStep(2), 900);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
            <div className={`flex flex-col md:flex-row items-center transition-all duration-700 ease-out gap-12 
                ${step >= 2 ? "translate-x-0" : "translate-y-10"}`}>

                <div className={`transition-all duration-700 delay-200 ${step >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
                    <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-6">
                        <span className="text-purple-500">Dev</span>Sync
                    </h1>
                    <p className="text-gray-400 text-xl max-w-lg mb-8 leading-relaxed">
                        The ultimate collaborative workspace for developers.
                        Real-time code editing, P2P video, and containerized execution.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start md:justify-start justify-center">
                        <Button onClick={() => nav("/dashboard")} variant="contained" disabled={!isLoggedIn} startIcon={<MeetingRoomRoundedIcon />}
                                sx={{ backgroundColor: "#7c3aed", "&:hover": { backgroundColor: "#6d28d9" }, "&.Mui-disabled": { backgroundColor: "rgba(124, 58, 237, 0.3)", color: "rgba(255,255,255,0.3)" }, fontWeight: "bold", paddingX: 4, paddingY: 2, borderRadius: "0.75rem" }}>
                            Go to Dashboard
                        </Button>
                        {!isLoggedIn && (
                            <>
                                <Button onClick={() => nav("/login")} variant="outlined" sx={{ borderColor: "#10b981", color: "#10b981", "&:hover": { borderColor: "#059669", backgroundColor: "rgba(16, 185, 129, 0.1)" }, fontWeight: "bold", paddingX: 4, paddingY: 2, borderRadius: "0.75rem" }}>Login</Button>
                                <Button onClick={() => nav("/signup")} variant="outlined" startIcon={<AddRoundedIcon />} sx={{ borderColor: "#3b82f6", color: "#3b82f6", "&:hover": { borderColor: "#2563eb", backgroundColor: "rgba(59, 130, 246, 0.1)" }, fontWeight: "bold", paddingX: 4, paddingY: 2, borderRadius: "0.75rem" }}>Sign Up</Button>
                            </>
                        )}
                    </div>
                </div>
                <div className={`transition-all duration-700 ${step >= 1 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-[100px] scale-50"}`}>
                    <DevWidget />
                </div>
            </div>
        </section>
    );
};

const FeatureCards = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const sectionRef = useRef(null);

    const features = [
        { title: "Collaborative Coding", icon: "[<>]", desc: "Multiplayer code editing with sub-second latency." },
        { title: "Docker Execution", icon: "{🐳}", desc: "Isolated environments to run and test code safely." },
        { title: "WebRTC Video/Voice", icon: "(🎧)", desc: "P2P low-latency communication for team huddles." },
        { title: "Real-time Texting", icon: "<💬>", desc: "Integrated chat rooms synced with your session." },
        { title: "AI Quiz Generator", icon: "[AI?]", desc: "Leverage AI to test your knowledge based on your project." },
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const progress = Math.min(Math.max((windowHeight - rect.top) / (rect.height), 0), 1);
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section ref={sectionRef} className="py-40 bg-[#0e0e11] min-h-[120vh]">
            <h2 className="text-center text-4xl font-bold mb-32 text-white/90">Platform Infrastructure</h2>
            <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {features.slice(0, 3).map((f, i) => (
                        <Card key={i} f={f} i={i} scrollProgress={scrollProgress} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {features.slice(3, 5).map((f, i) => (
                        <Card key={i + 3} f={f} i={i + 3} scrollProgress={scrollProgress} isSecondRow />
                    ))}
                </div>
            </div>
        </section>
    );
};

const Card = ({ f, i, scrollProgress, isSecondRow }) => {
    const delay = i * 0.08;
    const cardProgress = Math.min(Math.max((scrollProgress - delay) * 2, 0), 1);
    const rowPosition = isSecondRow ? (i === 3 ? 0.5 : 1.5) : (i % 3);
    const rotation = (rowPosition - 1) * 15 * (1 - cardProgress);
    const translateY = (1 - cardProgress) * 100;

    return (
        <div
            className="p-8 rounded-2xl bg-[#14141c] border border-white/5 shadow-2xl transition-all duration-200"
            style={{
                transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
                opacity: cardProgress,
            }}
        >
            <div className="text-purple-400 font-mono text-2xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
        </div>
    );
};

const TechStack = () => {
    const tech = [
        { name: "MongoDB", icon: <SiMongodb />, color: "hover:text-green-500" },
        { name: "Express", icon: <SiExpress />, color: "hover:text-white" },
        { name: "React", icon: <SiReact />, color: "hover:text-cyan-400" },
        { name: "Node.js", icon: <SiNodedotjs />, color: "hover:text-green-400" },
        { name: "Socket.IO", icon: <SiSocketdotio />, color: "hover:text-white" },
        { name: "WebRTC", icon: <SiWebrtc />, color: "hover:text-orange-500" },
        { name: "Docker", icon: <SiDocker />, color: "hover:text-blue-500" },
        { name: "AWS", icon: <FaAws />, color: "hover:text-yellow-500" },
    ];

    return (
        <section className="py-32 border-t border-white/5 bg-[#0e0e11]">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <p className="text-purple-500 font-mono text-xs tracking-widest uppercase mb-4">Core Technologies</p>
                <h3 className="text-4xl font-bold mb-20">The DevSync Ecosystem</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
                    {tech.map((t, i) => (
                        <div key={i} className={`flex flex-col items-center gap-5 text-gray-500 transition-all duration-300 ${t.color} group cursor-pointer`}>
                            <div className="text-6xl group-hover:scale-125 transition-transform duration-500">{t.icon}</div>
                            <span className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100">{t.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    const [introDone, setIntroDone] = useState(false);
    return (
        <div className="bg-[#0e0e11] text-white selection:bg-purple-500/30">
            {!introDone && <RippleIntro onDone={() => setIntroDone(true)} />}
            {introDone && (
                <main className="animate-in fade-in duration-700">
                    <Hero />
                    <FeatureCards />
                    <TechStack />
                </main>
            )}
            <style>{`
                @keyframes ripple {
                  0% { transform: scale(0); opacity: 0; }
                  20% { opacity: 1; }
                  100% { transform: scale(6); opacity: 0; }
                }
                .ripple-mask {
                  background: radial-gradient(
                    circle, 
                    rgba(124, 58, 237, 0.8) 0%, 
                    rgba(124, 58, 237, 0.3) 30%, 
                    transparent 70%
                  );
                  animation: ripple 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default Home;