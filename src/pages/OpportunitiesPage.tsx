import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  ExternalLink, 
  Trash2, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Bookmark, 
  Banknote, 
  Sparkles, 
  Search, 
  Globe, 
  Filter, 
  Plus, 
  X, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  BookmarkCheck,
  Route
} from 'lucide-react';
import { Application, ApplicationStatus, UserProfile, Opportunity } from '../types';
import { api } from '../services/api';

interface EvaluatedSearchOpportunity extends Opportunity {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  fitReason: string;
  isSaved?: boolean;
}

interface OpportunitiesPageProps {
  applications: (Application & { opportunity?: any })[];
  user: UserProfile | null;
  onUpdateStatus: (id: string, opportunityId: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
  onToggleSave: (opp: any) => Promise<void>;
  onAddSkillToProfile?: (skill: string) => void;
  onNavigateToCareerPath?: (opp: any) => void;
  theme?: 'dark' | 'light';
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  applications,
  user,
  onUpdateStatus,
  onDeleteApplication,
  onToggleSave,
  onAddSkillToProfile,
  onNavigateToCareerPath,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'TRACKER'>('DISCOVER');

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(user?.location || 'All');
  const [selectedType, setSelectedType] = useState('ALL');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [activeSkills, setActiveSkills] = useState<string[]>(user?.skills || ['Python', 'SQL', 'Machine Learning']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  // Results & Loading State
  const [searchResults, setSearchResults] = useState<EvaluatedSearchOpportunity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterTrackerStatus, setFilterTrackerStatus] = useState<string>('ALL');

  // Saved Opportunities IDs set for instant reactivity
  const savedOppIds = new Set(applications.map(a => a.opportunity_id));

  // Sync user skills if loaded later
  useEffect(() => {
    if (user?.skills && user.skills.length > 0 && activeSkills.length === 0) {
      setActiveSkills(user.skills);
    }
  }, [user]);

  // Initial auto-search on mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (overrideSkills?: string[]) => {
    setIsSearching(true);
    try {
      const skillsToUse = overrideSkills || activeSkills;
      const response = await api.searchOpportunities({
        user_id: user?.id,
        skills: skillsToUse,
        query: query.trim() || undefined,
        location: selectedLocation === 'All' ? undefined : selectedLocation,
        type: selectedType === 'ALL' ? undefined : selectedType,
        remote: remoteOnly ? true : undefined,
      });

      setSearchResults(response.results as EvaluatedSearchOpportunity[]);
      setHasSearched(true);
    } catch (e) {
      console.error('Failed to search web opportunities:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSkill = (skill: string) => {
    let updated: string[];
    if (activeSkills.includes(skill)) {
      updated = activeSkills.filter(s => s !== skill);
    } else {
      updated = [...activeSkills, skill];
    }
    setActiveSkills(updated);
    handleSearch(updated);
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!activeSkills.includes(trimmed)) {
      const updated = [...activeSkills, trimmed];
      setActiveSkills(updated);
      setCustomSkillInput('');
      handleSearch(updated);
    } else {
      setCustomSkillInput('');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterTrackerStatus === 'ALL') return true;
    return app.status === filterTrackerStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
            isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            APPLIED
          </span>
        );
      case 'INTERVIEWING':
        return (
          <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
            isDark ? 'bg-purple-950/80 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            INTERVIEWING
          </span>
        );
      case 'OFFER':
        return (
          <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
            isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            OFFER EXTENDED
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
            isDark ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
            isDark ? 'bg-slate-800 text-cyan-300 border-slate-700' : 'bg-slate-100 text-indigo-700 border-slate-200'
          }`}>
            SAVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between pb-4 border-b gap-4 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
            isDark 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Opportunities & Job Discovery
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Web Grounded
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Search live internships and job openings across tech companies, verified against your skill profile.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className={`flex items-center p-1 rounded-2xl border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            id="view-tab-discover"
            onClick={() => setActiveTab('DISCOVER')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DISCOVER'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white text-indigo-600 border border-indigo-200 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Search Discovery</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {searchResults.length}
            </span>
          </button>

          <button
            id="view-tab-tracker"
            onClick={() => setActiveTab('TRACKER')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TRACKER'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white text-indigo-600 border border-indigo-200 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Tracker</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {applications.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: LIVE WEB SEARCH DISCOVERY                                      */}
      {/* ========================================================================= */}
      {activeTab === 'DISCOVER' && (
        <div className="space-y-6">
          {/* Search & Skill Filter Console */}
          <div className={`p-6 rounded-3xl border space-y-5 ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 shadow-xl' 
              : 'bg-white border-slate-200/90 shadow-lg'
          }`}>
            <div className="flex flex-col md:flex-row gap-3">
              {/* Query Input */}
              <div className="relative flex-1">
                <Search className={`absolute left-3.5 top-3 h-4 w-4 ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search role e.g. 'AI/ML Intern', 'React Frontend Developer', 'Cloud Engineer'..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold border outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className={`px-3 py-2.5 rounded-2xl text-xs font-semibold border outline-none cursor-pointer ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-slate-200' 
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">All Types</option>
                <option value="Internship">Internships Only</option>
                <option value="Full-time">Full-Time Jobs</option>
                <option value="Research">Research Fellowships</option>
              </select>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className={`px-3 py-2.5 rounded-2xl text-xs font-semibold border outline-none cursor-pointer ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-slate-200' 
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="All">All Locations</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Remote">Remote</option>
              </select>

              {/* Remote Toggle */}
              <button
                type="button"
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  remoteOnly
                    ? isDark 
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm' 
                      : 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm'
                    : isDark 
                      ? 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200' 
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Remote / Hybrid</span>
                {remoteOnly && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              {/* Search Button */}
              <button
                type="button"
                id="execute-web-search-btn"
                onClick={() => handleSearch()}
                disabled={isSearching}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md ${
                  isDark
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-950/50'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                } ${isSearching ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Web...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Openings</span>
                  </>
                )}
              </button>
            </div>

            {/* Skill Match Query Tags */}
            <div className="pt-2 border-t border-slate-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Active Skills for Web Grounding:
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    (Click to toggle skills or add new ones to match specific roles)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Available / Active Skill Chips */}
                {activeSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    <span>{skill}</span>
                    <X className="w-3 h-3 text-cyan-400 hover:text-rose-400" />
                  </button>
                ))}

                {/* Additional quick suggestions from profile */}
                {user?.skills?.filter(s => !activeSkills.includes(s)).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.2 rounded-xl text-xs font-semibold border transition-all cursor-pointer border-dashed ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{skill}</span>
                  </button>
                ))}

                {/* Custom Skill Input Form */}
                <form onSubmit={handleAddCustomSkill} className="inline-flex items-center">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={e => setCustomSkillInput(e.target.value)}
                    placeholder="+ Add Skill (e.g. Docker, React, PyTorch)"
                    className={`px-3 py-1.2 rounded-xl text-xs font-medium border outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                    }`}
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Search Results Display */}
          {isSearching ? (
            <div className={`p-16 rounded-3xl border text-center space-y-4 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Grounding Web Search with Your Skills...
              </h3>
              <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Querying active 2026 tech internships and job openings matching <span className="font-semibold text-cyan-400">{activeSkills.slice(0, 4).join(', ')}</span>.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Showing <span className="text-cyan-400 font-extrabold">{searchResults.length}</span> live matching opportunities
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Sorted by Skill Match %
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((opp) => {
                  const isSaved = savedOppIds.has(opp.id) || opp.isSaved;

                  return (
                    <div
                      key={opp.id}
                      className={`rounded-3xl p-6 border transition-all flex flex-col justify-between group ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl text-slate-100'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-lg text-slate-900'
                      }`}
                    >
                      <div>
                        {/* Header Badge Row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              opp.type === 'Internship'
                                ? isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'
                                : opp.type === 'Full-time'
                                  ? isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isDark ? 'bg-purple-950/80 text-purple-300 border-purple-800/50' : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {opp.type}
                            </span>
                            {opp.remote && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isDark ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              }`}>
                                Remote / Hybrid
                              </span>
                            )}
                          </div>

                          {/* Match Score */}
                          <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border ${
                            opp.matchScore >= 85
                              ? isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isDark ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>{opp.matchScore}% Match</span>
                          </div>
                        </div>

                        {/* Title & Organization */}
                        <h3 className="text-base font-extrabold tracking-tight group-hover:text-cyan-400 transition-colors">
                          {opp.title}
                        </h3>

                        <div className="mt-2 space-y-1.5 text-xs">
                          <div className={`flex items-center font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Building2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                            {opp.organization}
                          </div>
                          <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            {opp.location}
                          </div>
                          {opp.deadline && (
                            <div className="flex items-center text-amber-500 font-medium">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              Deadline: {opp.deadline}
                            </div>
                          )}
                          {opp.stipend_or_salary && (
                            <div className="flex items-center text-emerald-500 font-bold">
                              <Banknote className="h-3.5 w-3.5 mr-1.5" />
                              {opp.stipend_or_salary}
                            </div>
                          )}
                        </div>

                        {/* Fit Reason */}
                        <p className={`mt-3 text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {opp.fitReason || opp.description}
                        </p>

                        {/* Required Skills & Gap Alignment */}
                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {/* Matching Skills */}
                            {opp.matchingSkills?.map((skill: string, idx: number) => (
                              <span 
                                key={`match-${idx}`} 
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center space-x-1 ${
                                  isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                <span>{skill}</span>
                              </span>
                            ))}

                            {/* Missing / Gap Skills */}
                            {opp.missingSkills?.slice(0, 3).map((skill: string, idx: number) => (
                              <span 
                                key={`miss-${idx}`} 
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center space-x-1 ${
                                  isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                                title="Skill not in current profile"
                              >
                                <span>+ {skill}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className={`mt-5 pt-3.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                        isDark ? 'border-slate-800' : 'border-slate-100'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {/* Build Career Path Button */}
                          {onNavigateToCareerPath && (
                            <button
                              type="button"
                              onClick={() => onNavigateToCareerPath(opp)}
                              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                                isDark
                                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/90 hover:border-cyan-500'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              }`}
                              title="Generate a step-by-step personalized career roadmap for this opening"
                            >
                              <Route className="w-3.5 h-3.5" />
                              <span>Career Path</span>
                            </button>
                          )}

                          {/* Bookmark / Save Button */}
                          <button
                            type="button"
                            onClick={() => onToggleSave(opp)}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                              isSaved
                                ? isDark 
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isDark
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Save to Tracker</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Apply Portal Link */}
                        {opp.url ? (
                          <a
                            href={opp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition-all ${
                              isDark 
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            }`}
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ) : (
                          <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {opp.source}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty Search State */
            <div className={`p-12 rounded-3xl border text-center space-y-3 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <Globe className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No opportunities found matching your specific filters
              </h3>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Try adjusting your search query, selecting "All Locations", or toggling more skills to broaden the web search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedLocation('All');
                  setSelectedType('ALL');
                  setRemoteOnly(false);
                  setActiveSkills(user?.skills || ['Python', 'SQL', 'Machine Learning']);
                  handleSearch(user?.skills || ['Python', 'SQL', 'Machine Learning']);
                }}
                className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700' : 'bg-white text-indigo-600 border border-slate-200 shadow-sm'
                }`}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SAVED OPPORTUNITIES & APPLICATION TRACKER                      */}
      {/* ========================================================================= */}
      {activeTab === 'TRACKER' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER'].map(status => (
              <button
                key={status}
                onClick={() => setFilterTrackerStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  filterTrackerStatus === status
                    ? isDark
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-sm'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isDark
                      ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {status} {status === 'ALL' && `(${applications.length})`}
              </button>
            ))}
          </div>

          {/* Grid of Applications */}
          {filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApplications.map(app => {
                const opp = app.opportunity;
                if (!opp) return null;

                return (
                  <div
                    key={app.id}
                    className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 shadow-xl text-slate-100'
                        : 'bg-white border-slate-200/90 shadow-lg text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {opp.type}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>

                      <h3 className="text-base font-extrabold tracking-tight">
                        {opp.title}
                      </h3>

                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div className={`flex items-center font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <Building2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                          {opp.organization}
                        </div>
                        <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {opp.location} {opp.remote && '(Remote / Hybrid)'}
                        </div>
                        {opp.deadline && (
                          <div className="flex items-center text-amber-500 font-medium">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            Deadline: {opp.deadline}
                          </div>
                        )}
                        {opp.stipend_or_salary && (
                          <div className="flex items-center text-emerald-500 font-bold">
                            <Banknote className="h-3.5 w-3.5 mr-1.5" />
                            {opp.stipend_or_salary}
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {opp.skills?.slice(0, 4).map((skill: string, idx: number) => (
                          <span 
                            key={idx} 
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                              isDark ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Status Dropdown */}
                      <div className={`mt-4 pt-3.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <label className={`text-[11px] font-bold block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Update Pipeline Stage:
                        </label>
                        <select
                          value={app.status}
                          onChange={e => onUpdateStatus(app.id, opp.id, e.target.value as ApplicationStatus)}
                          className={`w-full rounded-xl p-2 text-xs font-semibold border outline-none ${
                            isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="SAVED">Saved / Exploring</option>
                          <option value="APPLIED">Applied / Submitted</option>
                          <option value="INTERVIEWING">Interviewing Stage</option>
                          <option value="OFFER">Offer Extended</option>
                          <option value="REJECTED">Archived / Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {onNavigateToCareerPath && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCareerPath(opp)}
                            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                              isDark
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/90'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            }`}
                            title="Generate a personalized career roadmap for this tracked role"
                          >
                            <Route className="h-3 w-3" />
                            <span>Roadmap</span>
                          </button>
                        )}

                        {opp.url ? (
                          <a
                            href={opp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-bold flex items-center space-x-1 hover:underline ${
                              isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-indigo-600 hover:text-indigo-700'
                            }`}
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Source: {opp.source}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-850' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title="Remove from tracker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-16 rounded-3xl border p-8 ${
              isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Bookmark className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No opportunities in this category yet
              </h3>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                Explore live opportunities in the Web Search Discovery tab or on your Agent Hub to bookmark matches.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('DISCOVER')}
                className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                Discover Live Opportunities
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
