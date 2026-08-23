import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Sparkles, 
  Layers, 
  Key, 
  FileText, 
  Briefcase, 
  UserCheck, 
  ArrowLeft, 
  Printer, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Target,
  Wand2,
  ListChecks,
  Eye,
  GraduationCap
} from 'lucide-react';
import { AtsReport, AtsIssueSeverity } from '../../types';
import { RoleModificationsView } from './RoleModificationsView';

interface AtsReportDetailProps {
  report: AtsReport;
  onBack: () => void;
  onDelete?: (reportId: string, resumeId?: string, fileName?: string) => void;
  theme: 'dark' | 'light';
}

export const AtsReportDetail: React.FC<AtsReportDetailProps> = ({
  report,
  onBack,
  onDelete,
  theme
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'roleModifications' | 'issues' | 'keywords' | 'bullets' | 'parsedData'>('roleModifications');
  const [selectedSeverity, setSelectedSeverity] = useState<AtsIssueSeverity | 'ALL'>('ALL');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    education: true,
    experience: true,
    projects: true,
    skills: true
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return {
      text: 'text-emerald-500',
      bg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-800/60' : 'border-emerald-200',
      bar: 'bg-emerald-500',
      label: 'High ATS Readiness'
    };
    if (score >= 60) return {
      text: 'text-amber-500',
      bg: isDark ? 'bg-amber-950/60' : 'bg-amber-50',
      border: isDark ? 'border-amber-800/60' : 'border-amber-200',
      bar: 'bg-amber-500',
      label: 'Moderate ATS Readiness'
    };
    return {
      text: 'text-rose-500',
      bg: isDark ? 'bg-rose-950/60' : 'bg-rose-50',
      border: isDark ? 'border-rose-800/60' : 'border-rose-200',
      bar: 'bg-rose-500',
      label: 'Needs Optimization'
    };
  };

  const scoreMeta = getScoreColor(report.score);
  const allIssues = [
    ...(report.formattingIssues || []),
    ...(report.contentIssues || [])
  ];

  const filteredIssues = selectedSeverity === 'ALL'
    ? allIssues
    : allIssues.filter(i => i.severity === selectedSeverity);

  const highSeverityCount = allIssues.filter(i => i.severity === 'HIGH').length;
  const mediumSeverityCount = allIssues.filter(i => i.severity === 'MEDIUM').length;
  const lowSeverityCount = allIssues.filter(i => i.severity === 'LOW').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            id="back-to-scanner-btn"
            onClick={onBack}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title="Back to scanner"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight truncate max-w-[280px] sm:max-w-md">
                {report.fileName}
              </h2>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${scoreMeta.bg} ${scoreMeta.text} ${scoreMeta.border}`}
              >
                {report.score}/100
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Scanned on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {report.jobTitle ? ` • Target: ${report.jobTitle}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="print-report-btn"
            onClick={handlePrint}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          {onDelete && (
            <button
              type="button"
              id="delete-report-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-900/60'
                  : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50 shadow-sm'
              }`}
              title="Delete report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-bold flex items-center space-x-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete ATS Report?</span>
            </h3>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to permanently delete the analysis report for <strong className="font-semibold">{report.fileName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2.5 mt-6">
              <button
                type="button"
                id="cancel-delete-report-btn"
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-report-btn"
                onClick={() => {
                  onDelete?.(report.reportId || report.id, report.resumeId, report.fileName);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Main ATS Score Card */}
        <div
          id="ats-score-hero-card"
          className={`md:col-span-4 p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 shadow-xl shadow-cyan-950/10'
              : 'bg-white border-slate-200 shadow-lg shadow-indigo-100/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ATS Readiness Score
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${scoreMeta.bg} ${scoreMeta.text} ${scoreMeta.border}`}>
                {scoreMeta.label}
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <span className={`text-5xl sm:text-6xl font-black tracking-tight ${scoreMeta.text}`}>
                {report.score}
              </span>
              <span className={`text-lg font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                / 100
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${scoreMeta.bar}`}
                style={{ width: `${report.score}%` }}
              />
            </div>
          </div>

          {/* Job Match pill if JD exists */}
          {report.jobMatchScore !== undefined && (
            <div
              id="job-match-pill"
              className={`mt-6 p-3.5 rounded-2xl border ${
                isDark ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold">Job Description Match</span>
                </div>
                <span className="text-sm font-black font-mono">{report.jobMatchScore}%</span>
              </div>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-cyan-200/80' : 'text-indigo-700'}`}>
                Based on skills and keyword overlap with target job description.
              </p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Detected Issues</span>
            <span className="font-bold font-mono">
              <span className="text-rose-500">{highSeverityCount} High</span> •{' '}
              <span className="text-amber-500">{mediumSeverityCount} Med</span> •{' '}
              <span className="text-slate-400">{lowSeverityCount} Low</span>
            </span>
          </div>
        </div>

        {/* 6 Category Breakdown Grid */}
        <div
          id="category-breakdown-card"
          className={`md:col-span-8 p-6 rounded-3xl border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Pillar Category Breakdown</span>
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Deterministic 100-Point Audit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Keyword Relevance (25 pts) */}
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Keyword Relevance</span>
                </span>
                <span className="font-mono font-bold">{report.categoryScores.keywordMatch}/25</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(report.categoryScores.keywordMatch / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Resume Structure (20 pts) */}
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Resume Structure</span>
                </span>
                <span className="font-mono font-bold">{report.categoryScores.structure}/20</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(report.categoryScores.structure / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Experience & Content Quality (20 pts) */}
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Experience Quality</span>
                </span>
                <span className="font-mono font-bold">{report.categoryScores.experienceQuality}/20</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(report.categoryScores.experienceQuality / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. Skills Alignment (15 pts) */}
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Skills Alignment</span>
                </span>
                <span className="font-mono font-bold">{report.categoryScores.skillsAlignment}/15</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(report.categoryScores.skillsAlignment / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* 5. ATS Readability (10 pts) */}
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>ATS Readability</span>
                </span>
                <span className="font-mono font-bold">{report.categoryScores.atsReadability}/10</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(report.categoryScores.atsReadability / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* 6. Contact Information (10 pts) */}
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contact Information</span>
                </span>
                <span className="font-mono font-bold">{report.categoryScores.contactInformation}/10</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(report.categoryScores.contactInformation / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          type="button"
          id="tab-role-modifications"
          onClick={() => setActiveTab('roleModifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'roleModifications'
              ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm' : 'bg-indigo-600 text-white shadow-sm'
              : isDark ? 'text-cyan-400 hover:text-white bg-slate-900/40' : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50/60'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Role Selection Changes & Blueprint</span>
          </div>
        </button>

        <button
          type="button"
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <ListChecks className="w-3.5 h-3.5" />
            <span>Recommendations ({report.recommendations?.length || 0})</span>
          </div>
        </button>

        <button
          type="button"
          id="tab-issues"
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'issues'
              ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Detected Issues ({allIssues.length})</span>
          </div>
        </button>

        <button
          type="button"
          id="tab-keywords"
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'keywords'
              ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Keywords ({report.matchedKeywords?.length || 0} Matched)</span>
          </div>
        </button>

        <button
          type="button"
          id="tab-bullets"
          onClick={() => setActiveTab('bullets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'bullets'
              ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Actionable Bullet Rewrites ({report.bulletImprovements?.length || 0})</span>
          </div>
        </button>

        <button
          type="button"
          id="tab-parsed-data"
          onClick={() => setActiveTab('parsedData')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'parsedData'
              ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Parsed Resume Data</span>
          </div>
        </button>
      </div>

      {/* Tab: Role Selection Blueprint & Strategic Modifications */}
      {activeTab === 'roleModifications' && (
        <RoleModificationsView
          roleModifications={report.roleModifications}
          jobTitle={report.jobTitle}
          theme={theme}
        />
      )}

      {/* Tab 1: Actionable Recommendations Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div
            id="recommendations-container"
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-base font-bold mb-4 flex items-center space-x-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <span>Prioritized Strategic Action Items</span>
            </h3>

            {report.recommendations && report.recommendations.length > 0 ? (
              <div className="space-y-3">
                {report.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                      isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                        isDark ? 'bg-cyan-900/60 text-cyan-300' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No specific recommendations generated for this document.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Detected Issues & Formatting Risks */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Severity Filter Tabs */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="filter-issues-all"
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedSeverity === 'ALL'
                  ? isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-200 border-slate-300 text-slate-900'
                  : isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              All ({allIssues.length})
            </button>
            <button
              type="button"
              id="filter-issues-high"
              onClick={() => setSelectedSeverity('HIGH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedSeverity === 'HIGH'
                  ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                  : isDark ? 'border-slate-800 text-rose-400/70' : 'border-slate-200 text-rose-600'
              }`}
            >
              High Priority ({highSeverityCount})
            </button>
            <button
              type="button"
              id="filter-issues-med"
              onClick={() => setSelectedSeverity('MEDIUM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedSeverity === 'MEDIUM'
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                  : isDark ? 'border-slate-800 text-amber-400/70' : 'border-slate-200 text-amber-600'
              }`}
            >
              Medium Priority ({mediumSeverityCount})
            </button>
            <button
              type="button"
              id="filter-issues-low"
              onClick={() => setSelectedSeverity('LOW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedSeverity === 'LOW'
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              Low Priority ({lowSeverityCount})
            </button>
          </div>

          {filteredIssues.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredIssues.map((issue, idx) => {
                const isHigh = issue.severity === 'HIGH';
                const isMed = issue.severity === 'MEDIUM';
                return (
                  <div
                    key={issue.id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isHigh
                        ? isDark ? 'bg-rose-950/30 border-rose-900/60' : 'bg-rose-50/70 border-rose-200'
                        : isMed
                        ? isDark ? 'bg-amber-950/30 border-amber-900/60' : 'bg-amber-50/70 border-amber-200'
                        : isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {isHigh ? (
                          <AlertOctagon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        ) : isMed ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                          isHigh
                            ? 'bg-rose-900/60 text-rose-300'
                            : isMed
                            ? 'bg-amber-900/60 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {issue.severity} • {issue.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold mt-2.5">
                      {issue.problem}
                    </h4>

                    <div className="mt-2 text-xs space-y-1.5">
                      <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        <strong className="font-semibold text-slate-400">Why it matters:</strong> {issue.whyItMatters}
                      </p>
                      <p className={`p-2.5 rounded-xl border ${
                        isDark ? 'bg-slate-950/80 border-slate-800/90 text-cyan-300' : 'bg-white border-slate-200 text-indigo-900'
                      }`}>
                        <strong className="font-bold">Recommended fix:</strong> {issue.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold">No issues found in this category.</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Your resume satisfies the criteria for this filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Keywords Analysis */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          {/* Matched Keywords */}
          <div
            id="matched-keywords-card"
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-sm sm:text-base font-bold flex items-center space-x-2 text-emerald-400 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched Core Keywords ({report.matchedKeywords?.length || 0})</span>
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              These critical skills and keywords are clearly represented and indexed by ATS filters.
            </p>

            {report.matchedKeywords && report.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.matchedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                      isDark
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No specific matched keywords detected.
              </p>
            )}
          </div>

          {/* Missing Relevant Keywords */}
          <div
            id="missing-keywords-card"
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-sm sm:text-base font-bold flex items-center space-x-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing Relevant Keywords ({report.missingKeywords?.length || 0})</span>
            </h3>
            <p className={`text-xs mb-4 italic ${isDark ? 'text-amber-200/80' : 'text-amber-800'}`}>
              * Guidance: Consider adding these skills if you have genuine, verifiable project or internship experience.
            </p>

            {report.missingKeywords && report.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.missingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                      isDark
                        ? 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No missing keywords identified for this role.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Actionable Bullet Rewrites */}
      {activeTab === 'bullets' && (
        <div className="space-y-4">
          <div
            id="bullet-rewrites-header"
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <p className="text-xs font-semibold leading-relaxed">
              <strong>Action Verb & Impact Optimization:</strong> The following rewrites preserve all factual details while enhancing active sentence structure and technical clarity for recruiter and ATS evaluation.
            </p>
          </div>

          {report.bulletImprovements && report.bulletImprovements.length > 0 ? (
            <div className="space-y-4">
              {report.bulletImprovements.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-5 rounded-3xl border space-y-3.5 ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.section || 'Experience / Project Bullet'}
                    </span>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Optimization #{idx + 1}
                    </span>
                  </div>

                  {/* Original Bullet */}
                  <div className={`p-3.5 rounded-2xl border text-xs ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      Original
                    </span>
                    <p className="italic">"{item.originalBullet}"</p>
                  </div>

                  {/* Improved Bullet */}
                  <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium ${
                    isDark ? 'bg-cyan-950/60 border-cyan-800 text-cyan-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Recommended Rewrite</span>
                    </span>
                    <p className="font-semibold leading-relaxed">"{item.improvedBullet}"</p>
                  </div>

                  {/* Why it was rewritten */}
                  <p className={`text-xs pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <strong className="font-semibold text-slate-300">Rationale:</strong> {item.reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold">Bullet points are cleanly formatted.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Parsed Resume Data View */}
      {activeTab === 'parsedData' && (
        <div className="space-y-4">
          {/* Contact Details */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Contact Profile</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Name:</span>
                <span className="font-bold">{report.extractedData.name || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email:</span>
                <span className="font-bold">{report.extractedData.email || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone:</span>
                <span className="font-bold">{report.extractedData.phone || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">LinkedIn:</span>
                <span className="font-bold truncate max-w-[200px] block">{report.extractedData.linkedin || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">GitHub:</span>
                <span className="font-bold truncate max-w-[200px] block">{report.extractedData.github || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Portfolio:</span>
                <span className="font-bold truncate max-w-[200px] block">{report.extractedData.portfolio || 'Not detected'}</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('education')}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Education ({report.extractedData.education?.length || 0})</span>
              </h4>
              {expandedSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {expandedSections.education && (
              <div className="mt-3 space-y-2.5">
                {report.extractedData.education?.map((edu, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="font-bold text-sm">{edu.institution}</p>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      {edu.degree} in {edu.fieldOfStudy} {edu.graduationYear ? `(${edu.graduationYear})` : ''} {edu.gpaOrGrade ? `• GPA: ${edu.gpaOrGrade}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('skills')}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Skills Inventory</span>
              </h4>
              {expandedSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {expandedSections.skills && (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block mb-1">Technical Languages:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.extractedData.skills?.technical?.map((s, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`}>
                        {s}
                      </span>
                    )) || <span className="text-slate-400">None detected</span>}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block mb-1">Frameworks & Tools:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.extractedData.skills?.frameworksAndTools?.map((s, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`}>
                        {s}
                      </span>
                    )) || <span className="text-slate-400">None detected</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('experience')}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4" />
                <span>Experience ({report.extractedData.experience?.length || 0})</span>
              </h4>
              {expandedSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {expandedSections.experience && (
              <div className="mt-3 space-y-3">
                {report.extractedData.experience?.map((exp, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border text-xs ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{exp.role}</p>
                      <span className="text-slate-400 font-mono text-[11px]">{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                    <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                      {exp.bullets?.map((b, bIdx) => (
                        <li key={bIdx} className={isDark ? 'text-slate-300' : 'text-slate-700'}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('projects')}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Projects ({report.extractedData.projects?.length || 0})</span>
              </h4>
              {expandedSections.projects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {expandedSections.projects && (
              <div className="mt-3 space-y-3">
                {report.extractedData.projects?.map((proj, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border text-xs ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="font-bold text-sm">{proj.name}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.technologies.map((t, tIdx) => (
                          <span key={tIdx} className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isDark ? 'bg-slate-800 text-cyan-300' : 'bg-indigo-100 text-indigo-700'}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                      {proj.bullets?.map((b, bIdx) => (
                        <li key={bIdx} className={isDark ? 'text-slate-300' : 'text-slate-700'}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
