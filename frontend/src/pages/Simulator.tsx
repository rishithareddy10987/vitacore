import React, { useState } from "react";
import axios from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/context/ThemeContext";
import { Beaker, Zap, TrendingUp, Sparkles, Brain } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Simulator() {
  const { themeColors, theme } = useTheme();

  const [params, setParams] = useState({
    study: 2,
    exercise: 3,
    savings: 30,
    sleep: 7,
    dining: 4,
  });

  const [isSimulating, setIsSimulating] = useState(false);

 const [aiInsight, setAiInsight] = useState<string | null>(
  "Adjust sliders and click Generate AI Insight."
);

  const [isAiLoading, setIsAiLoading] = useState(false);

 const [simulationResult, setSimulationResult] = useState({
  health_score: 0,
  finance_score: 0,
  career_score: 0,
  overall_score: 0,
  monthly_savings: 0,
});

  // =========================
  // REAL AI BACKEND FUNCTION
  // =========================

  const fetchAiInsight = async () => {

    setIsAiLoading(true);

    try {

      const response = await axios.post(
        "https://vitacore-ml.onrender.com/simulate",
        {
          sleep: params.sleep,
          exercise: params.exercise,
          water: 2,
          expenses: params.dining * 2000,
          income: 50000,
          codingHours: params.study
        }
      );

     setSimulationResult(response.data);

console.log("ML Response:", response.data);

setAiInsight(response.data.insight);

    } catch (error) {

      console.error("Backend Error:", error);

      setAiInsight(
        "Failed to connect with AI backend. Make sure FastAPI server is running."
      );

    } finally {

      setIsAiLoading(false);

    }
  };

  // =========================
  // CHART DATA
  // =========================

  const generateData = () => {

    const data = [];

    let baseHealth =
      70 +
      (params.exercise * 2) +
      ((params.sleep - 6) * 5) -
      (params.dining * 1);

    let baseFinance =
      5000 +
      (params.savings * 100) -
      (params.dining * 200);

    let baseCareer =
      60 +
      (params.study * 5) -
      (params.sleep < 6 ? 10 : 0);

    for (let i = 0; i < 6; i++) {
      data.push({
        month: `Month ${i + 1}`,
        health: Math.min(100, Math.max(0, baseHealth + (i * (params.exercise * 0.5)))),
        finance: baseFinance + (i * params.savings * 50),
        career: Math.min(
          100,
          Math.max(0, baseCareer + (i * params.study))
        ),
      });
    }

    return data;
  };

  const chartData = generateData();

  const handleSliderChange = (
    key: keyof typeof params,
    value: number
  ) => {

    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));

    setIsSimulating(true);

    setTimeout(() => setIsSimulating(false), 500);
  };

  return (
    <AppLayout>
      <div className="min-h-full py-8 px-4 md:px-8 relative selection:bg-violet-500/30 font-sans" style={{ background: themeColors.background }}>
        
        {/* Ambient glow orbs */}
        <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-radial-gradient from-violet-500/5 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-[-5%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-radial-gradient from-pink-500/5 to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6 md:gap-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-violet-500/10 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                AI Simulation Engine
              </h1>
              <p className="text-slate-400 mt-1.5 font-medium text-sm md:text-base">
                Adjust control parameters to project future health, wealth, and career state vectors.
              </p>
            </div>

            {/* Status indicator */}
            <div className="flex items-center">
              {isSimulating ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-violet-500/15 border border-violet-500/30 text-white rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-violet-950/20"
                >
                  <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-ping" />
                  <span>Processing...</span>
                </motion.div>
              ) : (
                <div className="bg-slate-900/85 border border-slate-800 text-slate-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span>Simulation Idle</span>
                </div>
              )}
            </div>
          </div>

          {/* Main simulator grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Controls panel - 4 Cols */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="lg:col-span-4"
            >
              <Card className="glass-card neon-border border-0 bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="pb-4 border-b border-slate-800/60">
                  <CardTitle className="text-sm font-bold text-slate-300 tracking-wide uppercase flex items-center gap-2">
                    <Beaker className="h-4.5 w-4.5 text-violet-400" />
                    Control Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col gap-6">
                  
                  {/* Study slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-400">Study duration</span>
                      <span className="font-extrabold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded text-xs">{params.study} h/day</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="8" 
                      step="1" 
                      value={params.study} 
                      onChange={(e) => handleSliderChange('study', Number(e.target.value))} 
                      className="w-full h-1.5 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-pink-500" 
                    />
                  </div>

                  {/* Exercise slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-400">Exercise frequency</span>
                      <span className="font-extrabold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded text-xs">{params.exercise} days/wk</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="7" 
                      step="1" 
                      value={params.exercise} 
                      onChange={(e) => handleSliderChange('exercise', Number(e.target.value))} 
                      className="w-full h-1.5 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-violet-500" 
                    />
                  </div>

                  {/* Savings slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-400">Savings Rate</span>
                      <span className="font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs">{params.savings}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="80" 
                      step="5" 
                      value={params.savings} 
                      onChange={(e) => handleSliderChange('savings', Number(e.target.value))} 
                      className="w-full h-1.5 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-blue-500" 
                    />
                  </div>

                  {/* Sleep slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-400">Sleep Allocation</span>
                      <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">{params.sleep} hrs/night</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" 
                      max="10" 
                      step="0.5" 
                      value={params.sleep} 
                      onChange={(e) => handleSliderChange('sleep', Number(e.target.value))} 
                      className="w-full h-1.5 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-emerald-500" 
                    />
                  </div>

                  {/* Dining out slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-400">Dining Out frequency</span>
                      <span className="font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs">{params.dining} meals/wk</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="14" 
                      step="1" 
                      value={params.dining} 
                      onChange={(e) => handleSliderChange('dining', Number(e.target.value))} 
                      className="w-full h-1.5 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-rose-500" 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trajectory visualization area - 8 Cols */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Trajectory chart */}
              <motion.div 
                whileHover={{ y: -4 }}
              >
                <Card className="glass-card neon-border border-0 bg-slate-900/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-violet-400" />
                      Projected Telemetry Trajectories (6 Months)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Predictive model showing monthly metrics progression.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {isSimulating && (
                      <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center rounded-xl">
                        <div className="w-9 h-9 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="simHealthGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="simCareerGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#e91e8c" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#e91e8c" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                          <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.4)" tickLine={false} axisLine={false} style={{ fontSize: "10px", fontWeight: "bold" }} />
                          <YAxis stroke="rgba(255, 255, 255, 0.4)" tickLine={false} axisLine={false} domain={[0, 100]} style={{ fontSize: "10px", fontWeight: "bold" }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "rgba(15, 12, 38, 0.95)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "12px", color: "#fff" }} />
                          <Area type="monotone" dataKey="health" stroke="#8b5cf6" strokeWidth={3} fill="url(#simHealthGrad)" name="Health Vector" />
                          <Area type="monotone" dataKey="career" stroke="#e91e8c" strokeWidth={3} fill="url(#simCareerGrad)" name="Career Vector" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Projections outcome indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Health Trajectory */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="glass-card neon-border border-0 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">Health Trajectory</span>
                 <div className="text-xl font-black text-white mt-2">
  {simulationResult.health_score > 70 ? 'Optimizing' : 'Degrading'}
</div>

<p className="text-xs text-slate-400 mt-2 font-semibold">
  End score: {simulationResult.health_score}/100
</p>
                </motion.div>
 
                {/* Wealth Creation */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="glass-card neon-border border-0 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Wealth Creation</span>
                 <div className="text-xl font-black text-white mt-2">
  ${simulationResult.monthly_savings.toLocaleString()}
</div>
                  <p className="text-xs text-slate-400 mt-2 font-semibold">
                    Predicted net liquid assets
                  </p>
                </motion.div>

                {/* Career Velocity */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="glass-card neon-border border-0 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">Career Velocity</span>
                 <div className="text-xl font-black text-white mt-2">
  {simulationResult.career_score > 80 ? 'Promotion Ready' : 'Skill Deficit'}
</div>

<p className="text-xs text-slate-400 mt-2 font-semibold">
  End score: {simulationResult.career_score}/100
</p>
                </motion.div>
              </div>

              {/* Neural analysis insights */}
              <motion.div 
                whileHover={{ y: -2 }}
              >
                <Card className="glass-card neon-border border-0 bg-slate-900/60 backdrop-blur-xl">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-white text-md font-bold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-amber-400" />
                     Future Outlook
                    </CardTitle>
                    <Button 
                      onClick={fetchAiInsight}
                      disabled={isAiLoading}
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-violet-950/20 border-0"
                    >
                      {isAiLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate AI Insight</span>
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {aiInsight ? (
                      <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 text-slate-300 text-sm leading-relaxed font-medium italic">
                        {aiInsight}
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs font-semibold">
                        Click 'Generate AI Insight' to analyze this simulation scenario.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
