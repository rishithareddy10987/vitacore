import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  PiggyBank,
  CreditCard,
  ShoppingBag,
  Coffee,
  Home as HomeIcon,
  MonitorPlay,
  Zap,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Finance() {
  const { themeColors, theme } = useTheme();
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Income State
  const [incomeInput, setIncomeInput] = useState("");
  const [isEditingIncome, setIsEditingIncome] = useState(false);

  // Goals State
  const [goals, setGoals] = useState<any[]>([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);
  const [contributions, setContributions] = useState<{ [key: string]: string }>({});
  const [goalForm, setGoalForm] = useState({
    title: "",
    targetValue: "",
    currentValue: "",
    deadline: ""
  });

  // Form State
  const [formData, setFormData] = useState({
    amount: 0,
    category: "Food",
    description: "",
    date: ""
  });

  const fetchGoals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/goals");
      if (Array.isArray(res.data)) {
        // Filter goals to only show Finance goals in the savings tracker
        setGoals(res.data.filter(g => g.domain === "Finance"));
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error(error);
      setGoals([]);
    } finally {
      setIsGoalsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/finance");
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
    fetchGoals();
  }, []);

  useEffect(() => {
    if (user?.income !== undefined) {
      setIncomeInput(user.income.toString());
    }
  }, [user]);

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const newIncome = Number(incomeInput);
    if (isNaN(newIncome) || newIncome < 0) return;
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`,
        { income: newIncome }
      );
      // Persist income directly to localStorage (works with any AuthContext version)
      const stored = localStorage.getItem("vitacore_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...parsed, income: res.data.income ?? newIncome };
        localStorage.setItem("vitacore_user", JSON.stringify(merged));
      }
      setIsEditingIncome(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/goals", {
        title: goalForm.title,
        domain: "Finance",
        targetValue: Number(goalForm.targetValue),
        currentValue: Number(goalForm.currentValue) || 0,
        deadline: goalForm.deadline
      });
      fetchGoals();
      setGoalForm({ title: "", targetValue: "", currentValue: "", deadline: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddContribution = async (goalId: string) => {
    const contribution = contributions[goalId];
    if (!contribution || isNaN(Number(contribution)) || Number(contribution) <= 0) return;
    try {
      await axios.put(`http://localhost:5000/api/goals/${goalId}`, {
        contribution: Number(contribution)
      });
      fetchGoals();
      setContributions(prev => ({ ...prev, [goalId]: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/goals/${goalId}`);
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/finance", {
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        date: formData.date || undefined,
        type: "Expense"
      });
      fetchLogs(); // Refresh
      setFormData({ amount: 0, category: "Food", description: "", date: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  // Dynamically calculate metrics
  const userIncome = user?.income || 0;
  let expenses = 0;
  safeLogs.forEach((item) => {
    if (item.type === "Expense") {
      expenses += item.amount;
    }
  });

  const savings = userIncome - expenses;
  const savingsRate = userIncome > 0 ? Math.round((savings / userIncome) * 100) : 0;
  const score = Math.max(50, Math.min(100, 75 + Math.round(savingsRate / 4)));

  useEffect(() => {
    localStorage.setItem("income", userIncome.toString());
    localStorage.setItem("expenses", expenses.toString());
    localStorage.setItem("savings", savings.toString());
    localStorage.setItem("savingsRate", savingsRate.toString());
  }, [userIncome, expenses, savings, savingsRate]);

  // Group by category for PieChart
  const categoryMap: { [key: string]: number } = {};
  safeLogs.filter(l => l.type === "Expense").forEach(l => {
    categoryMap[l.category] = (categoryMap[l.category] || 0) + l.amount;
  });

  const COLORS_MAP: { [key: string]: string } = {
    Food: "#f87171",
    Transport: "#60a5fa",
    Entertainment: "#c084fc",
    Housing: "#facc15",
    Shopping: "#f472b6",
    Other: "#a78bfa"
  };

  const pieData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat],
    color: COLORS_MAP[cat] || "#c084fc"
  }));

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: "No expenses", value: 1, color: "#e2e8f0" }
  ];

  const sortedLogs = [...safeLogs].reverse();
  let currentSavings = userIncome;
  const savingsTrend = sortedLogs
    .filter(l => l.type === "Expense")
    .map((l, index) => {
      currentSavings -= l.amount;
      return {
        month: l.date ? new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Log ${index + 1}`,
        amount: currentSavings
      };
    });

  const displaySavingsTrend = savingsTrend.length > 0 ? savingsTrend : [
    { month: "Sync", amount: userIncome }
  ];

  return (
    <AppLayout>
      {/* ── Page Wrapper with Dark background ── */}
      <div
        style={{
          minHeight: "100%",
          background: themeColors.background,
          padding: "36px 40px 60px",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient glow orbs */}
        <div style={{ position: "absolute", top: "-10%", left: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "5%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,140,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Subtle noise overlay */}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Finance Module
              </h1>
              <p style={{ color: "rgba(233,221,255,0.75)", marginTop: 6, fontSize: 15, fontWeight: 500 }}>
                Capital allocation and wealth trajectory.
              </p>
            </div>

            {/* Financial score */}
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
              <div style={{ fontSize: 10, fontWeight: 800, color: "#e91e8c", letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>
                Financial Score
              </div>
            </div>
          </div>

          {/* Welcome/Set Income Banner if 0 */}
          {userIncome === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(233,30,140,0.15) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: 22,
                padding: "24px 32px",
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: 0 }}>💰 Set Your Monthly Income</h3>
                <p style={{ color: "rgba(233,221,255,0.8)", fontSize: 14, marginTop: 4, fontWeight: 500 }}>
                  Enter your static monthly income in Indian Rupees (₹) to start tracking your net savings and financial goals.
                </p>
              </div>
              <form onSubmit={handleSaveIncome} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={incomeInput}
                  onChange={e => setIncomeInput(e.target.value)}
                  style={{ width: 160, height: 42, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(139,92,246,0.3)", color: "#fff", fontWeight: 600 }}
                  required
                />
                <Button type="submit" style={{ height: 42, background: "linear-gradient(135deg, #e91e8c, #f472b6)", color: "#fff", fontWeight: 800, borderRadius: 10, border: "none", padding: "0 24px" }}>
                  SAVE
                </Button>
              </form>
            </motion.div>
          )}

          {/* Top 3 Stats (3D Tilts) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Income Card */}
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
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: "translateZ(15px)" }}>
                <TrendingUp size={22} color="#8b5cf6" strokeWidth={2.5} />
              </div>
              <div style={{ transform: "translateZ(25px)", width: "100%" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Monthly Income
                </span>
                {isEditingIncome ? (
                  <form onSubmit={handleSaveIncome} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Input
                      type="number"
                      value={incomeInput}
                      onChange={e => setIncomeInput(e.target.value)}
                      style={{ height: 32, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.3)", color: "#fff", padding: "0 8px", fontSize: 14, fontWeight: 600, width: 90 }}
                      required
                    />
                    <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, width: 28, borderRadius: 6, background: "#22c55e", color: "#fff", border: "none", cursor: "pointer" }}>
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => { setIsEditingIncome(false); setIncomeInput(userIncome.toString()); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, width: 28, borderRadius: 6, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>₹{userIncome.toLocaleString()}</span>
                    <button
                      onClick={() => setIsEditingIncome(true)}
                      style={{ background: "transparent", border: "none", color: "rgba(196,181,253,0.6)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
                      title="Edit Monthly Income"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Expenses Card */}
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
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(233,30,140,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: "translateZ(15px)" }}>
                <CreditCard size={22} color="#e91e8c" strokeWidth={2.5} />
              </div>
              <div style={{ transform: "translateZ(25px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Expenses
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>₹{expenses.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Savings Card */}
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
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(245,197,24,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: "translateZ(15px)" }}>
                <PiggyBank size={22} color="#f5c518" strokeWidth={2.5} />
              </div>
              <div style={{ transform: "translateZ(25px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Net Savings
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>₹{savings.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: savings >= 0 ? "#22c55e" : "#ef4444", fontWeight: 700 }}>({savingsRate}%)</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Capital Accumulation */}
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
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: "0 0 20px" }}>
                Capital Accumulation (₹)
              </h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displaySavingsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139,92,246,0.08)" />
                    <XAxis dataKey="month" stroke="rgba(196,181,253,0.4)" tickLine={false} axisLine={false} style={{ fontSize: "11px", fontWeight: "bold" }} />
                    <YAxis stroke="rgba(196,181,253,0.4)" tickLine={false} axisLine={false} style={{ fontSize: "11px", fontWeight: "bold" }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,8,28,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#fff" }} formatter={(value: any) => [`₹${value.toLocaleString()}`, "Capital"]} />
                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3.5} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Expense Distribution */}
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
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: "0 0 20px" }}>
                Expense Distribution
              </h3>
              <div style={{ display: "flex", height: 240, gap: 16 }}>
                <div style={{ flex: 1.2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={displayPieData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                        {displayPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, overflowY: "auto", paddingRight: 4 }}>
                  {pieData.map(c => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2d9ff" }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#e2d9ff" }}>₹{c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form and Ledger Rows */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20, marginBottom: 32 }}>
            {/* Form */}
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
                <Plus size={18} color="#e91e8c" strokeWidth={3} /> Log Today's Ledger
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Amount (₹)</label>
                    <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600, padding: "0 10px", cursor: "pointer", outline: "none" }}>
                      <option value="Food" style={{ background: "#100c26", color: "#e2d9ff" }}>Food</option>
                      <option value="Transport" style={{ background: "#100c26", color: "#e2d9ff" }}>Transport</option>
                      <option value="Entertainment" style={{ background: "#100c26", color: "#e2d9ff" }}>Entertainment</option>
                      <option value="Housing" style={{ background: "#100c26", color: "#e2d9ff" }}>Housing</option>
                      <option value="Shopping" style={{ background: "#100c26", color: "#e2d9ff" }}>Shopping</option>
                      <option value="Other" style={{ background: "#100c26", color: "#e2d9ff" }}>Other</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Description</label>
                    <Input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Grocery shopping, Electricity bill" style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }} />
                  </div>
                </div>
                <Button type="submit" style={{ height: 46, background: "linear-gradient(135deg, #e91e8c, #f472b6)", color: "#fff", fontWeight: 800, borderRadius: 99, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(233,30,140,0.25)" }}>
                  RECORD TRANSACTION
                </Button>
              </form>
            </motion.div>

            {/* Ledger List */}
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
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: "0 0 20px" }}>
                Recent Ledger Entries
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 220, paddingRight: 4 }}>
                {safeLogs.length === 0 ? (
                  <p style={{ color: "rgba(196,181,253,0.5)", fontSize: 13, fontStyle: "italic", margin: 0 }}>
                    No entries yet. Add your first transaction today.
                  </p>
                ) : (
                  safeLogs.slice(0, 8).map((t: any, i: number) => {
                    const getIcon = () => {
                      if (t.category === 'Food') return <Coffee size={15} />;
                      if (t.type === 'Income') return <TrendingUp size={15} />;
                      if (t.category === 'Transport') return <Zap size={15} />;
                      if (t.category === 'Entertainment') return <MonitorPlay size={15} />;
                      if (t.category === 'Housing') return <HomeIcon size={15} />;
                      return <ShoppingBag size={15} />;
                    };
                    const colorAccent = t.type === 'Income' ? "#22c55e" : "#ef4444";
                    const colorBg = t.type === 'Income' ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)";
                    return (
                      <div
                        key={t._id || i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          borderRadius: 14,
                          background: "rgba(139,92,246,0.05)",
                          border: "1px solid rgba(139,92,246,0.10)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: colorBg, display: "flex", alignItems: "center", justifyContent: "center", color: colorAccent }}>
                            {getIcon()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#e2d9ff" }}>
                              {t.description || t.category}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(196,181,253,0.5)", fontWeight: 600 }}>
                              {t.category} • {new Date(t.date || t.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: colorAccent }}>
                          {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Goal-Based Savings Tracker */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
                Goal-Based Savings Tracker
              </h2>
              <p style={{ color: "rgba(233,221,255,0.75)", fontSize: 14, marginTop: 4, fontWeight: 500 }}>
                Allocate and visualize your accumulated savings toward target financial goals.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="lg:grid-cols-3">
              {/* Goals Cards List */}
              <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {isGoalsLoading ? (
                  <div style={{ color: "rgba(196,181,253,0.5)", fontSize: 14, fontWeight: 600, padding: "20px 0" }}>
                    Loading goals telemetry...
                  </div>
                ) : goals.length === 0 ? (
                  <div
                    style={{
                      background: "rgba(16,12,38,0.5)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(139,92,246,0.1)",
                      borderRadius: 22,
                      padding: "48px 20px",
                      textAlign: "center"
                    }}
                  >
                    <Target size={40} color="rgba(139,92,246,0.4)" style={{ margin: "0 auto 12px" }} />
                    <p style={{ color: "rgba(196,181,253,0.5)", fontSize: 14, fontWeight: 600, margin: 0 }}>
                      No active savings goals found. Set up a target on the right to start tracking.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                    {goals.map((goal) => {
                      const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) || 0;
                      const remaining = Math.max(0, goal.targetValue - goal.currentValue);
                      const targetDateStr = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No date";
                      return (
                        <motion.div
                          key={goal._id}
                          whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.5)", borderColor: "rgba(139,92,246,0.25)" }}
                          style={{
                            background: "rgba(16,12,38,0.82)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(139,92,246,0.14)",
                            borderRadius: 22,
                            padding: 24,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 16
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2d9ff", margin: 0 }}>{goal.title}</h3>
                              <button
                                onClick={() => handleDeleteGoal(goal._id)}
                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 2 }}
                                title="Delete Goal"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(196,181,253,0.5)", fontWeight: 700, margin: "4px 0 16px" }}>
                              Target: ₹{goal.targetValue.toLocaleString()} • Deadline: {targetDateStr}
                            </div>

                            {/* Progress bar */}
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#e2d9ff", marginBottom: 6 }}>
                                <span>Saved: ₹{goal.currentValue.toLocaleString()}</span>
                                <span>{progress}%</span>
                              </div>
                              <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                                <div
                                  style={{
                                    width: `${progress}%`,
                                    height: "100%",
                                    background: progress >= 100 ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #e91e8c, #8b5cf6)",
                                    borderRadius: 99,
                                    transition: "width 0.4s ease"
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: 8 }}>
                            {remaining > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <span style={{ fontSize: 11, color: "rgba(196,181,253,0.5)", fontWeight: 600 }}>
                                  ₹{remaining.toLocaleString()} remaining
                                </span>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <Input
                                    type="number"
                                    placeholder="Add savings (₹)"
                                    value={contributions[goal._id] || ""}
                                    onChange={e => setContributions(prev => ({ ...prev, [goal._id]: e.target.value }))}
                                    style={{ height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, color: "#e2d9ff", fontSize: 12, fontWeight: 600 }}
                                  />
                                  <Button
                                    onClick={() => handleAddContribution(goal._id)}
                                    size="sm"
                                    style={{ height: 36, borderRadius: 8, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#8b5cf6", fontWeight: 700, padding: "0 12px" }}
                                  >
                                    ADD
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 800 }}>
                                🎉 Milestone Achieved!
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create Savings Goal Form */}
              <div>
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
                    <Target size={18} color="#e91e8c" strokeWidth={3} /> Create Savings Goal
                  </h3>
                  <form onSubmit={handleCreateGoal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Goal Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Dream House Fund"
                        value={goalForm.title}
                        onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                        style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }}
                        required
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Target (₹)</label>
                        <Input
                          type="number"
                          placeholder="₹ Total"
                          value={goalForm.targetValue}
                          onChange={e => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                          style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }}
                          required
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Initial Saved (₹)</label>
                        <Input
                          type="number"
                          placeholder="₹ 0"
                          value={goalForm.currentValue}
                          onChange={e => setGoalForm({ ...goalForm, currentValue: e.target.value })}
                          style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Target Date</label>
                      <Input
                        type="date"
                        value={goalForm.deadline}
                        onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })}
                        style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }}
                        required
                      />
                    </div>
                    <Button type="submit" style={{ height: 46, background: "linear-gradient(135deg, #e91e8c, #f472b6)", color: "#fff", fontWeight: 800, borderRadius: 99, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(233,30,140,0.25)", marginTop: 8 }}>
                      CREATE GOAL
                    </Button>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}