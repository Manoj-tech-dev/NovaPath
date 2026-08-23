import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  Lock, 
  History, 
  ArrowRight, 
  Target, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Briefcase, 
  FileText,
  RotateCcw,
  Zap
} from 'lucide-react';
import { AtsDropzone } from './AtsDropzone';
import { AtsReportDetail } from './AtsReportDetail';
import { AtsHistoryList } from './AtsHistoryList';
import { AtsReport, UserProfile } from '../../types';
import { uploadResumeToStorage, saveAtsReport, getAtsReports, deleteAtsReport } from '../../services/atsService';

interface AtsScannerViewProps {
  user: UserProfile | null;
  theme: 'dark' | 'light';
  onNavigateToChat?: () => void;
}

const ANALYSIS_STEPS = [
  { step: 1, label: 'Uploading resume & generating storage record' },
  { step: 2, label: 'Extracting text & parsing resume structure' },
  { step: 3, label: 'Auditing contact information & layout readability' },
  { step: 4, label: 'Analyzing technical keywords & core competencies' },
  { step: 5, label: 'Evaluating experience impact & action verbs' },
  { step: 6, label: 'Calculating deterministic ATS readiness score' },
  { step: 7, label: 'Generating actionable bullet improvements' },
];

export const AtsScannerView: React.FC<AtsScannerViewProps> = ({
  user,
  theme,
  onNavigateToChat
}) => {
  const isDark = theme === 'dark';
  const userId = user?.id || 'usr_rahul_001';

  const [viewMode, setViewMode] = useState<'upload' | 'detail' | 'history'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJdInput, setShowJdInput] = useState<boolean>(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [reports, setReports] = useState<AtsReport[]>([]);
  const [activeReport, setActiveReport] = useState<AtsReport | null>(null);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  // Load existing ATS reports on mount
  useEffect(() => {
    fetchUserReports();
  }, [userId]);

  const fetchUserReports = async () => {
    setLoadingReports(true);
    try {
      const data = await getAtsReports(userId);
      setReports(data);
    } catch (err) {
      console.error('Failed to load user ATS reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setAnalysisError('Please select or upload a resume file first.');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);
    setCurrentStepIndex(0);

    // Step progression animation ticker
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      // 1. Asynchronously sync to Firebase Storage & save metadata in background (non-blocking)
      const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      uploadResumeToStorage(userId, selectedFile, resumeId).catch((storageErr) => {
        console.info('Storage metadata non-blocking sync notice:', storageErr);
      });

      // 2. Prepare Form Data for Backend Gemini & Scoring Engine
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('userId', userId);
      formData.append('resumeId', resumeId);
      formData.append('fileName', selectedFile.name);
      formData.append('fileType', selectedFile.type || 'application/pdf');
      if (jobTitle.trim()) formData.append('jobTitle', jobTitle.trim());
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());

      const res = await fetch('/api/ats/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errData.error || errData.details || `Analysis failed with status ${res.status}`);
      }

      const report: AtsReport = await res.json();

      // 3. Persist to Firestore asynchronously
      saveAtsReport(userId, report).catch((saveErr) => {
        console.info('Firestore report async save note:', saveErr);
      });

      // 4. Update UI
      setReports(prev => [report, ...prev.filter(r => (r.reportId || r.id) !== (report.reportId || report.id))]);
      setActiveReport(report);
      setViewMode('detail');
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('ATS Analysis Error:', err);
      if (err.name === 'AbortError') {
        setAnalysisError('The resume analysis request timed out. Please try uploading the file again or paste key sections.');
      } else {
        setAnalysisError(err.message || 'An error occurred during resume analysis. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setCurrentStepIndex(0);
    }
  };

  const handleDeleteReport = async (reportId: string, resumeId?: string, fileName?: string) => {
    try {
      await deleteAtsReport(userId, reportId, resumeId, fileName);
      setReports(prev => prev.filter(r => (r.reportId || r.id) !== reportId));
      if (activeReport && (activeReport.reportId === reportId || activeReport.id === reportId)) {
        setActiveReport(null);
        setViewMode('upload');
      }
    } catch (err) {
      console.error('Delete report error:', err);
    }
  };

  const handleResetForm = () => {
    setSelectedFile(null);
    setJobTitle('');
    setJobDescription('');
    setShowJdInput(false);
    setAnalysisError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-xl ${
                isDark
                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              }`}
            >
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                ATS Resume Scanner
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enterprise parsing, deterministic scoring & recruiter impact optimization
              </p>
            </div>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="view-scanner-tab-btn"
            onClick={() => {
              setActiveReport(null);
              setViewMode('upload');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'upload'
                ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Resume</span>
            </div>
          </button>

          <button
            type="button"
            id="view-history-tab-btn"
            onClick={() => setViewMode('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              viewMode === 'history'
                ? isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Reports</span>
              {reports.length > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isDark ? 'bg-cyan-500 text-slate-950' : 'bg-indigo-600 text-white'
                }`}>
                  {reports.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Card */}
      <div
        id="privacy-guarantee-card"
        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          isDark
            ? 'bg-slate-900/60 border-slate-800 text-slate-300'
            : 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Privacy Assured:</strong> Your resume is processed to generate your ATS analysis and stored securely in your NovaPath account.
          </span>
        </div>
      </div>

      {/* Main View Switcher */}
      {viewMode === 'detail' && activeReport ? (
        <AtsReportDetail
          report={activeReport}
          onBack={() => setViewMode('upload')}
          onDelete={handleDeleteReport}
          theme={theme}
        />
      ) : viewMode === 'history' ? (
        <AtsHistoryList
          reports={reports}
          onSelectReport={(rep) => {
            setActiveReport(rep);
            setViewMode('detail');
          }}
          onDeleteReport={handleDeleteReport}
          onNewScan={() => setViewMode('upload')}
          theme={theme}
        />
      ) : (
        /* Upload & Analyze Section */
        <div className="space-y-6">
          {/* Analysis Active Progress Overlay */}
          {isAnalyzing ? (
            <div
              id="analysis-progress-card"
              className={`p-8 sm:p-10 rounded-3xl border text-center space-y-6 ${
                isDark ? 'bg-slate-900/90 border-cyan-500/30' : 'bg-white border-indigo-200 shadow-xl'
              }`}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Auditing Resume with ATS Intelligence
                </h3>
                <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Analyzing document structure, extracting entities, evaluating keyword density, and calculating deterministic readiness scores.
                </p>
              </div>

              {/* Multi-step progress list */}
              <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
                {ANALYSIS_STEPS.map((item, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={item.step}
                      className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-all ${
                        isDone
                          ? isDark
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : isCurrent
                          ? isDark
                            ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 animate-pulse'
                            : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                          : isDark
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-current flex-shrink-0" />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Dropzone & File Upload */}
              <div className="lg:col-span-7 space-y-5">
                <div
                  id="resume-upload-card"
                  className={`p-6 rounded-3xl border ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-bold flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Step 1: Upload Resume File</span>
                    </h3>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      PDF, DOCX, PNG, JPG
                    </span>
                  </div>

                  <AtsDropzone
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    theme={theme}
                    disabled={isAnalyzing}
                  />

                  {/* Optional Target Job Description Toggle */}
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      id="toggle-job-desc-btn"
                      onClick={() => setShowJdInput(!showJdInput)}
                      className={`text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
                        showJdInput
                          ? isDark ? 'text-cyan-300' : 'text-indigo-600'
                          : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      <span>
                        {showJdInput ? 'Target Job Description (Enabled)' : '+ Add Target Job Description (Optional for JD-Match Scoring)'}
                      </span>
                    </button>

                    {showJdInput && (
                      <div className="mt-3.5 space-y-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Target Job Role / Title
                          </label>
                          <input
                            type="text"
                            id="target-job-title-input"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Full-Stack Engineer Intern, Junior ML Engineer"
                            className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                              isDark
                                ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Paste Job Description or Requirements
                          </label>
                          <textarea
                            id="target-job-desc-textarea"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={4}
                            placeholder="Paste the job posting requirements or responsibilities to calculate specific keyword alignment and match score..."
                            className={`w-full p-3 rounded-xl text-xs border outline-none transition-all resize-none ${
                              isDark
                                ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error display */}
                  {analysisError && (
                    <div
                      id="analysis-error-banner"
                      className={`mt-4 p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
                        isDark
                          ? 'bg-rose-950/60 border-rose-900/60 text-rose-300'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  {/* Primary CTA Buttons */}
                  <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      id="reset-scanner-btn"
                      onClick={handleResetForm}
                      disabled={isAnalyzing || (!selectedFile && !jobDescription)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-40'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      id="start-analysis-btn"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing || !selectedFile}
                      className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Resume with ATS Scanner</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Educational ATS Info & Benchmark Pillars */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  id="ats-pillars-card"
                  className={`p-6 rounded-3xl border ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <h3 className="text-sm font-bold flex items-center space-x-2 text-cyan-400 mb-3">
                    <Zap className="w-4 h-4" />
                    <span>How Your Resume Is Evaluated</span>
                  </h3>
                  <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    The scanner employs a mathematical 100-point rubric assessing 6 critical ATS dimensions:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-semibold text-cyan-400">1. Keyword Relevance</span>
                      <span className="font-mono font-bold">25 Points</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-semibold text-indigo-400">2. Resume Structure</span>
                      <span className="font-mono font-bold">20 Points</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-semibold text-emerald-400">3. Experience Quality & Verbs</span>
                      <span className="font-mono font-bold">20 Points</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-semibold text-purple-400">4. Skills Alignment</span>
                      <span className="font-mono font-bold">15 Points</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-semibold text-teal-400">5. ATS Readability & Parsing</span>
                      <span className="font-mono font-bold">10 Points</span>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-semibold text-amber-400">6. Contact Information</span>
                      <span className="font-mono font-bold">10 Points</span>
                    </div>
                  </div>

                  {onNavigateToChat && (
                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={onNavigateToChat}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-750'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask Agent Nova for Resume Guidance</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
