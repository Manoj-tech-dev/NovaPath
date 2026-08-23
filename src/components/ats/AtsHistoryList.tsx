import React from 'react';
import { 
  FileText, 
  Trash2, 
  ArrowRight, 
  Target, 
  Layers, 
  Calendar,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { AtsReport } from '../../types';

interface AtsHistoryListProps {
  reports: AtsReport[];
  onSelectReport: (report: AtsReport) => void;
  onDeleteReport: (reportId: string, resumeId?: string, fileName?: string) => void;
  onNewScan: () => void;
  theme: 'dark' | 'light';
}

export const AtsHistoryList: React.FC<AtsHistoryListProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onNewScan,
  theme
}) => {
  const isDark = theme === 'dark';

  const getScoreBadge = (score: number) => {
    if (score >= 80) return {
      text: 'text-emerald-400',
      bg: isDark ? 'bg-emerald-950/70 border-emerald-800/60' : 'bg-emerald-100 border-emerald-200 text-emerald-800',
      label: 'High ATS'
    };
    if (score >= 60) return {
      text: 'text-amber-400',
      bg: isDark ? 'bg-amber-950/70 border-amber-800/60' : 'bg-amber-100 border-amber-200 text-amber-800',
      label: 'Moderate'
    };
    return {
      text: 'text-rose-400',
      bg: isDark ? 'bg-rose-950/70 border-rose-800/60' : 'bg-rose-100 border-rose-200 text-rose-800',
      label: 'Optimize'
    };
  };

  if (reports.length === 0) {
    return (
      <div
        id="empty-ats-history"
        className={`p-10 text-center rounded-3xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div
          className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
            isDark ? 'bg-slate-800 text-cyan-400' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold">No ATS Reports Found</h3>
        <p className={`text-xs mt-1.5 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          You haven't scanned any resumes yet. Upload your PDF, DOCX, or Image resume to receive an in-depth ATS readiness report.
        </p>
        <button
          type="button"
          id="history-start-scan-btn"
          onClick={onNewScan}
          className="mt-5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md hover:opacity-90 inline-flex items-center space-x-2 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Scan Resume</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold">Previous ATS Audit Reports</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Securely stored in your NovaPath profile ({reports.length} total)
          </p>
        </div>

        <button
          type="button"
          id="history-new-scan-btn"
          onClick={onNewScan}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>New Scan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => {
          const badge = getScoreBadge(rep.score);
          const totalIssues = (rep.formattingIssues?.length || 0) + (rep.contentIssues?.length || 0);

          return (
            <div
              key={rep.reportId || rep.id}
              className={`p-5 rounded-3xl border transition-all relative group ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-950/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-3 rounded-2xl flex-shrink-0 ${
                      isDark ? 'bg-slate-800 text-cyan-400' : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">
                      {rep.fileName}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black font-mono">{rep.score}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/100</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Target Role or Job Description tag */}
              {rep.jobTitle && (
                <div className={`mt-3 px-3 py-1.5 rounded-xl border text-xs flex items-center space-x-2 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Target className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">Target: <strong className="font-semibold">{rep.jobTitle}</strong></span>
                </div>
              )}

              {/* Category mini-metrics */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 text-center text-[11px]">
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px]">Keywords</span>
                  <span className="font-bold font-mono">{rep.categoryScores?.keywordMatch || 0}/25</span>
                </div>
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px]">Structure</span>
                  <span className="font-bold font-mono">{rep.categoryScores?.structure || 0}/20</span>
                </div>
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px]">Issues</span>
                  <span className="font-bold font-mono text-amber-400">{totalIssues}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onDeleteReport(rep.reportId || rep.id, rep.resumeId, rep.fileName)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer`}
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectReport(rep)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-400 dark:text-cyan-300 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
