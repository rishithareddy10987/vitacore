import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export interface Achievement {
  id: number;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export interface GamificationData {
  level: number;
  xp: number;
  levelName: string;
  streak: number;
  loading: boolean;
  achievements: Achievement[];
}

export function useGamification(): GamificationData {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<GamificationData>({
    level: 1,
    xp: 0,
    levelName: "Digital Novice",
    streak: 0,
    loading: true,
    achievements: [],
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setData({
        level: 1,
        xp: 0,
        levelName: "Digital Novice",
        streak: 0,
        loading: false,
        achievements: [],
      });
      return;
    }

    const fetchAllLogs = async () => {
      try {
        const [healthRes, financeRes, careerRes] = await Promise.all([
          axios.get("https://vitacore-backend-sue1.onrender.com/api/health"),
          axios.get("https://vitacore-backend-sue1.onrender.com/api/finance"),
          axios.get("https://vitacore-backend-sue1.onrender.com/api/career"),
        ]);

        const healthLogs = Array.isArray(healthRes.data) ? healthRes.data : [];
        const financeLogs = Array.isArray(financeRes.data) ? financeRes.data : [];
        const careerLogs = Array.isArray(careerRes.data) ? careerRes.data : [];

        const hCount = healthLogs.length;
        const fCount = financeLogs.length;
        const cCount = careerLogs.length;

        // Base XP calculation
        const totalXp = (hCount * 150) + (fCount * 100) + (cCount * 250);
        const level = Math.floor(totalXp / 5000) + 1;
        const xp = totalXp % 5000;
        
        let levelName = "Digital Novice";
        if (level >= 10) levelName = "Digital Optimizer";
        else if (level >= 6) levelName = "Systematic Tracker";
        else if (level >= 3) levelName = "Habit Builder";

        // Calculate streak
        const allDates = new Set<string>();
        [...healthLogs, ...financeLogs, ...careerLogs].forEach(log => {
          const dateVal = log.date || log.createdAt;
          if (dateVal) {
            allDates.add(new Date(dateVal).toDateString());
          }
        });

        const sortedDates = Array.from(allDates).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let checkDate = new Date(today);
        
        const hasToday = sortedDates.some(d => d.toDateString() === today.toDateString());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const hasYesterday = sortedDates.some(d => d.toDateString() === yesterday.toDateString());

        if (hasToday || hasYesterday) {
          if (!hasToday) {
            checkDate = yesterday;
          }
          
          while (true) {
            const dateStr = checkDate.toDateString();
            const found = sortedDates.some(d => d.toDateString() === dateStr);
            if (found) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        // Calculate Dynamic Achievements based on real MongoDB documents
        const achievementsList: Achievement[] = [
          {
            id: 1,
            name: "First Blood",
            desc: "Complete your first workout",
            icon: "Flame",
            unlocked: healthLogs.some((log: any) => (log.workoutMinutes || 0) > 0),
          },
          {
            id: 2,
            name: "Frugal Master",
            desc: "Save over 30% of income",
            icon: "PiggyBank",
            unlocked: (() => {
              const totalIncome = financeLogs
                .filter((f: any) => f.type === "Income")
                .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
              const totalExpense = financeLogs
                .filter((f: any) => f.type === "Expense")
                .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
              if (totalIncome > 0) {
                const savingsRate = (totalIncome - totalExpense) / totalIncome;
                return savingsRate >= 0.30;
              }
              return false;
            })(),
          },
          {
            id: 3,
            name: "Night Owl",
            desc: "Study past 10 PM 5 times",
            icon: "Moon",
            unlocked: careerLogs.filter((log: any) => {
              const dateVal = log.date || log.createdAt;
              if (!dateVal) return false;
              const hr = new Date(dateVal).getHours();
              return hr >= 22 || hr <= 4;
            }).length >= 5,
          },
          {
            id: 4,
            name: "Early Bird",
            desc: "Log a morning workout before 9 AM",
            icon: "Sun",
            unlocked: healthLogs.filter((log: any) => {
              const dateVal = log.date || log.createdAt;
              if (!dateVal) return false;
              const hr = new Date(dateVal).getHours();
              return (log.workoutMinutes || 0) > 0 && (hr >= 4 && hr <= 9);
            }).length >= 1,
          },
          {
            id: 5,
            name: "Code Ninja",
            desc: "Achieve a 5-day daily logging streak",
            icon: "Code",
            unlocked: streak >= 5,
          },
          {
            id: 6,
            name: "Iron Lungs",
            desc: "Complete a workout of 60+ minutes",
            icon: "Wind",
            unlocked: healthLogs.some((log: any) => (log.workoutMinutes || 0) >= 60),
          },
          {
            id: 7,
            name: "Investor",
            desc: "Log an income or investment transaction",
            icon: "TrendingUp",
            unlocked: financeLogs.some(
              (f: any) =>
                f.type === "Income" ||
                f.category.toLowerCase().includes("invest") ||
                f.description?.toLowerCase().includes("stock") ||
                f.description?.toLowerCase().includes("vanguard")
            ),
          },
          {
            id: 8,
            name: "Hydrated",
            desc: "Drink 8+ glasses of water in a single day",
            icon: "Droplets",
            unlocked: healthLogs.some((log: any) => (log.waterGlasses || 0) >= 8),
          },
          {
            id: 9,
            name: "Marathoner",
            desc: "Burn 500+ calories in a single workout",
            icon: "Medal",
            unlocked: healthLogs.some((log: any) => (log.caloriesBurned || 0) >= 500),
          },
          {
            id: 10,
            name: "Unicorn",
            desc: "Reach net savings of over ₹50,000",
            icon: "Star",
            unlocked: (() => {
              const totalIncome = financeLogs
                .filter((f: any) => f.type === "Income")
                .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
              const totalExpense = financeLogs
                .filter((f: any) => f.type === "Expense")
                .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
              return (totalIncome - totalExpense) >= 50000;
            })(),
          },
          {
            id: 11,
            name: "CTO Material",
            desc: "Log 10+ hours (600+ minutes) of total study time",
            icon: "Award",
            unlocked: careerLogs.reduce((sum: number, log: any) => sum + (log.durationMinutes || 0), 0) >= 600,
          },
          {
            id: 12,
            name: "Zen Master",
            desc: "Complete your first deep focus study session",
            icon: "Brain",
            unlocked: careerLogs.length >= 1,
          },
        ];

        setData({
          level,
          xp,
          levelName,
          streak,
          loading: false,
          achievements: achievementsList,
        });
      } catch (error) {
        console.error("Error fetching gamification data:", error);
        setData({
          level: 1,
          xp: 0,
          levelName: "Digital Novice",
          streak: 0,
          loading: false,
          achievements: [],
        });
      }
    };

    fetchAllLogs();
  }, [isLoggedIn]);

  return data;
}
