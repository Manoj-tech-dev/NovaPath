import React from 'react';
import { 
  X, 
  Sparkles, 
  Compass, 
  Target, 
  Brain, 
  CheckSquare, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
  onTryExampleGoal?: (goal: string) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  onTryExampleGoal
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const steps = [
    {
      icon: Compass,
      title: '1. Enter Any Career Goal',
      description: 'Type any natural language objective (e.g., "I want an AI/ML internship in Hyderabad" or "Find remote data science fellowships"). NovaPath extracts your intent, domain, location, and constraints.',
      tag: 'Natural Language'
    },
    {
      icon: Cpu,
      title: '2. Autonomous 10-Step Decomposition',
      description: 'The agent decomposes your request into verified subtasks: loading academic profile data, recalling past memories, executing tool searches across live portals, and computing match rankings.',
      tag: 'Reasoning Engine'
    },
    {
      icon: ShieldCheck,
      title: '3. Transparent 5-Factor Fit Scoring',
      description: 'Matches are scored deterministically out of 100 points: Skill Overlap (40%), Academic Eligibility (25%), Location Fit (15%), Opportunity Type (10%), and Experience Year (10%).',
      tag: 'Deterministic AI'
    },
    {
      icon: Brain,
      title: '4. Persistent Cross-Session Memory',
      description: 'Preferences learned in Session 1 are permanently anchored. In Session 2, saying "Find opportunities for me" automatically recalls your desired city, skills, and work format without repeating yourself.',
      tag: 'Stateful Memory'
    },
    {
      icon: CheckSquare,
      title: '5. Actionable Roadmap & Application Tracker',
      description: 'Receive an actionable 4-stage execution timeline (Today, Next 3 Days, This Week, Next 2 Weeks) and track your applications from Saved to Interviewing and Offer.',
      tag: 'Execution Pipeline'
    }
  ];

  const examples = [
    {
      title: 'AI/ML Internship in Hyderabad',
      text: 'I want an AI/ML internship in Hyderabad.',
      desc: 'Discovers verified ML roles in Hyderabad matching your PyTorch/TensorFlow profile.'
    },
    {
      title: 'Memory Recall: "Find for me"',
      text: 'Find opportunities for me.',
      desc: 'Recalls saved preferences from memory without requiring any parameters.'
    },
    {
      title: 'Remote Data Science & Research',
      text: 'I want a remote Python & Data Science internship.',
      desc: 'Filters for remote/hybrid roles with data science stack requirements.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-3xl rounded-3xl p-6 sm:p-8 border shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                How NovaPath Works
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                User guide & verification manual for the AI Opportunity Execution Agent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 5-Step Process */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-500 flex items-center space-x-1.5">
            <Lightbulb className="h-4 w-4" />
            <span>The 5-Step Agent Flow</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark 
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-white border-slate-200 text-indigo-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-bold tracking-tight">{step.title}</h4>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isDark ? 'bg-slate-900 text-cyan-300 border-slate-800' : 'bg-white text-indigo-700 border-slate-200'
                        }`}>
                          {step.tag}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Test Prompt Examples */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 mb-3">
            Try a Guided Example Prompt
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {examples.map((ex, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (onTryExampleGoal) onTryExampleGoal(ex.text);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:border-cyan-500/50 text-slate-200'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block mb-1">{ex.title}</span>
                  <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {ex.desc}
                  </p>
                </div>
                <div className={`mt-3 pt-2 border-t text-[11px] font-bold flex items-center space-x-1 ${
                  isDark ? 'border-slate-900 text-cyan-400' : 'border-slate-200 text-indigo-600'
                }`}>
                  <span>Execute Goal</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md text-white ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Got it, Let's Get Started!
          </button>
        </div>
      </div>
    </div>
  );
};
