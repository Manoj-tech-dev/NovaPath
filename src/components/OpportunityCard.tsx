import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Check, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Percent, 
  Banknote,
  Sparkles,
  ShieldCheck,
  Copy,
  CheckCheck,
  Route
} from 'lucide-react';
import { EvaluatedOpportunity } from '../types';

interface OpportunityCardProps {
  opportunity: EvaluatedOpportunity;
  isSaved: boolean;
  onToggleSave: (opp: EvaluatedOpportunity) => void;
  onBuildCareerPath?: (opp: EvaluatedOpportunity) => void;
  rank?: number;
  theme?: 'dark' | 'light';
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isSaved,
  onToggleSave,
  onBuildCareerPath,
  rank,
  theme = 'dark'
}) => {
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${opportunity.title} at ${opportunity.organization}\nLocation: ${opportunity.location}\nMatch: ${opportunity.matchScore}%\nLink: ${opportunity.url || 'Internal Portal'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) {
      return isDark 
        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-700/80' 
        : 'text-emerald-800 bg-emerald-50 border-emerald-300';
    }
    if (score >= 70) {
      return isDark 
        ? 'text-cyan-300 bg-cyan-950/80 border-cyan-700/80' 
        : 'text-indigo-800 bg-indigo-50 border-indigo-300';
    }
    return isDark 
      ? 'text-amber-300 bg-amber-950/80 border-amber-700/80' 
      : 'text-amber-800 bg-amber-50 border-amber-300';
  };

  const getSourceBadge = () => {
    switch (opportunity.source_type) {
      case 'LIVE_API':
        return (
          <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            Live Verified
          </span>
        );
      case 'CACHED_SOURCE':
        return (
          <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-indigo-950/90 text-indigo-300 border-indigo-700' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            Verified Cache
          </span>
        );
      default:
        return (
          <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-slate-800 text-slate-300 border-slate-700' 
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            Curated Source
          </span>
        );
    }
  };

  return (
    <div 
      id={`opp-card-${opportunity.id}`}
      className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between hover:shadow-xl ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg text-slate-100'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-md text-slate-900'
      }`}
    >
      <div>
        {/* Top Header: Rank, Type, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
              {rank !== undefined && (
                <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg border ${
                  isDark ? 'bg-slate-800 text-cyan-300 border-slate-700' : 'bg-slate-100 text-indigo-700 border-slate-200'
                }`}>
                  #{rank}
                </span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isDark 
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {opportunity.type}
              </span>
              {getSourceBadge()}
              {opportunity.remote && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isDark 
                    ? 'bg-purple-950/80 text-purple-300 border-purple-800/60' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  Remote / Hybrid
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold tracking-tight leading-snug">
              {opportunity.title}
            </h3>

            <div className={`flex items-center space-x-3.5 mt-2.5 text-xs flex-wrap gap-y-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className={`flex items-center font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Building2 className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                {opportunity.organization}
              </span>
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                {opportunity.location}
              </span>
              {opportunity.deadline && (
                <span className="flex items-center text-amber-600 dark:text-amber-400 font-semibold">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Due {opportunity.deadline}
                </span>
              )}
              {opportunity.stipend_or_salary && (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Banknote className="h-3.5 w-3.5 mr-1.5" />
                  {opportunity.stipend_or_salary}
                </span>
              )}
            </div>
          </div>

          {/* Match Score Button / Badge */}
          <div className="flex flex-col items-end shrink-0">
            <button 
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs sm:text-sm cursor-pointer transition-all hover:scale-105 shadow-sm ${getScoreColor(opportunity.matchScore)}`}
              title="Click to view transparent 5-factor scoring formula"
            >
              <Percent className="h-3.5 w-3.5" />
              <span>{opportunity.matchScore}% Match</span>
              {showScoreDetails ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* 5-Factor Scoring Breakdown */}
        {showScoreDetails && opportunity.breakdown && (
          <div className={`mt-4 p-4 rounded-2xl border text-xs animate-fade-in ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between font-bold mb-2.5">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
                <span>Deterministic 5-Factor Score Breakdown:</span>
              </span>
              <span className="font-mono text-cyan-500 font-extrabold">{opportunity.matchScore} / 100 pts</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className={`p-2 rounded-xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Skills (40%)</span>
                <strong className="font-mono text-cyan-500">{opportunity.breakdown.skillsScore}/40</strong>
              </div>
              <div className={`p-2 rounded-xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Eligibility (25%)</span>
                <strong className="font-mono text-cyan-500">{opportunity.breakdown.eligibilityScore}/25</strong>
              </div>
              <div className={`p-2 rounded-xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location (15%)</span>
                <strong className="font-mono text-cyan-500">{opportunity.breakdown.locationScore}/15</strong>
              </div>
              <div className={`p-2 rounded-xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type (10%)</span>
                <strong className="font-mono text-cyan-500">{opportunity.breakdown.typeScore}/10</strong>
              </div>
              <div className={`p-2 rounded-xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Year (10%)</span>
                <strong className="font-mono text-cyan-500">{opportunity.breakdown.experienceScore}/10</strong>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <p className={`text-xs mt-3.5 line-clamp-2 leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {opportunity.description}
        </p>

        {/* Eligibility Quote */}
        <div className={`mt-3 p-2.5 rounded-xl border text-[11px] flex items-start space-x-2 ${
          isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <Info className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span><strong>Eligibility:</strong> {opportunity.eligibility}</span>
        </div>

        {/* Why Matched Points */}
        {opportunity.matchReasons && opportunity.matchReasons.length > 0 && (
          <div className="mt-3 space-y-1">
            {opportunity.matchReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400 space-x-1.5">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills: Matched vs Missing */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {opportunity.matchedSkills?.map((skill, idx) => (
            <span 
              key={`matched-${idx}`}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border flex items-center ${
                isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <Check className="h-3 w-3 mr-1" />
              {skill}
            </span>
          ))}
          {opportunity.missingSkills?.map((skill, idx) => (
            <span 
              key={`missing-${idx}`}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border flex items-center ${
                isDark
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className="mr-1 text-[10px]">△</span>
              {skill} (Gap)
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`mt-5 pt-4 border-t flex items-center justify-between gap-2 text-xs ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl border text-[11px] font-medium flex items-center space-x-1 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white border-emerald-500'
                : isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
            }`}
            title="Copy Opportunity Info"
          >
            {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <div className={`text-[11px] truncate max-w-[120px] sm:max-w-[160px] ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span className="font-semibold">{opportunity.source}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onBuildCareerPath && (
            <button
              onClick={() => onBuildCareerPath(opportunity)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/90 hover:border-cyan-500'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Generate a personalized career roadmap for this role"
            >
              <Route className="h-3.5 w-3.5" />
              <span>Career Path</span>
            </button>
          )}

          <button
            onClick={() => onToggleSave(opportunity)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isSaved
                ? isDark
                  ? 'bg-indigo-600/30 text-cyan-300 border-cyan-500/60'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                <span>Save</span>
              </>
            )}
          </button>

          {opportunity.url ? (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
              }`}
            >
              <span>Apply</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-[11px] opacity-50 italic">Internal Post</span>
          )}
        </div>
      </div>
    </div>
  );
};

