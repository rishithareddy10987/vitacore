import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Send, User, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { chatMessages } from "@/data/mockData";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), sender: "user", text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("https://vitacore-backend-sue1.onrender.com/api/ai/recommend", {
        domain: "General",
        context: {
          query: input,

          health: {
            sleepHours: localStorage.getItem("sleepHours"),
            waterGlasses: localStorage.getItem("waterGlasses"),
            caloriesConsumed: localStorage.getItem("caloriesConsumed"),
            workoutMinutes: localStorage.getItem("workoutMinutes"),
            mood: localStorage.getItem("mood"),
          },

          finance: {
            income: localStorage.getItem("income"),
            expenses: localStorage.getItem("expenses"),
            savings: localStorage.getItem("savings"),
            savingsRate: localStorage.getItem("savingsRate"),
          },

          career: {
            studyHours: localStorage.getItem("studyHours"),
            completedTasks: localStorage.getItem("completedTasks"),
            focusScore: localStorage.getItem("focusScore"),
            skills: localStorage.getItem("skills"),
          }
        }
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "ai",
        text: response.data.recommendation || "I am processing that..."
      }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "ai",
        text: "System offline. Please check connection to neural engine."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 h-[500px] glass-card border-primary/20 flex flex-col overflow-hidden shadow-2xl bg-background/95"
          >
            {/* Header */}
            <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Bot size={16} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">VitaCore AI</h2>
                  <p className="text-[10px] text-primary font-medium uppercase tracking-wider">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary/20 text-white' : 'bg-primary/20 text-primary'
                    }`}>
                    {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`p-3 rounded-xl text-sm ${msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white/10 border border-primary/20 text-white rounded-tl-sm'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Bot size={12} />
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-primary/20 flex items-center gap-1 rounded-tl-sm">
                    <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/20 border-t border-primary/20">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-black/50 border-primary/20 text-white h-10 text-sm focus-visible:ring-primary"
                />
                <Button type="submit" size="icon" className="h-10 w-10 bg-primary hover:bg-primary/80 text-foreground shrink-0" disabled={!input.trim()}>
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </div>
  );
}
