import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Cpu,
  Clock,
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';
import { AgentStep, AgentRun } from '../types';

interface AgentExecutionPanelProps {
  run: AgentRun | null;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

export const AgentExecutionPanel: React.FC<AgentExecutionPanelProps> = ({ 
  run, 
  isLoading,
  theme = 'dark'
}) => {
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const isDark = theme === 'dark';

  const toggleDetails = (stepId: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const defaultSteps = [
    { number: 1, name: 'Understanding your goal & intent', description: 'Decompose user input into domain, location, role type, and criteria.' },
    { number: 2, name: 'Loading your verified student profile', description: 'Fetch academic record, year, degree branch, and verified skills.' },
    { number: 3, name: 'Retrieving long-term memory & preferences', description: 'Recall past sessions, location constraints, and historical interests.' },
    { number: 4, name: 'Formulating multi-criteria search plan', description: 'Synthesize profile constraints and goal parameters into query tokens.' },
    { number: 5, name: 'Searching external & curated opportunity sources', description: 'Execute live search tool across official portals & internship boards.' },
    { number: 6, name: 'Evaluating opportunity-to-profile fit (5-factor score)', description: 'Score skills (40%), eligibility (25%), location (15%), type (10%), year (10%).' },
    { number: 7, name: 'Identifying technical skill gaps & learning paths', description: 'Determine missing requirements and prioritize bridging roadmap.' },
    { number: 8, name: 'Ranking high-confidence opportunities', description: 'Sort and filter top candidates meeting high confidence thresholds.' },
    { number: 9, name: 'Synthesizing strategic execution recommendations', description: 'Compute preparation milestones, project focus, and submission roadmap.' },
    { number: 10, name: 'Persisting new preferences to long-term memory', description: 'Store newly expressed preferences into stateful memory bank.' },
  ];

  const steps = run?.steps || [];
  const isCompleted = run?.status === 'COMPLETED';
  const isFailed = run?.status === 'FAILED';

  return (
    <div className={`rounded-3xl p-6 sm:p-7 border transition-all ${
      isDark
        ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100'
        : 'bg-white border-slate-200/90 shadow-xl text-slate-900'
    }`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b gap-3 ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
            isDark 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                Autonomous Agent Execution Pipeline
              </h3>
              {isLoading && (
                <span className={`flex items-center space-x-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold border animate-pulse ${
                  isDark
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Executing 10-Step Pipeline</span>
                </span>
              )}
              {isCompleted && (
                <span className={`flex items-center space-x-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Execution Succeeded</span>
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Decomposed multi-step reasoning, stateful memory retrieval, live tool execution & 5-factor scoring
            </p>
          </div>
        </div>

        {run && (
          <div className="text-right hidden sm:block">
            <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              ID: {run.id.slice(0, 14)}
            </span>
          </div>
        )}
      </div>

      {/* Memory Context Notification Banner */}
      {run && run.retrieved_preferences && run.retrieved_preferences.length > 0 && (
        <div className={`mt-5 p-4 rounded-2xl border text-xs ${
          isDark
            ? 'bg-purple-950/30 border-purple-800/40 text-purple-200'
            : 'bg-purple-50/80 border-purple-200 text-purple-900'
        }`}>
          <div className="flex items-center space-x-2 font-bold mb-1.5">
            <Database className="h-4 w-4 text-purple-500" />
            <span>Retrieved Context from Persistent Memory:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {run.retrieved_preferences.map((pref, idx) => (
              <span 
                key={idx} 
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                  isDark
                    ? 'bg-purple-950/80 border-purple-700/60 text-purple-200'
                    : 'bg-purple-100 border-purple-300 text-purple-800'
                }`}
              >
                ✓ {pref}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="mt-5 space-y-2.5">
        {steps.length > 0 ? (
          steps.map((step) => {
            const isStepCompleted = step.status === 'COMPLETED';
            const isStepRunning = step.status === 'RUNNING';
            const isStepFailed = step.status === 'FAILED';
            const hasDetails = step.details && Object.keys(step.details).length > 0;
            const isExpanded = expandedDetails[step.id];

            return (
              <div 
                key={step.id}
                id={`agent-step-${step.step_number}`}
                className={`rounded-2xl border transition-all ${
                  isStepRunning
                    ? isDark
                      ? 'bg-cyan-950/30 border-cyan-500/50 p-4 ring-1 ring-cyan-500/20'
                      : 'bg-indigo-50/80 border-indigo-300 p-4 ring-1 ring-indigo-400/30'
                    : isStepCompleted
                    ? isDark
                      ? 'bg-slate-950/60 border-slate-800/80 p-3.5'
                      : 'bg-slate-50/90 border-slate-200/90 p-3.5'
                    : isDark
                      ? 'bg-slate-950/20 border-slate-900 p-3 opacity-50'
                      : 'bg-slate-50/40 border-slate-100 p-3 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-0.5">
                      {isStepCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {isStepRunning && (
                        <Loader2 className={`h-4 w-4 animate-spin ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                      )}
                      {isStepFailed && (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      )}
                      {step.status === 'PENDING' && (
                        <Circle className={`h-4 w-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[11px] font-mono font-bold ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          STEP {step.step_number}
                        </span>
                        <h4 className={`text-sm font-bold ${
                          isStepRunning 
                            ? isDark ? 'text-cyan-300' : 'text-indigo-700'
                            : isDark ? 'text-slate-100' : 'text-slate-800'
                        }`}>
                          {step.display_title || step.step_name}
                        </h4>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {step.result_summary}
                      </p>
                    </div>
                  </div>

                  {hasDetails && (
                    <button
                      onClick={() => toggleDetails(step.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                        isDark
                          ? 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
                          : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
                      }`}
                      title="Inspect Step Telemetry"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline text-[11px]">Inspect</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>

                {/* Inspectable JSON Payload */}
                {isExpanded && step.details && (
                  <div className={`mt-3.5 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`p-3 rounded-xl border text-[11px] font-mono overflow-x-auto max-h-48 ${
                      isDark
                        ? 'bg-black/80 border-slate-800 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-cyan-300'
                    }`}>
                      <pre>{JSON.stringify(step.details, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Default Pipeline Ready Cards */
          defaultSteps.map((s) => (
            <div 
              key={s.number} 
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                isDark 
                  ? 'bg-slate-950/30 border-slate-800/60 opacity-60 text-slate-300' 
                  : 'bg-slate-50/60 border-slate-200/60 opacity-60 text-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <Circle className={`h-4 w-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                <div>
                  <span className="text-xs font-semibold block">
                    <strong className={`mr-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Step {s.number}</strong>
                    {s.name}
                  </span>
                  <span className={`text-[11px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.description}</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'
              }`}>
                STANDBY
              </span>
            </div>
          ))
        )}
      </div>

      {run?.summary && (
        <div className={`mt-5 p-4 rounded-2xl border text-xs leading-relaxed ${
          isDark
            ? 'bg-blue-950/30 border-blue-800/40 text-blue-200'
            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}>
          <strong className="font-bold block mb-1">Execution Summary:</strong>
          {run.summary}
        </div>
      )}
    </div>
  );
};

