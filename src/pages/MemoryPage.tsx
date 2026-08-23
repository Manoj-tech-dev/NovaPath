import React from 'react';
import { Brain, Sparkles, ShieldCheck, History, Terminal } from 'lucide-react';
import { Memory, MemoryType, MemoryImportance, AgentRun } from '../types';
import { MemoryPanel } from '../components/MemoryPanel';

interface MemoryPageProps {
  memories: Memory[];
  onAddMemory: (memory: { memory_type: MemoryType; memory_text: string; importance: MemoryImportance; category: string }) => void;
  onDeleteMemory: (id: string) => void;
  agentRuns: AgentRun[];
  theme?: 'dark' | 'light';
}

export const MemoryPage: React.FC<MemoryPageProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  agentRuns,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Memory Manager Component */}
      <MemoryPanel
        memories={memories}
        onAddMemory={onAddMemory}
        onDeleteMemory={onDeleteMemory}
        theme={theme}
      />

      {/* Historical Goal Executions (Memory Logs) */}
      <div className={`rounded-3xl p-6 sm:p-7 border space-y-5 transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100' : 'bg-white border-slate-200/90 shadow-xl text-slate-900'
      }`}>
        <div className={`flex items-center space-x-3.5 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
            isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Session Execution Logs & Audit Trail
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Audit log of all decomposed subtasks, executed goals, and memory writes in this session.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {agentRuns.length > 0 ? (
            agentRuns.map((run) => (
              <div 
                key={run.id}
                className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Terminal className={`h-3.5 w-3.5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                    <span className={`font-mono font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      "{run.goal}"
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border self-start sm:self-auto ${
                    isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {run.status}
                  </span>
                </div>

                {run.summary && (
                  <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {run.summary}
                  </p>
                )}

                <div className={`flex items-center justify-between text-[11px] font-mono pt-2 border-t ${
                  isDark ? 'border-slate-850 text-slate-500' : 'border-slate-200 text-slate-400'
                }`}>
                  <span>Run ID: {run.id}</span>
                  <span>{new Date(run.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-8 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No historical runs logged yet in this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

