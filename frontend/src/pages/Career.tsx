import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/context/ThemeContext";
import { Briefcase, Target, Award, Rocket, CheckCircle2, Circle, Plus, Activity, ExternalLink, Flame } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Career() {
  const { themeColors, theme } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Coding platform streaks (saved locally)
  const [platformStreaks, setPlatformStreaks] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("vitacore_platform_streaks");
      return saved ? JSON.parse(saved) : {
        leetcode: 0, codingninjas: 0, gfg: 0, hackerrank: 0, codechef: 0, codeforces: 0,
        kaggle: 0, fastai: 0, huggingface: 0, coursera: 0, freecodecamp: 0, theodinproject: 0
      };
    } catch { return { leetcode: 0, codingninjas: 0, gfg: 0, hackerrank: 0, codechef: 0, codeforces: 0,
      kaggle: 0, fastai: 0, huggingface: 0, coursera: 0, freecodecamp: 0, theodinproject: 0 }; }
  });
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editStreak, setEditStreak] = useState<string>("");
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // Custom user-defined platforms
  const [customPlatforms, setCustomPlatforms] = useState<Array<{key: string; name: string; url: string; emoji: string; accent: string; bg: string; border: string; desc: string}>>(() => {
    try {
      const saved = localStorage.getItem("vitacore_custom_platforms");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState({ name: "", url: "", desc: "" });

  // Study Path State
  const [selectedPath, setSelectedPath] = useState("all");

  const codingPlatforms = [
    { key: "leetcode",       name: "LeetCode",           url: "https://leetcode.com",                emoji: "⚡", accent: "#FFA116", bg: "rgba(255,161,22,0.08)",  border: "rgba(255,161,22,0.2)",  desc: "DSA & Interview Prep" },
    { key: "codingninjas",   name: "Coding Ninjas",       url: "https://www.naukri.com/code360",      emoji: "🥷", accent: "#FF4B45", bg: "rgba(255,75,69,0.08)",   border: "rgba(255,75,69,0.2)",   desc: "Courses & Contests" },
    { key: "gfg",            name: "GeeksforGeeks",       url: "https://www.geeksforgeeks.org",       emoji: "🌿", accent: "#2F8D46", bg: "rgba(47,141,70,0.08)",   border: "rgba(47,141,70,0.2)",   desc: "CS Fundamentals" },
    { key: "hackerrank",     name: "HackerRank",          url: "https://www.hackerrank.com",          emoji: "💻", accent: "#00EA64", bg: "rgba(0,234,100,0.08)",   border: "rgba(0,234,100,0.2)",   desc: "Skill Certifications" },
    { key: "codechef",       name: "CodeChef",            url: "https://www.codechef.com",            emoji: "👨‍🍳", accent: "#F9A12E", bg: "rgba(249,161,46,0.08)", border: "rgba(249,161,46,0.2)",  desc: "Competitive Coding" },
    { key: "codeforces",     name: "Codeforces",          url: "https://codeforces.com",              emoji: "🏆", accent: "#3B82F6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",  desc: "CP & Rounds" },
    { key: "kaggle",         name: "Kaggle",              url: "https://www.kaggle.com",              emoji: "🐍", accent: "#20BEFF", bg: "rgba(32,190,255,0.08)",  border: "rgba(32,190,255,0.2)",  desc: "ML Competitions & Datasets" },
    { key: "fastai",         name: "fast.ai",             url: "https://www.fast.ai",                 emoji: "🧠", accent: "#FF6B35", bg: "rgba(255,107,53,0.08)",  border: "rgba(255,107,53,0.2)",  desc: "Practical Deep Learning" },
    { key: "huggingface",    name: "Hugging Face",        url: "https://huggingface.co",              emoji: "🤗", accent: "#FFD21E", bg: "rgba(255,210,30,0.08)",  border: "rgba(255,210,30,0.2)",  desc: "AI Models & NLP" },
    { key: "coursera",       name: "Coursera",            url: "https://www.coursera.org",            emoji: "🎓", accent: "#0056D3", bg: "rgba(0,86,211,0.08)",    border: "rgba(0,86,211,0.2)",    desc: "Online Courses & Certificates" },
    { key: "freecodecamp",   name: "freeCodeCamp",        url: "https://www.freecodecamp.org",        emoji: "🔥", accent: "#A3A3A3", bg: "rgba(163,163,163,0.08)", border: "rgba(163,163,163,0.2)", desc: "Web Dev Projects" },
    { key: "theodinproject", name: "The Odin Project",    url: "https://www.theodinproject.com",      emoji: "⚔️", accent: "#D23232", bg: "rgba(210,50,50,0.08)",   border: "rgba(210,50,50,0.2)",   desc: "Full Stack Web Dev" },
  ];

  // Merge built-in + custom platforms
  const allPlatforms = [...codingPlatforms, ...customPlatforms];

  // Filter platforms based on chosen study path
  const filteredPlatforms = allPlatforms.filter(p => {
    if (selectedPath === "all") return true;
    if (selectedPath === "competitive") {
      return ["leetcode", "codingninjas", "codechef", "codeforces"].includes(p.key);
    }
    if (selectedPath === "fundamentals") {
      return ["leetcode", "codingninjas", "gfg", "freecodecamp"].includes(p.key);
    }
    if (selectedPath === "software") {
      return ["hackerrank", "leetcode", "freecodecamp", "theodinproject", "coursera"].includes(p.key);
    }
    if (selectedPath === "ml") {
      return ["kaggle", "fastai", "huggingface", "coursera", "leetcode"].includes(p.key);
    }
    if (selectedPath === "custom") {
      return customPlatforms.some(cp => cp.key === p.key);
    }
    return true;
  });

  const updateStreak = async (key: string, value: number) => {
    const updated = { ...platformStreaks, [key]: value };
    setPlatformStreaks(updated);
    localStorage.setItem("vitacore_platform_streaks", JSON.stringify(updated));
    setEditingPlatform(null);
  };

  const addCustomPlatform = () => {
    if (!newPlatform.name.trim() || !newPlatform.url.trim()) return;
    const key = newPlatform.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (allPlatforms.some(p => p.key === key)) return; // prevent duplicate
    const accents = ["#A78BFA", "#34D399", "#F472B6", "#60A5FA", "#FBBF24", "#F87171", "#38BDF8"];
    const accent = accents[customPlatforms.length % accents.length];
    const hex = accent.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const newEntry = {
      key,
      name: newPlatform.name.trim(),
      url: newPlatform.url.trim().startsWith("http") ? newPlatform.url.trim() : `https://${newPlatform.url.trim()}`,
      emoji: "🔗",
      accent,
      bg: `rgba(${r},${g},${b},0.08)`,
      border: `rgba(${r},${g},${b},0.2)`,
      desc: newPlatform.desc.trim() || "Custom Platform",
    };
    const updated = [...customPlatforms, newEntry];
    setCustomPlatforms(updated);
    localStorage.setItem("vitacore_custom_platforms", JSON.stringify(updated));
    setNewPlatform({ name: "", url: "", desc: "" });
    setShowAddPlatform(false);
  };

  const removeCustomPlatform = (key: string) => {
    const updated = customPlatforms.filter(p => p.key !== key);
    setCustomPlatforms(updated);
    localStorage.setItem("vitacore_custom_platforms", JSON.stringify(updated));
  };

  const [formData, setFormData] = useState({
    topic: "",
    durationMinutes: 0,
    notes: ""
  });

  const fetchLogs = async () => {
    try {
      const res = { data: [] };
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error(error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];

  // Group study logs by topic to populate competency matrix
  const topicMap: { [key: string]: number } = {
    "React": 50,
    "Node.js": 40,
    "MongoDB": 30,
    "System Design": 35,
    "Security": 25,
    "DevOps": 20
  };

  safeLogs.forEach((item) => {
    const hours = item.durationMinutes / 60;
    if (topicMap[item.topic] !== undefined) {
      topicMap[item.topic] = Math.min(100, topicMap[item.topic] + hours * 5);
    } else {
      topicMap[item.topic] = Math.min(100, 30 + hours * 5);
    }
  });

  // Calculate total study time
  const totalMinutes = safeLogs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const score = Math.min(100, 80 + Math.round(totalHours / 2));

  // Milestones
  const milestones = [
    { id: 1, title: "Study Core Topics (10 Hours)", progress: Math.min(100, Math.round((totalHours / 10) * 100)), completed: totalHours >= 10 },
    { id: 2, title: "Build Personal Project (25 Hours)", progress: Math.min(100, Math.round((totalHours / 25) * 100)), completed: totalHours >= 25 },
    { id: 3, title: "Master Full-Stack App (50 Hours)", progress: Math.min(100, Math.round((totalHours / 50) * 100)), completed: totalHours >= 50 }
  ];

  const skillData = Object.keys(topicMap).map(key => ({
    subject: key,
    A: topicMap[key],
    fullMark: 100
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //await axios.post("https://vitacore-ml.onrender.com/simulate", formData);
      localStorage.setItem("studyHours", totalHours.toString());
      localStorage.setItem("completedTasks", milestones.filter(m => m.completed).length.toString());
      localStorage.setItem("focusScore", score.toString());
      localStorage.setItem("skills", Object.keys(topicMap).join(", "));
      fetchLogs(); // Refresh
      setFormData({ topic: "", durationMinutes: 0, notes: "" });
    } catch (error) {
      console.error(error);
    }
  };

  // Heatmap for the last 60 days
  const heatmapData = Array.from({ length: 60 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();

    const dayLogs = safeLogs.filter((l) => {
      const logDateStr = new Date(l.date || l.createdAt).toDateString();
      return logDateStr === dateStr;
    });

    const sumMinutes = dayLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
    const hours = sumMinutes / 60;

    let intensity = 0;
    if (hours > 4) intensity = 1.0;
    else if (hours > 2) intensity = 0.7;
    else if (hours > 0) intensity = 0.3;

    return {
      date: date.toLocaleDateString(),
      hours: hours,
      intensity: intensity
    };
  }).reverse();

  return (
    <AppLayout>
      <div
        style={{
          minHeight: "100%",
          background: themeColors.background,
          padding: "36px 40px 60px",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow effects */}
        <div style={{ position: "absolute", top: "-10%", left: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "5%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,140,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Noise overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            opacity: 0.025,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 36, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Career Goals
              </h1>
              <p style={{ color: "rgba(233,221,255,0.75)", marginTop: 6, fontSize: 15, fontWeight: 500 }}>
                Track your study sessions and build your skills.
              </p>
            </div>

            {/* Score Badge */}
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: "12px 24px",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#f5c518", letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>
                Career Score
              </div>
            </div>
          </div>

          {/* Top Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Study hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                rotateX: 5,
                rotateY: -5,
                boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
                borderColor: "rgba(139,92,246,0.25)",
              }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: "24px 28px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                display: "flex",
                alignItems: "center",
                gap: 20,
                transformStyle: "preserve-3d",
                perspective: 1000,
                transition: "all 0.3s ease",
                cursor: "default",
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", flexShrink: 0, transform: "translateZ(15px)", justifyContent: "center" }}>
                <Activity size={22} color="#8b5cf6" strokeWidth={2.5} />
              </div>
              <div style={{ transform: "translateZ(25px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Total Study Time
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>{totalHours}</span>
                  <span style={{ fontSize: 13, color: "rgba(196,181,253,0.45)", fontWeight: 600 }}>hours</span>
                </div>
              </div>
            </motion.div>

            {/* Competency Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                rotateX: 5,
                rotateY: -5,
                boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
                borderColor: "rgba(139,92,246,0.25)",
              }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: "24px 28px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                display: "flex",
                alignItems: "center",
                gap: 20,
                transformStyle: "preserve-3d",
                perspective: 1000,
                transition: "all 0.3s ease",
                cursor: "default",
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(233,30,140,0.1)", display: "flex", alignItems: "center", flexShrink: 0, transform: "translateZ(15px)", justifyContent: "center" }}>
                <Briefcase size={22} color="#e91e8c" strokeWidth={2.5} />
              </div>
              <div style={{ transform: "translateZ(25px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Skills Tracked
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>{Object.keys(topicMap).length}</span>
                  <span style={{ fontSize: 13, color: "rgba(196,181,253,0.45)", fontWeight: 600 }}>topics</span>
                </div>
              </div>
            </motion.div>

            {/* Milestones Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                rotateX: 5,
                rotateY: -5,
                boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
                borderColor: "rgba(139,92,246,0.25)",
              }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: "24px 28px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                display: "flex",
                alignItems: "center",
                gap: 20,
                transformStyle: "preserve-3d",
                perspective: 1000,
                transition: "all 0.3s ease",
                cursor: "default",
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(245,197,24,0.1)", display: "flex", alignItems: "center", flexShrink: 0, transform: "translateZ(15px)", justifyContent: "center" }}>
                <Rocket size={22} color="#f5c518" strokeWidth={2.5} />
              </div>
              <div style={{ transform: "translateZ(25px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Milestones Hit
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>{milestones.filter(m => m.completed).length}</span>
                  <span style={{ fontSize: 13, color: "rgba(196,181,253,0.45)", fontWeight: 600 }}>/ {milestones.length}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trajectory timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.5)", borderColor: "rgba(139,92,246,0.25)" }}
            style={{
              background: "rgba(16,12,38,0.82)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(139,92,246,0.14)",
              borderRadius: 22,
              padding: "28px 32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
              position: "relative",
              overflow: "hidden",
              marginBottom: 24,
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Level</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#e2d9ff", marginTop: 4 }}>Associate Engineer</div>
              </div>

              {/* Trajectory Timeline Bar */}
              <div style={{ flex: 1, margin: "0 32px", position: "relative", minWidth: 200 }}>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, width: "100%", position: "relative" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalHours / 50) * 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background: "linear-gradient(90deg, #e91e8c, #8b5cf6)",
                      boxShadow: "0 0 12px rgba(233,30,140,0.5)",
                    }}
                  />
                  <motion.div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `${Math.min(95, (totalHours / 50) * 100)}%`,
                      transform: "translate(-50%, -50%)",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#100c26",
                      border: "1px solid rgba(139,92,246,0.3)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.40)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Rocket size={16} color="#e91e8c" />
                  </motion.div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#e91e8c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Next Level</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#e2d9ff", marginTop: 4 }}>Principal Architect</div>
              </div>
            </div>
          </motion.div>

          {/* Coding Platforms Hub */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 24 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={18} color="#e91e8c" /> Learning Platforms Hub
                  </h3>
                  <p style={{ color: "rgba(196,181,253,0.5)", fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                    Filter by learning path or add any platform. Click a row to track its streak.
                  </p>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Total Streak: {Object.values(platformStreaks).reduce((a, b) => a + b, 0)} Days
                </div>
              </div>

              {/* Study Path Selection tabs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, background: "rgba(16,12,38,0.6)", padding: 6, borderRadius: 12, border: "1px solid rgba(139,92,246,0.15)", width: "fit-content" }}>
                {[
                  { id: "all", label: "All Paths" },
                  { id: "competitive", label: "Competitive Coding" },
                  { id: "fundamentals", label: "DSA & CS Fundamentals" },
                  { id: "software", label: "Web Dev & Certifications" },
                  { id: "ml", label: "ML & Data Science" },
                  { id: "custom", label: `My Platforms${customPlatforms.length > 0 ? ` (${customPlatforms.length})` : ""}` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedPath(tab.id)}
                    style={{
                      background: selectedPath === tab.id ? "#8b5cf6" : "transparent",
                      color: selectedPath === tab.id ? "#ffffff" : "#94a3b8",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: "auto", background: "rgba(16,12,38,0.82)", backdropFilter: "blur(16px)", border: "1px solid rgba(139,92,246,0.14)", borderRadius: 22, boxShadow: "0 4px 24px rgba(0,0,0,0.40)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: "Inter, sans-serif" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.03)" }}>
                    <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "rgba(196,181,253,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Platform</th>
                    <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "rgba(196,181,253,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Description</th>
                    <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "rgba(196,181,253,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active Streak</th>
                    <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "rgba(196,181,253,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlatforms.map((p) => {
                    const isExpanded = expandedPlatform === p.key;
                    const streak = platformStreaks[p.key] || 0;
                    
                    // Generate 60 day streak data based on current streak count
                    const platformHeatmapData = Array.from({ length: 60 }).map((_, idx) => {
                      // Highlight the last N days representing the current streak
                      const isActive = idx >= (60 - streak);
                      return { active: isActive };
                    });

                    return (
                      <React.Fragment key={p.key}>
                        <tr 
                          onClick={() => setExpandedPlatform(isExpanded ? null : p.key)}
                          style={{ 
                            borderBottom: "1px solid rgba(255,255,255,0.05)", 
                            cursor: "pointer", 
                            background: isExpanded ? "rgba(139,92,246,0.05)" : "transparent",
                            transition: "all 0.2s ease" 
                          }}
                          onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                          onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                        >
                          {/* Platform Name column */}
                          <td style={{ padding: "18px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 24 }}>{p.emoji}</span>
                              <span style={{ fontSize: 15, fontWeight: 800, color: "#e2d9ff" }}>{p.name}</span>
                            </div>
                          </td>
                          {/* Description column */}
                          <td style={{ padding: "18px 24px" }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(196,181,253,0.7)" }}>{p.desc}</span>
                          </td>
                          {/* Streak Badge column */}
                          <td style={{ padding: "18px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Flame size={16} color={p.accent} />
                              <span style={{ fontSize: 14, fontWeight: 800, color: p.accent }}>{streak} Days</span>
                              <span style={{ fontSize: 11, color: "rgba(196,181,253,0.4)" }}>
                                ({isExpanded ? "click to hide" : "click to see streak"})
                              </span>
                            </div>
                          </td>
                          {/* Link column (simplified, no circle background, clean hover color) */}
                          <td style={{ padding: "18px 24px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "rgba(196,181,253,0.6)",
                                transition: "color 0.2s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = p.accent}
                              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(196,181,253,0.6)"}
                              title={`Open ${p.name}`}
                            >
                              <ExternalLink size={16} />
                            </a>
                          </td>
                        </tr>
                        
                        {/* Expanded Heatmap Row */}
                        {isExpanded && (
                          <tr style={{ background: "rgba(16,12,38,0.92)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
                            <td colSpan={4} style={{ padding: "24px 32px" }}>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.3 }}
                                style={{ display: "flex", flexDirection: "column", gap: 16 }}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "#e2d9ff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                    <Flame size={16} color={p.accent} /> {p.name} Study Streak tracker (Last 60 Days)
                                  </h4>
                                  
                                  {/* Inline Streak Editor */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Adjust Streak:</span>
                                    <input
                                      type="number"
                                      value={editingPlatform === p.key ? editStreak : String(streak)}
                                      onChange={(e) => {
                                        setEditingPlatform(p.key);
                                        setEditStreak(e.target.value);
                                      }}
                                      onFocus={() => {
                                        setEditingPlatform(p.key);
                                        setEditStreak(String(streak));
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") updateStreak(p.key, parseInt(editStreak) || 0);
                                        if (e.key === "Escape") setEditingPlatform(null);
                                      }}
                                      style={{
                                        width: 60,
                                        padding: "4px 8px",
                                        background: "rgba(255,255,255,0.06)",
                                        border: `1px solid rgba(139,92,246,0.3)`,
                                        borderRadius: 8,
                                        color: "#e2d9ff",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        outline: "none",
                                        textAlign: "center",
                                      }}
                                    />
                                    {editingPlatform === p.key && (
                                      <button
                                        onClick={() => updateStreak(p.key, parseInt(editStreak) || 0)}
                                        style={{ background: p.accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 8px", cursor: "pointer" }}
                                      >
                                        Save
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Dynamic Grid Heatmap */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "4px 0" }}>
                                  {platformHeatmapData.map((d, index) => {
                                    // Highlight squares if they are active in the streak
                                    const bg = d.active ? p.accent : "rgba(107,92,231,0.06)";
                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.002 }}
                                        style={{
                                          width: 18,
                                          height: 18,
                                          borderRadius: 4,
                                          background: bg,
                                          border: "1px solid rgba(255,255,255,0.03)",
                                          boxShadow: d.active ? `0 0 6px ${p.accent}55` : "none"
                                        }}
                                        whileHover={{ scale: 1.2, border: `1px solid ${p.accent}` }}
                                        title={d.active ? `Day ${index + 1}: Active streak` : `Day ${index + 1}: Inactive`}
                                      />
                                    );
                                  })}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "rgba(196,181,253,0.5)" }}>
                                  <span>Inactive</span>
                                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(107,92,231,0.06)" }} />
                                  <div style={{ width: 12, height: 12, borderRadius: 3, background: p.accent }} />
                                  <span>Active Streak</span>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Add Custom Platform ── */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(196,181,253,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Don't see your platform?
                </span>
                <button
                  onClick={() => setShowAddPlatform(!showAddPlatform)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: showAddPlatform ? "rgba(233,30,140,0.12)" : "rgba(139,92,246,0.1)",
                    border: showAddPlatform ? "1px solid rgba(233,30,140,0.3)" : "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 10, padding: "7px 16px", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    color: showAddPlatform ? "#e91e8c" : "#a78bfa",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Plus size={13} /> {showAddPlatform ? "Cancel" : "Add Custom Platform"}
                </button>
              </div>

              {showAddPlatform && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "rgba(139,92,246,0.04)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    borderRadius: 16, padding: "20px 24px",
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Platform Name *</label>
                    <input
                      type="text" value={newPlatform.name}
                      onChange={e => setNewPlatform({ ...newPlatform, name: e.target.value })}
                      placeholder="e.g. Kaggle, Udemy, fast.ai"
                      style={{ height: 38, padding: "0 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontSize: 13, fontWeight: 600, outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Website URL *</label>
                    <input
                      type="text" value={newPlatform.url}
                      onChange={e => setNewPlatform({ ...newPlatform, url: e.target.value })}
                      placeholder="e.g. kaggle.com"
                      style={{ height: 38, padding: "0 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontSize: 13, fontWeight: 600, outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Short Description</label>
                    <input
                      type="text" value={newPlatform.desc}
                      onChange={e => setNewPlatform({ ...newPlatform, desc: e.target.value })}
                      placeholder="e.g. ML Competitions"
                      style={{ height: 38, padding: "0 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontSize: 13, fontWeight: 600, outline: "none" }}
                    />
                  </div>
                  <button
                    onClick={addCustomPlatform}
                    style={{ height: 38, padding: "0 20px", background: "linear-gradient(135deg, #e91e8c, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    + Add
                  </button>
                </motion.div>
              )}

              {customPlatforms.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                  {customPlatforms.map(cp => (
                    <div key={cp.key} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "5px 12px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>{cp.emoji} {cp.name}</span>
                      <button
                        onClick={() => removeCustomPlatform(cp.key)}
                        style={{ background: "none", border: "none", color: "rgba(196,181,253,0.4)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, display: "flex", alignItems: "center" }}
                        title={`Remove ${cp.name}`}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>

          {/* Competency & Milestones Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

            {/* Skill Level Radar Chart */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.5)", borderColor: "rgba(139,92,246,0.25)" }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: 28,
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: "0 0 20px" }}>My Skill Level</h3>
              <div style={{ height: 280, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                    <PolarGrid stroke="rgba(139,92,246,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(196,181,253,0.5)", fontSize: 12, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Skills" dataKey="A" stroke="#e91e8c" fill="#e91e8c" fillOpacity={0.15} strokeWidth={2.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Promotion Roadmap */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.5)", borderColor: "rgba(139,92,246,0.25)" }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: 28,
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: "0 0 20px" }}>My Growth Milestones</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: m.completed ? "rgba(233,30,140,0.06)" : "rgba(107,92,231,0.03)",
                      border: m.completed ? "1px solid rgba(233,30,140,0.15)" : "1px solid rgba(107,92,231,0.08)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {m.completed ? <CheckCircle2 className="text-pink-500" size={18} /> : <Circle className="text-slate-500" size={18} />}
                        <span style={{ fontWeight: 700, fontSize: 13, color: m.completed ? "#e2d9ff" : "rgba(196,181,253,0.5)" }}>{m.title}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#e91e8c" }}>{m.progress}%</span>
                    </div>
                    <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.progress}%` }}
                        transition={{ duration: 1 }}
                        style={{ height: "100%", background: m.completed ? "#e91e8c" : "rgba(233,30,140,0.4)", borderRadius: 99 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Form and Consistency Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>

            {/* Study Log Form */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.5)", borderColor: "rgba(139,92,246,0.25)" }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: 28,
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 900, color: "#e2d9ff", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={18} color="#e91e8c" strokeWidth={3} /> Log a Study Session
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Study Time (Minutes)</label>
                    <Input type="number" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })} style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Topic / Skill</label>
                    <Input
                      type="text"
                      list="topic-suggestions"
                      value={formData.topic}
                      onChange={e => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g. Machine Learning, React..."
                      style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }}
                    />
                    <datalist id="topic-suggestions">
                      <option value="React" /><option value="Node.js" /><option value="MongoDB" />
                      <option value="System Design" /><option value="Security" /><option value="DevOps" />
                      <option value="Machine Learning" /><option value="Deep Learning" /><option value="Python" />
                      <option value="Data Science" /><option value="Computer Vision" /><option value="NLP" />
                      <option value="TypeScript" /><option value="Flutter" /><option value="Kubernetes" />
                      <option value="AWS" /><option value="GCP" /><option value="DSA" /><option value="SQL" />
                      <option value="Rust" /><option value="Go" /><option value="Java" /><option value="C++" />
                      <option value="Android" /><option value="iOS" /><option value="Unity" /><option value="Blockchain" />
                    </datalist>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>What did you study?</label>
                  <Input type="text" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. Practiced React context and customized hooks" style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }} />
                </div>
                <Button type="submit" style={{ height: 46, background: "linear-gradient(135deg, #e91e8c, #f472b6)", color: "#fff", fontWeight: 800, borderRadius: 99, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(233,30,140,0.25)" }}>
                  SAVE STUDY SESSION
                </Button>
              </form>
            </motion.div>

            {/* Consistency Grid */}
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.5)", borderColor: "rgba(139,92,246,0.25)" }}
              style={{
                background: "rgba(16,12,38,0.82)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(139,92,246,0.14)",
                borderRadius: 22,
                padding: 28,
                boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={18} color="#e91e8c" /> My Study Habit tracker (Last 60 Days)
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 150, overflowY: "auto", paddingRight: 4 }}>
                  {heatmapData.map((d, i) => {
                    let bg = "rgba(107,92,231,0.06)";
                    if (d.intensity > 0.8) bg = "#e91e8c";
                    else if (d.intensity > 0.5) bg = "rgba(233,30,140,0.6)";
                    else if (d.intensity > 0.1) bg = "rgba(233,30,140,0.25)";

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.003 }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: bg,
                          cursor: "crosshair",
                          flexShrink: 0,
                          border: "1px solid rgba(139,92,246,0.1)",
                        }}
                        whileHover={{ scale: 1.15, borderColor: "rgba(139,92,246,0.3)" }}
                        title={`${d.date}: ${d.hours.toFixed(1)} hours`}
                      />
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)" }}>
                  <span>Less</span>
                  <div style={{ display: "flex", gap: 3 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(107,92,231,0.06)" }} />
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(233,30,140,0.25)" }} />
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(233,30,140,0.6)" }} />
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: "#e91e8c" }} />
                  </div>
                  <span>More</span>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(196,181,253,0.5)", fontWeight: 600 }}>
                <span>Total Study Time:</span>
                <span style={{ fontWeight: 800, color: "#e2d9ff" }}>{totalHours} Hours</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}