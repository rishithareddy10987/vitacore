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
import { DollarSign, TrendingUp, PiggyBank, ArrowUpRight, ArrowDownRight, CreditCard, ShoppingBag, Coffee, Home as HomeIcon, MonitorPlay, Zap, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Finance() {
  const { themeColors, theme } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    amount: 0,
    category: "Food",
    description: "",
    type: "Expense",
    date: ""
  });

  const fetchLogs = async () => {
    try {
      const res = await axios.get("https://vitacore-backend-sue1.onrender.com/api/finance");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("https://vitacore-backend-sue1.onrender.com/api/finance", formData);
      localStorage.setItem(
        "income",
        income.toString()
      );

      localStorage.setItem(
        "expenses",
        expenses.toString()
      );

      localStorage.setItem(
        "savings",
        savings.toString()
      );

      localStorage.setItem(
        "savingsRate",
        savingsRate.toString()
      );
      fetchLogs(); // Refresh
      setFormData({ amount: 0, category: "Food", description: "", type: "Expense", date: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  // Dynamically calculate metrics
  let income = 0;
  let expenses = 0;
  safeLogs.forEach((item) => {
    if (item.type === "Income") {
      income += item.amount;
    } else {
      expenses += item.amount;
    }
  });

  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const score = Math.max(50, Math.min(100, 75 + Math.round(savingsRate / 4)));

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
  let currentSavings = 0;
  const savingsTrend = sortedLogs.map((l, index) => {
    if (l.type === "Income") {
      currentSavings += l.amount;
    } else {
      currentSavings -= l.amount;
    }
    return {
      month: l.date ? new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Log ${index + 1}`,
      amount: currentSavings
    };
  });

  const displaySavingsTrend = savingsTrend.length > 0 ? savingsTrend : [
    { month: "Sync", amount: 0 }
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
              <div style={{ transform: "translateZ(25px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>
                  Monthly Income
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>${income.toLocaleString()}</span>
                </div>
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
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>${expenses.toLocaleString()}</span>
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
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#e2d9ff" }}>${savings.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>({savingsRate}%)</span>
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
                Capital Accumulation
              </h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displaySavingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139,92,246,0.08)" />
                    <XAxis dataKey="month" stroke="rgba(196,181,253,0.4)" tickLine={false} axisLine={false} style={{ fontSize: "11px", fontWeight: "bold" }} />
                    <YAxis stroke="rgba(196,181,253,0.4)" tickLine={false} axisLine={false} style={{ fontSize: "11px", fontWeight: "bold" }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,8,28,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#fff" }} />
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
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#e2d9ff" }}>${c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form and Ledger Rows */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
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
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Amount ($)</label>
                    <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600, padding: "0 10px", cursor: "pointer", outline: "none" }}>
                      <option value="Expense" style={{ background: "#100c26", color: "#e2d9ff" }}>Expense</option>
                      <option value="Income" style={{ background: "#100c26", color: "#e2d9ff" }}>Income</option>
                    </select>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,181,253,0.5)", textTransform: "uppercase" }}>Description</label>
                    <Input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Grocery, Salary" style={{ height: 42, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, color: "#e2d9ff", fontWeight: 600 }} />
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
                          {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}