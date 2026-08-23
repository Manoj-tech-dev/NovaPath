import React, { useState } from 'react';
import { Target, Clock, Code, ArrowUpRight, CheckCircle2, AlertTriangle, Sparkles, Plus, ExternalLink, BookOpen } from 'lucide-react';
import { SkillGapItem, UserProfile } from '../types';

interface SkillGapCardProps {
  skillGaps: SkillGapItem[];
  user: UserProfile | null;
  onAddSkillToProfile?: (skill: string) => void;
  theme?: 'dark' | 'light';
}

export const SkillGapCard: React.FC<SkillGapCardProps> = ({ 
  skillGaps, 
  user,
  onAddSkillToProfile,
  theme = 'dark'
}) => {
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'CRITICAL' | 'RECOMMENDED'>('ALL');
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const isDark = theme === 'dark';

  const handleQuickAdd = (skill: string) => {
    setAddedSkills(prev => new Set(prev).add(skill));
    if (onAddSkillToProfile) {
      onAddSkillToProfile(skill);
    }
  };

  const filteredGaps = skillGaps.filter(gap => {
    if (filterPriority === 'ALL') return true;
    return gap.priority === filterPriority;
  });

  const getPriorityBadge = (priority: SkillGapItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className={`text-[10px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            High Priority Gap
          </span>
        );
      case 'RECOMMENDED':
        return (
          <span className={`text-[10px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            Recommended
          </span>
        );
      default:
        return (
          <span className={`text-[10px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-blue-950/80 text-blue-300 border-blue-800/60' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            Elective Skill
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
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
              Skill-Gap & Upskilling Roadmap
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Targeted skill bridges diagnosed from the requirements of your top match opportunities
            </p>
          </div>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          {(['ALL', 'CRITICAL', 'RECOMMENDED'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterPriority === p
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                  : isDark
                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              {p === 'ALL' ? `All (${skillGaps.length})` : p === 'CRITICAL' ? 'High Priority' : 'Recommended'}
            </button>
          ))}
        </div>
      </div>

      {/* User's Verified Skill Baseline */}
      {user && (
        <div className={`mt-5 p-4 rounded-2xl border ${
          isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Your Verified Skill Inventory ({user.skills.length} skills):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.map((skill, idx) => (
              <span 
                key={idx}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  isDark 
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Gaps List */}
      <div className="mt-5 space-y-3.5">
        {filteredGaps.length > 0 ? (
          filteredGaps.map((gap, idx) => {
            const isAlreadyAdded = user?.skills.includes(gap.skill) || addedSkills.has(gap.skill);
            return (
              <div 
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700' 
                    : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-sm font-extrabold tracking-tight">
                        △ {gap.skill}
                      </span>
                      {getPriorityBadge(gap.priority)}
                      {isAlreadyAdded && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Added to Profile
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1.5 leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {gap.suggestedAction}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                      isDark
                        ? 'text-amber-300 bg-amber-950/60 border-amber-800/60'
                        : 'text-amber-800 bg-amber-50 border-amber-200'
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {gap.estimatedTimeToLearn}
                    </span>

                    {onAddSkillToProfile && !isAlreadyAdded && (
                      <button
                        onClick={() => handleQuickAdd(gap.skill)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1 transition-all cursor-pointer ${
                          isDark
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="Mark skill as acquired and add to your profile"
                      >
                        <Plus className="h-3 w-3" />
                        <span>I Know This</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sample Mini Project */}
                <div className={`mt-3.5 pt-3 border-t flex items-start space-x-2 text-xs ${
                  isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}>
                  <Code className="h-3.5 w-3.5 text-cyan-500 mt-0.5 shrink-0" />
                  <span>
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Suggested Hands-On Project:</strong> {gap.sampleMiniProject}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`text-center py-8 rounded-2xl border text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold">No critical skill gaps found for this category!</p>
            <p className="mt-1">Your profile satisfies key technical competencies for these roles.</p>
          </div>
        )}
      </div>

      <div className={`mt-5 p-3.5 rounded-2xl border text-[11px] flex items-center justify-between ${
        isDark ? 'bg-slate-950/40 border-slate-800/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <span>💡 Tip: Click "I Know This" to instantly add learned skills to your profile and boost match scores.</span>
        <span className={`font-semibold flex items-center shrink-0 ml-2 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
          <Sparkles className="h-3 w-3 mr-1" />
          Bridge Active
        </span>
      </div>
    </div>
  );
};

