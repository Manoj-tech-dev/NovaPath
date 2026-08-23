import React, { useState } from 'react';
import { Send, Sparkles, Compass, Lightbulb, ArrowRight, Bot, Search, RefreshCw } from 'lucide-react';

interface GoalInputProps {
  onPlanPath: (goal: string) => void;
  isLoading: boolean;
  activeGoal: string;
  theme?: 'dark' | 'light';
}

export const GoalInput: React.FC<GoalInputProps> = ({ 
  onPlanPath, 
  isLoading, 
  activeGoal,
  theme = 'dark' 
}) => {
  const [goal, setGoal] = useState(activeGoal || 'I want an AI/ML internship in Hyderabad.');
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoading) return;
    onPlanPath(goal.trim());
  };

  const sampleGoals = [
    { 
      label: '🚀 AI/ML in Hyderabad', 
      text: 'I want an AI/ML internship in Hyderabad.',
      category: 'Recommended'
    },
    { 
      label: '🧠 "Find for me" (Memory Recall)', 
      text: 'Find opportunities for me.',
      category: 'Memory Test'
    },
    { 
      label: '🌐 Remote Python & Data Science', 
      text: 'I want a remote Python & Data Science internship.',
      category: 'Remote'
    },
    { 
      label: '🎓 2nd Year ML Research', 
      text: 'Looking for ML research opportunities for 2nd year B.Tech.',
      category: 'Research'
    },
    { 
      label: '💻 Full-Stack Web Development', 
      text: 'Looking for React & Node.js software engineering internships in Bangalore.',
      category: 'Engineering'
    }
  ];

  return (
    <div className={`rounded-3xl p-6 sm:p-7 border relative overflow-hidden transition-all ${
      isDark
        ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100'
        : 'bg-white border-slate-200/90 shadow-xl text-slate-900'
    }`}>
      {/* Subtle Background Accent */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isDark ? 'bg-cyan-500' : 'bg-indigo-300'
      }`} />

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
            isDark 
              ? 'bg-indigo-500/10 border-indigo-500/30 text-cyan-400' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              What Opportunity Are You Looking For?
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Type your goal in plain English. NovaPath decomposes requirements, fetches verified listings, scores 5-factor fit, and maps skill gaps.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                id="career-goal-input"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., I want an AI/ML internship in Hyderabad, or Find opportunities for me..."
                className={`w-full rounded-2xl py-4 pl-4 pr-12 text-sm sm:text-base font-medium transition-all focus:outline-none focus:ring-2 border ${
                  isDark
                    ? 'bg-slate-950/90 border-slate-700/80 text-white placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 shadow-inner'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner'
                }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:block">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}>
                  ↵ Enter
                </span>
              </div>
            </div>

            <button
              id="plan-my-path-btn"
              type="submit"
              disabled={isLoading || !goal.trim()}
              className={`px-7 py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Agent Planning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Execute Agent Plan</span>
                  <ArrowRight className="h-4 w-4 ml-1 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts with Category Labels */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center flex-wrap gap-2 text-xs">
          <span className={`flex items-center font-bold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
            Quick Examples:
          </span>
          {sampleGoals.map((sample, idx) => (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setGoal(sample.text);
                onPlanPath(sample.text);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-700/70 hover:border-cyan-500/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

