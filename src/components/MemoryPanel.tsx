import React, { useState } from 'react';
import { Brain, Plus, Trash2, Tag, Sparkles, CheckCircle2, ShieldCheck, Clock, Layers } from 'lucide-react';
import { Memory, MemoryType, MemoryImportance } from '../types';

interface MemoryPanelProps {
  memories: Memory[];
  onAddMemory: (memory: { memory_type: MemoryType; memory_text: string; importance: MemoryImportance; category: string }) => void;
  onDeleteMemory: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  theme = 'dark'
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<MemoryType>('PREFERENCE');
  const [newImportance, setNewImportance] = useState<MemoryImportance>('HIGH');
  const [newCategory, setNewCategory] = useState('Career Goals');

  const isDark = theme === 'dark';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddMemory({
      memory_type: newType,
      memory_text: newText.trim(),
      importance: newImportance,
      category: newCategory,
    });
    setNewText('');
    setIsAdding(false);
  };

  const getImportanceBadge = (importance: MemoryImportance) => {
    switch (importance) {
      case 'HIGH':
        return (
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold border ${
            isDark 
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/50' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold border ${
            isDark 
              ? 'bg-amber-950/80 text-amber-300 border-amber-800/50' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            Medium
          </span>
        );
      default:
        return (
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold border ${
            isDark 
              ? 'bg-slate-800 text-slate-400 border-slate-700' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            Low
          </span>
        );
    }
  };

  const getTypeBadge = (type: MemoryType) => {
    switch (type) {
      case 'PROFILE':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-blue-950/80 text-blue-300 border-blue-800/60' 
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            Profile Anchor
          </span>
        );
      case 'PREFERENCE':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-purple-950/80 text-purple-300 border-purple-800/60' 
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            Active Preference
          </span>
        );
      case 'INTERACTION':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' 
              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
          }`}>
            Session Context
          </span>
        );
      default:
        return (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-slate-800 text-slate-300 border-slate-700' 
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            General
          </span>
        );
    }
  };

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
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
              : 'bg-purple-50 border-purple-200 text-purple-600'
          }`}>
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                Persistent Memory Bank
              </h3>
              <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-purple-950 text-purple-300 border-purple-800' 
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {memories.length} Active Memory Nodes
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Long-term preferences and session memory automatically recalled across future runs
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-md ${
            isDark
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
              : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Preference Memory</span>
        </button>
      </div>

      {/* Add Memory Modal/Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className={`mt-5 p-5 rounded-2xl border space-y-3.5 ${
          isDark ? 'bg-slate-950 border-purple-800/40' : 'bg-purple-50/50 border-purple-200'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-purple-300' : 'text-purple-900'
          }`}>
            Teach NovaPath a New Permanent Preference
          </h4>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g. I want to focus exclusively on Python and Machine Learning roles in Hyderabad with hybrid flexibility."
            rows={2}
            className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:ring-2 border font-medium ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:ring-purple-500' 
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-purple-500'
            }`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Memory Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as MemoryType)}
                className={`w-full rounded-xl p-2 text-xs border font-medium ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="PREFERENCE">Preference</option>
                <option value="PROFILE">Profile Anchor</option>
                <option value="INTERACTION">Session Context</option>
              </select>
            </div>
            <div>
              <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Importance
              </label>
              <select
                value={newImportance}
                onChange={(e) => setNewImportance(e.target.value as MemoryImportance)}
                className={`w-full rounded-xl p-2 text-xs border font-medium ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Category
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={`w-full rounded-xl p-2 text-xs border font-medium ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
                placeholder="Category"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border ${
                isDark ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Memory Cards Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {memories.map((m) => (
          <div
            key={m.id}
            id={`mem-card-${m.id}`}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center space-x-2">
                  {getTypeBadge(m.memory_type)}
                  {getImportanceBadge(m.importance)}
                </div>
                <button
                  onClick={() => onDeleteMemory(m.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-900' : 'text-slate-400 hover:text-rose-600 hover:bg-white'
                  }`}
                  title="Delete memory"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className={`text-xs leading-relaxed font-medium ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                "{m.memory_text}"
              </p>
            </div>

            <div className={`mt-3.5 pt-3 border-t flex items-center justify-between text-[10px] ${
              isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-500'
            }`}>
              <span className="flex items-center font-semibold">
                <Tag className="h-3 w-3 mr-1 text-purple-500" />
                {m.category || 'General'}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(m.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Memory System Guarantee Footer */}
      <div className={`mt-5 p-4 rounded-2xl border text-xs flex items-center space-x-2.5 ${
        isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>
          <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Stateful Guarantee:</strong> In Session 2, running <em>"Find opportunities for me"</em> automatically leverages these exact memory nodes without needing you to re-type preferences.
        </span>
      </div>
    </div>
  );
};

