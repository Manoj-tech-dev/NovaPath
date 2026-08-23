import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  Briefcase, 
  Flame, 
  Cpu, 
  Cloud, 
  Code2, 
  Layers,
  Lightbulb,
  Zap,
  Clock
} from 'lucide-react';
import { DailyTechTrend, DailyTrendsResponse } from '../types';
import { api } from '../services/api';

interface DailyTechTrendsSectionProps {
  userId?: string;
  userSkills?: string[];
  onNavigateTab: (tab: 'profile' | 'opportunities' | 'chat' | 'memory') => void;
  onAddSkillToProfile?: (skill: string) => void;
  theme?: 'dark' | 'light';
}

export const DailyTechTrendsSection: React.FC<DailyTechTrendsSectionProps> = ({
  userId = 'usr_rahul_001',
  userSkills = [],
  onNavigateTab,
  onAddSkillToProfile,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [trendsData, setTrendsData] = useState<DailyTrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDailyTrends(userId);
      setTrendsData(data);
    } catch (e) {
      console.error('Failed to load daily trends:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [userId]);

  const handleAddSkill = (skill: string) => {
    if (onAddSkillToProfile) {
      onAddSkillToProfile(skill);
      setAddedSkills(prev => new Set(prev).add(skill));
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Signals' },
    { id: 'AI & Machine Learning', label: 'AI & ML' },
    { id: 'Hiring & Internships', label: 'Internships & Hiring' },
    { id: 'Cloud & DevOps', label: 'Cloud & DevOps' },
    { id: 'Software Engineering', label: 'Software Eng' },
    { id: 'Open Source', label: 'Open Source & Evals' },
  ];

  const filteredTrends = (trendsData?.trends || []).filter(trend => {
    if (selectedCategory === 'ALL') return true;
    return trend.category.toLowerCase().includes(selectedCategory.toLowerCase()) || 
           selectedCategory.toLowerCase().includes(trend.category.toLowerCase());
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI & Machine Learning':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Cloud & DevOps':
        return <Cloud className="w-3.5 h-3.5 text-blue-400" />;
      case 'Software Engineering':
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'Hiring & Internships':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <section id="daily-tech-trends-section" className="space-y-4">
      {/* Header Bar */}
      <div className={`p-5 rounded-3xl border ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800 shadow-xl' 
          : 'bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/60 border-slate-200/90 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isDark 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-indigo-600 text-white border-indigo-600'
            }`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Daily Tech & AI Internship Trends
                </h2>
                <span className={`inline-flex items-center space-x-1 text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                }`}>
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>Google Search Grounded</span>
                </span>
                <span className={`inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <Clock className="w-2.5 h-2.5" />
                  <span>Summer 2026 Hiring Cycle</span>
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {trendsData?.marketSummary || "Real-time industry signals, rising technical stacks, and early-talent internship hiring waves grounded with Google Search."}
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-daily-trends-btn"
            onClick={loadTrends}
            disabled={isLoading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer border ${
              isDark 
                ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            title="Fetch latest daily trends"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{isLoading ? 'Searching...' : 'Refresh Trends'}</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/40 flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                selectedCategory === cat.id
                  ? isDark 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm' 
                    : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : isDark 
                    ? 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white' 
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              {cat.id === 'ALL' && trendsData?.trends && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-indigo-700 text-white'
                }`}>
                  {trendsData.trends.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trends Grid */}
      {isLoading && !trendsData ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <RefreshCw className="h-7 w-7 text-cyan-400 animate-spin mx-auto" />
          <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Grounding daily tech & AI internship trends via Google Search...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrends.map((trend) => {
            return (
              <div
                key={trend.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between group ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl text-slate-100' 
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-md text-slate-900'
                }`}
              >
                <div>
                  {/* Category & Growth Badge Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                        isDark ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {getCategoryIcon(trend.category)}
                        <span>{trend.category}</span>
                      </span>
                    </div>

                    {trend.growthSignal && (
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                        isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>{trend.growthSignal}</span>
                      </span>
                    )}
                  </div>

                  {/* Trend Title */}
                  <h3 className="text-base font-extrabold tracking-tight group-hover:text-cyan-400 transition-colors leading-snug">
                    {trend.title}
                  </h3>

                  {/* Summary */}
                  <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {trend.summary}
                  </p>

                  {/* Student Takeaway Box */}
                  <div className={`mt-3.5 p-3 rounded-2xl border text-xs ${
                    isDark 
                      ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200' 
                      : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-900'
                  }`}>
                    <div className="flex items-center space-x-1.5 font-bold mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Student Strategy Takeaway:</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {trend.studentTakeaway}
                    </p>
                  </div>

                  {/* Actionable Project Idea */}
                  {trend.actionableProjectIdea && (
                    <div className={`mt-2.5 p-3 rounded-2xl border text-xs ${
                      isDark 
                        ? 'bg-slate-950/70 border-slate-800 text-slate-300' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center space-x-1.5 font-bold mb-1">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Resume Project Blueprint:</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {trend.actionableProjectIdea}
                      </p>
                    </div>
                  )}

                  {/* Key Trending Skills Chips */}
                  <div className="mt-3.5 space-y-1.5">
                    <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      In-Demand Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trend.keySkills?.map((skill, sIdx) => {
                        const isAlreadyInProfile = userSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                        const isJustAdded = addedSkills.has(skill);

                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => !isAlreadyInProfile && handleAddSkill(skill)}
                            disabled={isAlreadyInProfile || isJustAdded}
                            className={`text-[10px] font-semibold px-2 py-0.8 rounded-lg border flex items-center space-x-1 transition-all ${
                              isAlreadyInProfile || isJustAdded
                                ? isDark 
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isDark
                                  ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500 hover:text-cyan-300 cursor-pointer'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer'
                            }`}
                            title={isAlreadyInProfile || isJustAdded ? 'Skill in your profile' : `Add ${skill} to your skill profile`}
                          >
                            {isAlreadyInProfile || isJustAdded ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Plus className="w-2.5 h-2.5 text-slate-400 group-hover:text-cyan-400" />
                            )}
                            <span>{skill}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={`mt-5 pt-3.5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  {/* Chat With Nova Action */}
                  <button
                    type="button"
                    onClick={() => onNavigateTab('chat')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-indigo-600/80 hover:bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Ask Nova About This</span>
                  </button>

                  {/* Grounded Source Link */}
                  {trend.sources && trend.sources.length > 0 ? (
                    <a
                      href={trend.sources[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold flex items-center justify-center space-x-1 hover:underline text-[11px] ${
                        isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">{trend.sources[0].title || 'Official Source'}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className={`text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Verified 2026 Trend
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
