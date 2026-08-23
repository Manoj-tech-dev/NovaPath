import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Target, 
  Flame, 
  Brain, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Compass, 
  Zap,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  ArrowRight,
  Bot,
  MessageSquare,
  FileCheck,
  Route
} from 'lucide-react';
import { UserProfile, EvaluatedOpportunity, SkillGapItem, AgentRun, Memory } from '../types';
import { GoalInput } from '../components/GoalInput';
import { AgentExecutionPanel } from '../components/AgentExecutionPanel';
import { OpportunityCard } from '../components/OpportunityCard';
import { SkillGapCard } from '../components/SkillGapCard';
import { DailyTechTrendsSection } from '../components/DailyTechTrendsSection';

interface DashboardProps {
  user: UserProfile | null;
  activeRun: AgentRun | null;
  isLoading: boolean;
  onPlanPath: (goal: string) => void;
  savedOpportunityIds: Set<string>;
  onToggleSave: (opp: EvaluatedOpportunity) => void;
  onBuildCareerPath?: (opp: EvaluatedOpportunity) => void;
  memories: Memory[];
  onNavigateTab: (tab: 'profile' | 'opportunities' | 'chat' | 'memory' | 'ats' | 'career-path') => void;
  onAddSkillToProfile?: (skill: string) => void;
  theme?: 'dark' | 'light';
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  activeRun,
  isLoading,
  onPlanPath,
  savedOpportunityIds,
  onToggleSave,
  onBuildCareerPath,
  memories,
  onNavigateTab,
  onAddSkillToProfile,
  theme = 'dark'
}) => {
  const opportunities = activeRun?.opportunities || [];
  const skillGaps = activeRun?.skill_gaps || [];
  const isDark = theme === 'dark';

  // Opportunity Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | string>('ALL');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'deadline'>('match');

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.matchedSkills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || opp.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesRemote = !remoteOnly || opp.remote;

      return matchesSearch && matchesType && matchesRemote;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      }
      return (a.deadline || '').localeCompare(b.deadline || '');
    });
  }, [opportunities, searchQuery, typeFilter, remoteOnly, sortBy]);

  return (
    <div className="space-y-8">
      {/* Welcome & Goal Banner */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b ${
        isDark ? 'border-slate-900' : 'border-slate-200'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className={`text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Enter any career aspiration. NovaPath decomposes your goal into verifiable subtasks, computes transparent fit rankings, diagnoses skill gaps, and synthesizes an actionable execution timeline.
          </p>
        </div>

        {/* Quick Profile Summary Badge */}
        {user && (
          <div 
            id="quick-profile-badge"
            onClick={() => onNavigateTab('profile')}
            className={`border rounded-2xl p-4 text-xs flex items-center space-x-3.5 cursor-pointer transition-all self-start md:self-auto shrink-0 ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200 shadow-lg' 
                : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-md'
            }`}
          >
            <div className={`p-2.5 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold block">{user.degree} (Yr {user.year}) • {user.branch}</span>
              <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {user.location} • {user.skills.length} skills • Remote {user.remote_preference ? 'Yes' : 'No'}
              </span>
            </div>
            <ChevronRight className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
        )}
      </div>

      {/* Goal Input Section */}
      <GoalInput 
        onPlanPath={onPlanPath}
        isLoading={isLoading}
        activeGoal={activeRun?.goal || ''}
        theme={theme}
      />

      {/* Agent Execution Stepper Panel */}
      <AgentExecutionPanel 
        run={activeRun}
        isLoading={isLoading}
        theme={theme}
      />

      {/* Results Section (Appears after or during run) */}
      {opportunities.length > 0 ? (
        <div className="space-y-8">
          {/* Top Matches Header & Search / Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
                  isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}>
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Ranked Match Opportunities
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Computed via transparent 5-factor scoring model (Skill Overlap 40%, Eligibility 25%, Location 15%, Type 10%, Year 10%)
                  </p>
                </div>
              </div>

              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                Showing {filteredOpportunities.length} of {opportunities.length} Matches
              </span>
            </div>

            {/* Search & Filter Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-3 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className={`absolute left-3.5 top-3 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by role, company, location, or skill..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border font-medium focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {['ALL', 'Internship', 'Fellowship', 'Research', 'Hackathon'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      typeFilter === t
                        ? isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : isDark ? 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {t === 'ALL' ? 'All Types' : t}
                  </button>
                ))}
              </div>

              {/* Remote Toggle & Sort */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                    remoteOnly
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>Remote Only</span>
                </button>

                <button
                  onClick={() => setSortBy(sortBy === 'match' ? 'deadline' : 'match')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isDark ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                  title="Toggle Sorting"
                >
                  <ArrowUpDown className="h-3 w-3 text-cyan-500" />
                  <span>{sortBy === 'match' ? 'Sort: Best Fit' : 'Sort: Deadline'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Opportunities Cards Grid */}
          {filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpportunities.map((opp, idx) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  isSaved={savedOpportunityIds.has(opp.id)}
                  onToggleSave={onToggleSave}
                  onBuildCareerPath={onBuildCareerPath}
                  rank={idx + 1}
                  theme={theme}
                />
              ))}
            </div>
          ) : (
            <div className={`p-8 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50 text-cyan-500" />
              <p className="font-bold text-sm">No opportunities match current search or filters</p>
              <button 
                onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setRemoteOnly(false); }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Skill Gap Analysis Section */}
          <SkillGapCard 
            skillGaps={skillGaps}
            user={user}
            onAddSkillToProfile={onAddSkillToProfile}
            theme={theme}
          />
        </div>
      ) : (
        /* Empty State / Starter Suggestions */
        <div className="space-y-4">
          <div className={`p-8 sm:p-10 rounded-3xl border text-center space-y-4 ${
            isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200/90 shadow-lg text-slate-700'
          }`}>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Compass className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Ready to Discover Tailored Opportunities?
              </h3>
              <p className="text-xs mt-1 text-slate-400 leading-relaxed">
                Type your career goal above or click one of our quick prompt chips to see the 10-step agent pipeline synthesize matches and skill gap bridges in real time.
              </p>
            </div>
          </div>

          {/* Personalized Career Path Spotlight Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 ${
            isDark 
              ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border-emerald-850/50 shadow-md' 
              : 'bg-gradient-to-r from-emerald-50 via-white to-cyan-50 border-emerald-100 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-bold' : 'bg-emerald-600 text-white'
              }`}>
                <Route className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Build a Step-by-Step Personalized Career Path
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    New Feature
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Deconstruct your target role into milestone phases, real-time readiness scores, and curated learning projects.
                </p>
              </div>
            </div>

            <button
              id="open-career-path-dashboard-btn"
              onClick={() => onNavigateTab('career-path')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shrink-0 transition-all ${
                isDark 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Explore Career Paths</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Agent Nova AI Assistant Spotlight */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/30 border-indigo-900/50 shadow-md' 
              : 'bg-gradient-to-r from-indigo-50 via-white to-cyan-50 border-indigo-100 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white' : 'bg-indigo-600 text-white'
              }`}>
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Need Career Direction or Interview Advice?
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Agent Nova
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Ask questions about resume project ideas, technical interview blueprints, or how to break into AI/ML.
                </p>
              </div>
            </div>

            <button
              id="ask-agent-nova-dashboard-btn"
              onClick={() => onNavigateTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shrink-0 transition-all ${
                isDark 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Agent Nova</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ATS Resume Scanner Quick Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 ${
            isDark 
              ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/30 border-cyan-900/50 shadow-md' 
              : 'bg-gradient-to-r from-cyan-50 via-white to-indigo-50 border-cyan-100 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white' : 'bg-cyan-600 text-white'
              }`}>
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Test Your Resume for ATS Screening
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    ATS Scanner
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Get a 100-point ATS readiness score, keyword density audit, and active bullet rewrites before submitting applications.
                </p>
              </div>
            </div>

            <button
              id="open-ats-scanner-dashboard-btn"
              onClick={() => onNavigateTab('ats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shrink-0 transition-all ${
                isDark 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950' 
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Scan Resume Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Daily Tech & AI Internship Trends (Google Search Grounded) */}
      <DailyTechTrendsSection
        userId={user?.id}
        userSkills={user?.skills}
        onNavigateTab={onNavigateTab}
        onAddSkillToProfile={onAddSkillToProfile}
        theme={theme}
      />
    </div>
  );
};

