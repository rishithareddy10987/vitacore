import React, { useState, useEffect, useMemo, FC } from "react";
import axios from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { 
  Activity, Droplets, Moon, Flame, Plus, Clock, Search,
  HeartPulse, ShieldAlert, ClipboardCheck, Apple, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HealthLog {
  _id?: string;
  date?: string;
  caloriesConsumed: number;
  sleepHours: number;
  waterGlasses: number;
  workoutMinutes: number;
  caloriesBurned: number;
  mood?: string;
}

interface SleepDataPoint {
  day: string;
  hours: number;
}

interface FoodItem {
  name: string;
  calories: number;
}

interface Exercise {
  name: string;
  target: string;
  equipment: string;
  bodyPart: string;
  gifUrl: string;
}

interface FitnessPlan {
  category: string;
  issues: string[];
  exercises: Exercise[];
}

interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
  log?: HealthLog;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, unit = '', icon, description, valueClassName }) => (
  <motion.div
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className="flex-grow"
  >
    <Card className="glass-card border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold text-violet-300 tracking-wide uppercase">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-1">
        <div className={`text-2xl font-extrabold text-white tracking-tight ${valueClassName}`}>
          {value} <span className="text-xs font-semibold text-slate-400 ml-0.5">{unit}</span>
        </div>
        {description && <p className="text-[10px] text-slate-400 mt-1 font-medium">{description}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

const chartConfig = {
  hours: {
    label: "Sleep Hours",
    color: "#a78bfa",
  },
} satisfies ChartConfig;

export default function Health() {
  const { themeColors, theme } = useTheme();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const nextD = new Date(prev);
      nextD.setMonth(nextD.getMonth() - 1);
      return nextD;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const nextD = new Date(prev);
      nextD.setMonth(nextD.getMonth() + 1);
      return nextD;
    });
  };

  // Form State
  const [formData, setFormData] = useState({
    workoutMinutes: 0,
    caloriesBurned: 0,
    caloriesConsumed: 0,
    sleepHours: 0,
    waterGlasses: 0,
    mood: "Good" as "Great" | "Good" | "Neutral" | "Bad" | "Terrible"
  });

  // CalorieNinjas Search State
  const [foodQuery, setFoodQuery] = useState("");
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<FoodItem[] | null>(null);
  const [foodError, setFoodError] = useState("");
  const [showCalorieLookup, setShowCalorieLookup] = useState(false);

  // Fetch Database Logs
  const fetchLogs = async () => {
    try {
      const res = await axios.get("https://vitacore-backend-sue1.onrender.com/api/health");
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        console.error("Backend returned non-array data:", res.data);
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // AI Fitness Coach State
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [fitnessError, setFitnessError] = useState("");

  const generateFitnessPlan = async () => {
    setIsGeneratingPlan(true);
    setFitnessError("");
    setFitnessPlan(null);
    try {
      const res = await axios.get("https://vitacore-backend-sue1.onrender.com/api/health/fitness-plan");
      setFitnessPlan(res.data);
    } catch (err: any) {
      console.error("Error generating fitness plan:", err);
      if (err?.response?.data?.message) {
        setFitnessError(err.response.data.message);
      } else {
        setFitnessError("Failed to connect to the fitness coach. Please check your network and try again.");
      }
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("https://vitacore-backend-sue1.onrender.com/api/health", formData);
      localStorage.setItem("sleepHours", formData.sleepHours.toString());
      localStorage.setItem("waterGlasses", formData.waterGlasses.toString());
      localStorage.setItem("caloriesConsumed", formData.caloriesConsumed.toString());
      localStorage.setItem("workoutMinutes", formData.workoutMinutes.toString());
      localStorage.setItem("mood", formData.mood);

      fetchLogs(); // Refresh DB entries
      setFormData({ 
        workoutMinutes: 0, 
        caloriesBurned: 0, 
        caloriesConsumed: 0, 
        sleepHours: 0, 
        waterGlasses: 0, 
        mood: "Good" 
      });
      setFoodResult(null);
      setFoodQuery("");
    } catch (error) {
      console.error("Error submitting health log:", error);
    }
  };

  // (Presets removed — form is purely user-driven)

  // Food Calorie Search handler
  const handleFoodSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodQuery.trim()) return;

    setIsSearchingFood(true);
    setFoodError("");
    setFoodResult(null);

    try {
      const res = await axios.get(`https://vitacore-backend-sue1.onrender.com/api/health/nutrition?query=${encodeURIComponent(foodQuery)}`);
      if (res.data && Array.isArray(res.data.items)) {
        if (res.data.items.length === 0) {
          const hint = res.data.hint || "";
          setFoodError(
            `We couldn't find those foods. ${hint || "Try names like 'oatmeal', 'banana', 'rice', 'dal', 'roti'."}`
          );
        } else {
          setFoodResult(res.data.items);
        }
      } else {
        setFoodError("Something went wrong. Please try again!");
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setFoodError("Please log in first to use this feature.");
      } else {
        setFoodError("Could not connect. Please check your connection and try again.");
      }
    } finally {
      setIsSearchingFood(false);
    }
  };

  const applyFoodToLog = () => {
    if (!foodResult) return;
    const totalCalories = foodResult.reduce((sum, item) => sum + (item.calories || 0), 0);
    setFormData(prev => ({
      ...prev,
      caloriesConsumed: Math.round(totalCalories)
    }));
    // Clear search so it feels completed
    setFoodResult(null);
    setFoodQuery("");
  };

  // Derive status from logs
  const safeLogs = Array.isArray(logs) ? logs : [];
  const latestLog = safeLogs[0] || { caloriesConsumed: 0, sleepHours: 0, waterGlasses: 0, workoutMinutes: 0, caloriesBurned: 0 };
  const calories = latestLog.caloriesConsumed || 0;
  const sleep = latestLog.sleepHours || 0;
  const water = latestLog.waterGlasses || 0;
  const workoutMinutes = latestLog.workoutMinutes || 0;
  const totalLogs = safeLogs.length;
  const score = safeLogs.length > 0 ? 85 + Math.min(10, safeLogs.length) : 0;

  // Pie chart calculation
  const COLORS = ["#c084fc", "rgba(255,255,255,0.06)"];
  const calData = [
    { name: "Consumed", value: calories },
    { name: "Remaining", value: Math.max(0, 3000 - calories) }
  ];

  // Sleep history calculation
  const sleepHistoryData = useMemo((): SleepDataPoint[] => {
    const historicalPoints: SleepDataPoint[] = safeLogs.slice(0, 7).reverse().map((l: HealthLog, i: number) => ({
      day: l.date ? new Date(l.date).toLocaleDateString([], { weekday: 'short' }) : `Day ${i + 1}`,
      hours: l.sleepHours || 0
    }));

    if (historicalPoints.length === 0) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
        day,
        hours: 0
      }));
    }
    return historicalPoints;
  }, [logs]);

  // Calendar month calculation
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday = 0, Sunday = 6 index:
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; 
    const prevDaysInMonth = new Date(year, month, 0).getDate();

    const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    // Previous month padding cells (faded)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevDaysInMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevDaysInMonth - i)
      });
    }

    // Current month cells
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    // Next month padding cells to fill grid (42 cells total)
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    // Map each cell to matched log in safeLogs
    const matchedLogs = cells.map((cell): CalendarCell => {
      const cellDateStr = cell.date.toDateString();
      const log = safeLogs.find((l: HealthLog) => {
        if (!l.date) return false;
        return new Date(l.date).toDateString() === cellDateStr;
      });
      return { ...cell, log };
    });

    return {
      year,
      month,
      monthName: monthNames[month],
      matchedLogs
    };
  }, [logs, currentDate]);


  return (
    <AppLayout>
      <div className="min-h-full py-8 px-4 md:px-8 relative selection:bg-violet-500/30 font-sans flex flex-col" style={{ background: themeColors.background }}>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: "url('/health_bg.png')" }}
        />

        <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start w-full flex-1">
                        {/* ── LEFT PANEL: Food Search & Logging ── */}
            <div className="xl:col-span-1 flex flex-col gap-6 xl:sticky xl:top-8 shrink-0">
              
              {/* Standard Health Form */}
              <Card className="glass-card border border-slate-800/80 bg-slate-950/85 backdrop-blur-xl shadow-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-md font-bold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-violet-400" /> Enter today's log
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-1">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3.5">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Calories Eaten</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={formData.caloriesConsumed || ""} 
                            onChange={e => setFormData({ ...formData, caloriesConsumed: e.target.value === "" ? 0 : Number(e.target.value) })}
                            className="bg-slate-900/80 border border-slate-800 rounded-xl focus:border-violet-500 text-white font-semibold text-sm h-10"
                            required 
                          />
                          <span className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-500">kcal</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hours Slept</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.5"
                            value={formData.sleepHours || ""} 
                            onChange={e => setFormData({ ...formData, sleepHours: e.target.value === "" ? 0 : Number(e.target.value) })}
                            className="bg-slate-900/80 border border-slate-800 rounded-xl focus:border-violet-500 text-white font-semibold text-sm h-10"
                            required 
                          />
                          <span className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-500">hrs</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Water Drunk</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={formData.waterGlasses || ""} 
                            onChange={e => setFormData({ ...formData, waterGlasses: e.target.value === "" ? 0 : Number(e.target.value) })}
                            className="bg-slate-900/80 border border-slate-800 rounded-xl focus:border-violet-500 text-white font-semibold text-sm h-10"
                            required 
                          />
                          <span className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-500">glasses</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Workout Minutes</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={formData.workoutMinutes || ""} 
                            onChange={e => setFormData({ ...formData, workoutMinutes: e.target.value === "" ? 0 : Number(e.target.value) })}
                            className="bg-slate-900/80 border border-slate-800 rounded-xl focus:border-violet-500 text-white font-semibold text-sm h-10"
                            required 
                          />
                          <span className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-500">mins</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Mood</label>
                        <select 
                          value={formData.mood}
                          onChange={e => setFormData({ ...formData, mood: e.target.value as any })}
                          className="bg-slate-900/80 border border-slate-800 rounded-xl focus:border-violet-500 text-white font-semibold text-sm px-3 h-10 cursor-pointer outline-none"
                        >
                          <option value="Great">😄 Great</option>
                          <option value="Good">🙂 Good</option>
                          <option value="Neutral">😐 Neutral</option>
                          <option value="Bad">🙁 Bad</option>
                          <option value="Terrible">😫 Terrible</option>
                        </select>
                      </div>

                    </div>

                    <Button 
                      type="submit" 
                      className="w-full mt-2 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black rounded-xl border-0 shadow-lg shadow-violet-950/20"
                    >
                      SAVE DAILY LOG
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </div>

            {/* ── RIGHT PANEL: Main Health Stats Hub ── */}
            <div className="xl:col-span-3 flex flex-col gap-6 md:gap-8 xl:pr-4 xl:pb-12">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    My Health Hub
                  </h1>
                  <p className="text-slate-200 mt-1 font-semibold text-xs md:text-sm">
                    Simple charts to track your energy, sleep, and workouts.
                  </p>
                </div>

                {/* Score badge */}
                <div className="glass-card border border-slate-800/80 bg-slate-900/85 backdrop-blur-md px-5 py-2.5 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase block">Health Score</span>
                    <h3 className="text-white text-xl font-black">{score}%</h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <HeartPulse className="text-violet-400 h-4.5 w-4.5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Glowing Metrics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Calories Eaten"
                  value={calories}
                  unit="kcal"
                  icon={<Flame className="h-4.5 w-4.5 text-orange-500" />}
                  description="Goal: Under 3000 kcal"
                  valueClassName="text-orange-400"
                />
                <MetricCard
                  title="Hours Slept"
                  value={sleep}
                  unit="hrs"
                  icon={<Moon className="h-4.5 w-4.5 text-indigo-500" />}
                  description="Goal: 8.0 hrs sleep"
                  valueClassName="text-indigo-400"
                />
                <MetricCard
                  title="Water Drunk"
                  value={water}
                  unit="glasses"
                  icon={<Droplets className="h-4.5 w-4.5 text-cyan-500" />}
                  description="Goal: 8 glasses daily"
                  valueClassName="text-cyan-400"
                />
                <MetricCard
                  title="Days Logged"
                  value={totalLogs}
                  unit="days"
                  icon={<ClipboardCheck className="h-4.5 w-4.5 text-emerald-500" />}
                  description="Total database entries"
                  valueClassName="text-emerald-400"
                />
              </div>

              {/* Charts Container */}
              <div className="flex flex-col gap-6">
                
                {/* Row 1: Calorie Tracker and Sleep History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Balance Wheel (Daily Calorie Tracker) (Left 1/3 column) */}
                  <Card className="glass-card border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle className="text-white text-md font-bold">Daily Calorie Tracker</CardTitle>
                      <CardDescription className="text-slate-400 text-xs">Track how close you are to your daily calorie limit.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center flex-grow pt-0 pb-4">
                      <div className="relative w-36 h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={calData} innerRadius={52} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                              {calData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-2xl font-black text-white leading-none">{calories}</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">/ 3000 kcal</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sleep Area chart (Right 2/3 column) */}
                  <Card className="glass-card border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-md font-bold">Sleep History</CardTitle>
                      <CardDescription className="text-slate-400 text-xs">Total hours slept over your last 7 logs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-44 w-full">
                        <AreaChart data={sleepHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSleepHealth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-hours)" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="var(--color-hours)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                          <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.4)" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={9} tickLine={false} axisLine={false} domain={[0, 12]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="hours" stroke="var(--color-hours)" strokeWidth={3.5} fillOpacity={1} fill="url(#colorSleepHealth)" name="hours" />
                        </AreaChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                </div>

                {/* Row 2: Calendar and Calorie Lookup */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Activity Log (Calendar) (Left 2/3 column) */}
                  <Card className="glass-card border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl lg:col-span-2 flex flex-col justify-between overflow-visible p-4">
                    <CardHeader className="pb-4 px-2">
                      <CardTitle className="text-white text-md font-bold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-violet-400" /> My Activity History
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs">
                        Hover over active dates to see your logged metrics.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0 overflow-visible flex-grow">
                      {/* Calendar Container */}
                      <div className="flex flex-col select-none overflow-visible max-w-md mx-auto w-full">
                        {/* Header Month Selector */}
                        <div className="flex items-center justify-between mb-2 px-2">
                          <button 
                            onClick={handlePrevMonth}
                            type="button"
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <h3 className="text-white font-extrabold text-sm tracking-wide">
                            {calendarData.monthName} {calendarData.year}
                          </h3>
                          <button 
                            onClick={handleNextMonth}
                            type="button"
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Day Titles MON -> SUN */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                            <span key={d} className="text-[10px] font-black text-slate-500 tracking-wider">
                              {d}
                            </span>
                          ))}
                        </div>

                        {/* Grid Cells */}
                        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 relative overflow-visible">
                          {calendarData.matchedLogs.map((cell, idx) => {
                            const isLogged = !!cell.log;
                            const log = cell.log;

                            // Get mood details
                            let moodEmoji = "🙂 Good";
                            let moodBadgeColor = "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
                            if (log) {
                              switch (log.mood) {
                                case "Great":
                                  moodEmoji = "😄 Great";
                                  moodBadgeColor = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                                  break;
                                case "Good":
                                  moodEmoji = "🙂 Good";
                                  moodBadgeColor = "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
                                  break;
                                case "Neutral":
                                  moodEmoji = "😐 Neutral";
                                  moodBadgeColor = "bg-slate-500/20 text-slate-300 border border-slate-500/30";
                                  break;
                                case "Bad":
                                  moodEmoji = "🙁 Bad";
                                  moodBadgeColor = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
                                  break;
                                case "Terrible":
                                  moodEmoji = "😫 Terrible";
                                  moodBadgeColor = "bg-red-500/20 text-red-400 border border-red-500/30";
                                  break;
                              }
                            }

                            return (
                              <div 
                                key={idx}
                                className="group relative flex items-center justify-center h-9 overflow-visible"
                              >
                                {/* Cell circle */}
                                <div 
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all relative ${
                                    !cell.isCurrentMonth 
                                      ? "text-slate-700 font-medium" 
                                      : isLogged 
                                        ? "bg-violet-600 text-white font-extrabold shadow-md shadow-violet-600/30 cursor-pointer scale-105" 
                                        : "text-slate-300 hover:bg-slate-800/30 cursor-pointer"
                                  }`}
                                >
                                  {cell.day}
                                  
                                  {/* Small indicator dot for active day */}
                                  {isLogged && (
                                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white opacity-80" />
                                  )}
                                </div>

                                {/* Tooltip on Hover */}
                                {isLogged && log && (
                                  <div 
                                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-slate-950/95 border border-slate-800 rounded-2xl p-3.5 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 flex flex-col gap-2"
                                    style={{ backdropFilter: "blur(12px)", transformOrigin: "bottom center" }}
                                  >
                                    {/* Mood on Top */}
                                    <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1">
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mood</span>
                                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${moodBadgeColor}`}>
                                        {moodEmoji}
                                      </span>
                                    </div>

                                    {/* Metrics List */}
                                    <div className="flex flex-col gap-1.5 text-[11px] font-semibold text-slate-300">
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                          <Flame size={12} className="text-orange-500" /> Calories:
                                        </span>
                                        <span className="font-extrabold text-white">{log.caloriesConsumed} kcal</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                          <Droplets size={12} className="text-cyan-500" /> Water:
                                        </span>
                                        <span className="font-extrabold text-white">{log.waterGlasses} glasses</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                          <Activity size={12} className="text-violet-400" /> Workout:
                                        </span>
                                        <span className="font-extrabold text-white">{log.workoutMinutes} mins</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                          <Moon size={12} className="text-indigo-400" /> Sleep:
                                        </span>
                                        <span className="font-extrabold text-white">{log.sleepHours} hrs</span>
                                      </div>
                                    </div>

                                    {/* Small Arrow indicator for the tooltip */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-800 rotate-45 -mt-1" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calorie Lookup Card (Upgraded UI, Right 1/3 column) */}
                  <Card className="glass-card border border-slate-800/80 bg-slate-950/85 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-full">
                    {!showCalorieLookup ? (
                      <CardContent className="p-4 flex flex-col gap-3 flex-grow">
                        {/* Header */}
                        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-4">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500/20 to-fuchsia-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
                            <Flame className="h-4 w-4 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-black tracking-tight">Today's Calories</h4>
                            <p className="text-slate-500 text-[10px] font-medium">Daily calorie summary</p>
                          </div>
                        </div>

                        {/* Big calorie number */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white tracking-tight">{calories}</span>
                            <span className="text-slate-400 text-sm font-bold">/ 3000</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">kcal consumed</span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex flex-col gap-2">
                          <div className="w-full h-1.5 rounded-full bg-slate-800/60 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.round((calories / 3000) * 100))}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-1.5 rounded-full ${
                                calories > 2700
                                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                                  : calories > 2000
                                  ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                  : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                              }`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500">0 kcal</span>
                            <span className={`${calories > 2700 ? "text-red-400" : calories > 2000 ? "text-amber-400" : "text-violet-400"}`}>
                              {Math.min(100, Math.round((calories / 3000) * 100))}% of goal
                            </span>
                            <span className="text-slate-500">3000 kcal</span>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900/50 rounded-xl border border-slate-800/60 p-3 flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Consumed</span>
                            <span className="text-base font-black text-orange-400">{calories}</span>
                            <span className="text-[9px] text-slate-600 font-semibold">kcal</span>
                          </div>
                          <div className="bg-slate-900/50 rounded-xl border border-slate-800/60 p-3 flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Remaining</span>
                            <span className={`text-base font-black ${Math.max(0, 3000 - calories) < 300 ? "text-red-400" : "text-emerald-400"}`}>
                              {Math.max(0, 3000 - calories)}
                            </span>
                            <span className="text-[9px] text-slate-600 font-semibold">kcal left</span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className={`px-3.5 py-2.5 rounded-xl border text-center ${
                          calories > 2700
                            ? "bg-red-950/20 border-red-900/40 text-red-400"
                            : calories > 2000
                            ? "bg-amber-950/20 border-amber-900/40 text-amber-400"
                            : calories === 0
                            ? "bg-slate-900/30 border-slate-800/40 text-slate-400"
                            : "bg-green-950/20 border-green-900/40 text-green-400"
                        }`}>
                          <span className="text-[11px] font-black">
                            {calories > 2700 ? "⚠️ Near limit — watch intake" :
                             calories > 2000 ? "🔥 Good progress today" :
                             calories === 0 ? "📋 No entry logged yet" :
                             "✅ On track — keep it up!"}
                          </span>
                        </div>

                        {/* Divider with label */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-slate-800/60" />
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Food Lookup</span>
                          <div className="flex-1 h-px bg-slate-800/60" />
                        </div>

                        {/* Lookup trigger */}
                        <div className="flex flex-col gap-2 mt-auto">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.08, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30 shrink-0 cursor-pointer"
                              onClick={() => setShowCalorieLookup(true)}
                            >
                              <Apple className="h-5 w-5 text-violet-400" />
                            </motion.div>
                          </div>
                          <Button
                            onClick={() => setShowCalorieLookup(true)}
                            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-black text-[10px] py-1 rounded-xl h-8 border-0 cursor-pointer shadow-lg shadow-violet-950/40"
                          >
                            Lookup Food
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-white text-xs font-black flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Apple className="h-4.5 w-4.5 text-violet-400" /> Food Telemetry
                            </span>
                            <Button 
                              variant="ghost" 
                              onClick={() => setShowCalorieLookup(false)}
                              className="text-[10px] text-slate-400 hover:text-white h-7 px-2 hover:bg-slate-900 border-0"
                            >
                              Back
                            </Button>
                          </CardTitle>
                          <CardDescription className="text-slate-400 text-[11px] leading-relaxed">
                            Specify foods and quantities (e.g., "2 bananas and 1 glass milk").
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2 pb-5 flex flex-col gap-4 flex-grow justify-between">
                          <div className="flex flex-col gap-3">
                            <form onSubmit={handleFoodSearch} className="flex gap-2">
                              <Input 
                                placeholder="e.g. 1 bowl oatmeal and 1 apple"
                                value={foodQuery}
                                onChange={e => setFoodQuery(e.target.value)}
                                className="bg-slate-900/80 border border-slate-800 rounded-xl focus:border-violet-500 text-white font-medium text-xs h-9 flex-grow"
                              />
                              <Button 
                                type="submit" 
                                disabled={isSearchingFood}
                                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-9 px-3 shrink-0 flex items-center justify-center border-0 cursor-pointer"
                              >
                                <Search size={14} />
                              </Button>
                            </form>

                            {/* Suggestion Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {[
                                { label: "Dal & Rice", query: "1 bowl dal and 1 cup rice" },
                                { label: "Oatmeal", query: "1 bowl oatmeal with banana" },
                                { label: "Egg Toast", query: "2 boiled eggs and 2 slices brown bread" },
                                { label: "Apple Shake", query: "1 apple and 1 glass milk" }
                              ].map((chip) => (
                                <button
                                  key={chip.label}
                                  type="button"
                                  onClick={() => {
                                    setFoodQuery(chip.query);
                                  }}
                                  className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-slate-900/50 hover:bg-violet-950/40 text-slate-400 hover:text-violet-300 border border-slate-800/80 hover:border-violet-800/50 transition-all cursor-pointer"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Content */}
                          <div className="flex-grow flex flex-col justify-center min-h-[120px]">
                            {isSearchingFood && (
                              <div className="flex flex-col items-center justify-center gap-2 py-4">
                                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-violet-400 font-bold tracking-wide animate-pulse">Running Food Telemetry...</span>
                              </div>
                            )}

                            {foodError && !isSearchingFood && (
                              <div className="text-[11px] text-red-400 font-bold text-center leading-relaxed bg-red-950/20 border border-red-900/30 p-2.5 rounded-xl">
                                ⚠️ {foodError}
                              </div>
                            )}

                            {foodResult && !isSearchingFood && (
                              <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col gap-2 shadow-inner">
                                <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Matched Biometrics</div>
                                <div className="flex flex-col gap-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                                  {foodResult.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs font-semibold text-slate-200">
                                      <span className="capitalize text-slate-350">{item.name}</span>
                                      <span className="text-violet-300 font-extrabold text-[11px]">{Math.round(item.calories)} kcal</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="border-t border-slate-800/80 pt-2 mt-1 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Total Consumed</span>
                                    <span className="text-sm font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                      {Math.round(foodResult.reduce((sum, item) => sum + (item.calories || 0), 0))} kcal
                                    </span>
                                  </div>
                                  <Button 
                                    type="button" 
                                    onClick={applyFoodToLog}
                                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-extrabold text-[10px] py-1 h-8 rounded-lg border-0 px-3 cursor-pointer shadow-md shadow-violet-950/20"
                                  >
                                    Apply to Daily Log
                                  </Button>
                                </div>
                              </div>
                            )}

                            {!isSearchingFood && !foodError && !foodResult && (
                              <div className="flex flex-col items-center justify-center text-slate-500 py-6 text-center">
                                <div className="w-8 h-8 rounded-full bg-slate-900/30 flex items-center justify-center mb-1.5 border border-slate-800/40">
                                  <Search size={14} className="text-slate-450" />
                                </div>
                                <span className="text-[10px] font-semibold">No food loaded yet</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </>
                    )}
                  </Card>

                </div>

              </div>

              {/* AI Fitness Coach Card */}
              <Card className="glass-card border border-slate-800/80 bg-slate-950/85 backdrop-blur-xl shadow-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg font-black flex items-center gap-2">
                    <Activity className="h-5 w-5 text-violet-400 animate-pulse" />
                    AI Fitness Coach
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Get a customized exercise plan generated instantly based on your latest logged metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 flex flex-col gap-6">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <Button
                      onClick={generateFitnessPlan}
                      disabled={isGeneratingPlan}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl h-11 border-0 cursor-pointer shadow-lg shadow-violet-950/30 flex items-center gap-2"
                    >
                      {isGeneratingPlan ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing &amp; Generating...
                        </>
                      ) : (
                        "Generate My Fitness Plan"
                      )}
                    </Button>

                    {fitnessError && (
                      <span className="text-red-400 text-xs font-bold bg-red-950/30 border border-red-900/50 px-3.5 py-1.5 rounded-xl">
                        ⚠️ {fitnessError}
                      </span>
                    )}
                  </div>

                  {isGeneratingPlan && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-350 text-xs font-bold animate-pulse">Running health logs analysis and retrieving exercises...</p>
                    </div>
                  )}

                  {fitnessPlan && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-6"
                    >
                      {/* Health Analysis Status */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-slate-200 text-sm font-bold tracking-tight border-l-2 border-violet-500 pl-2">Health Analysis</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sleep Status</span>
                              <span className="text-white text-xs font-semibold">{sleep} hrs</span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              sleep < 6 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              sleep < 7.5 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-green-500/10 text-green-400 border border-green-500/20"
                            }`}>
                              {sleep < 6 ? "Critical" : sleep < 7.5 ? "Moderate" : "Good"}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hydration Status</span>
                              <span className="text-white text-xs font-semibold">{water} glasses</span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              water < 6 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              water < 8 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-green-500/10 text-green-400 border border-green-500/20"
                            }`}>
                              {water < 6 ? "Critical" : water < 8 ? "Moderate" : "Good"}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Activity Status</span>
                              <span className="text-white text-xs font-semibold">{workoutMinutes} mins</span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              workoutMinutes < 20 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              workoutMinutes < 45 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-green-500/10 text-green-400 border border-green-500/20"
                            }`}>
                              {workoutMinutes < 20 ? "Critical" : workoutMinutes < 45 ? "Moderate" : "Good"}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mood Status</span>
                              <span className="text-white text-xs font-semibold">{latestLog.mood || 'Good'}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              (latestLog.mood === 'Bad' || latestLog.mood === 'Terrible') ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              latestLog.mood === 'Neutral' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-green-500/10 text-green-400 border border-green-500/20"
                            }`}>
                              {(latestLog.mood === 'Bad' || latestLog.mood === 'Terrible') ? "Critical" : latestLog.mood === 'Neutral' ? "Moderate" : "Good"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detected Issues */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-slate-200 text-sm font-bold tracking-tight border-l-2 border-violet-500 pl-2">Detected Issues</h4>
                        {fitnessPlan.issues.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {fitnessPlan.issues.map((issue) => {
                              let text = "";
                              switch (issue) {
                                case "poor_sleep": text = "Poor Sleep (< 6 hours slept)"; break;
                                case "dehydration": text = "Dehydration (< 6 glasses of water)"; break;
                                case "high_calories": text = "High Calories consumed (> 2500 kcal)"; break;
                                case "inactive": text = "Inactive Day (< 20 mins workout)"; break;
                                case "stress": text = "Elevated Stress (Mood reported as Bad/Terrible)"; break;
                                default: text = issue;
                              }
                              return (
                                <span key={issue} className="bg-red-95/30 text-red-400 border border-red-900/50 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                  <ShieldAlert size={14} className="text-red-500" />
                                  {text}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-green-950/10 border border-green-900/30 text-green-400 text-xs font-bold">
                            ✅ No major health issues detected in your latest log. Amazing job maintaining your routine!
                          </div>
                        )}
                      </div>

                      {/* Recommended Goal */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/30 to-indigo-950/30 border border-violet-800/40">
                        <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-widest block mb-1">Recommended Goal</span>
                        <h5 className="text-white text-md font-black capitalize">{fitnessPlan.category} Training Plan</h5>
                        <p className="text-slate-300 text-xs mt-1.5 leading-relaxed font-semibold">
                          {fitnessPlan.category === 'yoga' && "Focus on slow, mindful movements, deep breathing, and light stretching to reduce cortisol (stress) and prepare your body for deep restorative sleep."}
                          {fitnessPlan.category === 'cardio' && "Focus on active cardiovascular work to burn off high calorie intake, improve circulation, and build aerobic capacity."}
                          {fitnessPlan.category === 'strength' && "Focus on muscle engagement and strength exercises to wake up inactive muscle groups, improve core stability, and kickstart metabolism."}
                          {fitnessPlan.category === 'general fitness' && "Focus on a balanced routine of strength, mobility, and steady-state cardiovascular work to maintain your excellent current health status."}
                        </p>
                      </div>

                      {/* Recommended Exercises */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-slate-200 text-sm font-bold tracking-tight border-l-2 border-violet-500 pl-2">Recommended Exercises</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fitnessPlan.exercises.map((ex, i) => (
                            <motion.div
                              whileHover={{ y: -3 }}
                              key={i}
                              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col justify-between shadow-lg"
                            >
                              <div className="w-full h-40 bg-slate-950/80 flex items-center justify-center relative overflow-hidden border-b border-slate-850">
                                <img
                                  src={ex.gifUrl}
                                  alt={ex.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><text x='50' y='50' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'>No Animation</text></svg>";
                                  }}
                                />
                              </div>
                              <div className="p-4 flex flex-col gap-3.5">
                                <div>
                                  <h6 className="text-white text-sm font-black capitalize line-clamp-1">{ex.name}</h6>
                                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block mt-1">Target: {ex.target}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                  <div className="bg-slate-950/40 border border-slate-850 p-1.5 rounded-lg text-center">
                                    <span className="text-slate-500 block text-[9px] mb-0.5">Equipment</span>
                                    <span className="text-slate-200 line-clamp-1">{ex.equipment}</span>
                                  </div>
                                  <div className="bg-slate-950/40 border border-slate-850 p-1.5 rounded-lg text-center">
                                    <span className="text-slate-500 block text-[9px] mb-0.5">Body Part</span>
                                    <span className="text-slate-200 line-clamp-1">{ex.bodyPart}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
