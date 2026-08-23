import React, { useState, useEffect, useMemo } from 'react';
import { 
  Route, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  ExternalLink, 
  Award, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Code2, 
  Layers, 
  Zap, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  FileText, 
  Square, 
  Briefcase, 
  ShieldCheck, 
  Bot, 
  GraduationCap, 
  CheckCheck,
  Flame,
  Terminal,
  BookmarkCheck
} from 'lucide-react';
import { 
  CareerPath, 
  CareerPhase, 
  CareerStep, 
  CareerSkillGap,
  CareerProject,
  CareerResource,
  UserProfile, 
  Opportunity, 
  AtsReport,
  CareerStepStatus
} from '../types';
import { 
  generateCareerPathAPI, 
  getCareerPaths, 
  updateCareerStepStatus, 
  deleteCareerPath 
} from '../services/careerPathService';

interface CareerPathPageProps {
  user: UserProfile | null;
  theme?: 'dark' | 'light';
  savedOpportunities?: Opportunity[];
  atsReports?: AtsReport[];
  initialTargetOpportunity?: Opportunity | null;
  onOpenNovaChat?: (contextMessage: string) => void;
  onNavigateToATS?: () => void;
}

const POPULAR_TARGET_ROLES = [
  'AI/ML Research Intern',
  'Full Stack Software Engineer',
  'Data Scientist & Analytics Intern',
  'Cloud DevOps & Infrastructure Engineer',
  'Frontend React Developer',
  'Cybersecurity Analyst'
];

export const CareerPathPage: React.FC<CareerPathPageProps> = ({
  user,
  theme = 'dark',
  savedOpportunities = [],
  atsReports = [],
  initialTargetOpportunity = null,
  onOpenNovaChat,
  onNavigateToATS
}) => {
  const isDark = theme === 'dark';
  const userId = user?.id || 'usr_rahul_001';

  // State
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [activePath, setActivePath] = useState<CareerPath | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State for New Path Generation
  const [showNewPathModal, setShowNewPathModal] = useState<boolean>(false);
  const [targetRoleInput, setTargetRoleInput] = useState<string>('');
  const [targetCompanyInput, setTargetCompanyInput] = useState<string>('');
  const [targetJobDescriptionInput, setTargetJobDescriptionInput] = useState<string>('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [includeAtsContext, setIncludeAtsContext] = useState<boolean>(true);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });
  const [filterPhase, setFilterPhase] = useState<number | 'ALL'>('ALL');

  // Load saved career paths on mount
  useEffect(() => {
    loadUserCareerPaths();
  }, [userId]);

  // Handle incoming target opportunity from props
  useEffect(() => {
    if (initialTargetOpportunity) {
      setTargetRoleInput(initialTargetOpportunity.title);
      setTargetCompanyInput(initialTargetOpportunity.organization || '');
      setSelectedOpportunityId(initialTargetOpportunity.id);
      setTargetJobDescriptionInput(
        `${initialTargetOpportunity.title} at ${initialTargetOpportunity.organization}\n` +
        `Required Skills: ${initialTargetOpportunity.skills?.join(', ') || ''}\n` +
        `Eligibility: ${initialTargetOpportunity.eligibility || 'N/A'}\n` +
        `Description: ${initialTargetOpportunity.description || ''}`
      );
      setShowNewPathModal(true);
    }
  }, [initialTargetOpportunity]);

  const loadUserCareerPaths = async () => {
    setIsLoading(true);
    try {
      const paths = await getCareerPaths(userId);
      setCareerPaths(paths);
      if (paths.length > 0 && !activePath) {
        setActivePath(paths[0]);
      }
    } catch (err) {
      console.error('Failed to load career paths:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePath = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetRoleInput.trim()) {
      setGenerationError('Please specify a target role or title.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const latestAts = includeAtsContext && atsReports.length > 0 ? atsReports[0] : null;

      const newPath = await generateCareerPathAPI({
        userId,
        targetRole: targetRoleInput.trim(),
        targetOpportunityId: selectedOpportunityId || undefined,
        targetOpportunityTitle: targetRoleInput.trim(),
        targetCompany: targetCompanyInput.trim() || undefined,
        targetJobDescription: targetJobDescriptionInput.trim() || undefined,
        userProfile: user || null,
        atsReport: latestAts
      });

      // Update state
      setCareerPaths(prev => [newPath, ...prev.filter(p => p.id !== newPath.id && p.careerPathId !== newPath.careerPathId)]);
      setActivePath(newPath);
      setShowNewPathModal(false);
      
      // Reset form
      setTargetRoleInput('');
      setTargetCompanyInput('');
      setTargetJobDescriptionInput('');
      setSelectedOpportunityId('');
      
      setSuccessToast(`Personalized roadmap created for ${newPath.targetRole}!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error('Career path generation error:', err);
      setGenerationError(err.message || 'Failed to create career path. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStepStatus = async (phaseId: string, stepId: string) => {
    if (!activePath) return;

    // Find current step status
    const targetPhase = activePath.phases.find(p => p.id === phaseId);
    const targetStep = targetPhase?.steps.find(st => st.id === stepId);
    if (!targetStep) return;

    // Cycle status: NOT_STARTED -> IN_PROGRESS -> COMPLETED -> NOT_STARTED
    let nextStatus: CareerStepStatus = 'IN_PROGRESS';
    if (targetStep.status === 'NOT_STARTED') nextStatus = 'IN_PROGRESS';
    else if (targetStep.status === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (targetStep.status === 'COMPLETED') nextStatus = 'NOT_STARTED';

    try {
      const updated = await updateCareerStepStatus(
        userId,
        activePath.id || activePath.careerPathId || 'path_default',
        phaseId,
        stepId,
        nextStatus,
        activePath,
        user
      );

      if (updated) {
        setActivePath(updated);
        setCareerPaths(prev => prev.map(p => (p.id === updated.id || p.careerPathId === updated.careerPathId ? updated : p)));
      }
    } catch (err) {
      console.error('Failed to update step status:', err);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    if (!window.confirm('Are you sure you want to delete this career path?')) return;
    try {
      await deleteCareerPath(userId, pathId);
      const remaining = careerPaths.filter(p => p.id !== pathId && p.careerPathId !== pathId);
      setCareerPaths(remaining);
      if (activePath && (activePath.id === pathId || activePath.careerPathId === pathId)) {
        setActivePath(remaining.length > 0 ? remaining[0] : null);
      }
      setSuccessToast('Career roadmap deleted.');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error('Failed to delete career path:', err);
    }
  };

  const handleSelectOpportunityPreset = (opp: Opportunity) => {
    setSelectedOpportunityId(opp.id);
    setTargetRoleInput(opp.title);
    setTargetCompanyInput(opp.organization || '');
    setTargetJobDescriptionInput(
      `${opp.title} at ${opp.organization}\n` +
      `Required Skills: ${opp.skills?.join(', ') || ''}\n` +
      `Eligibility: ${opp.eligibility || 'N/A'}\n` +
      `Description: ${opp.description || ''}`
    );
  };

  const togglePhaseExpand = (phaseNumber: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseNumber]: !prev[phaseNumber]
    }));
  };

  const handleAskNova = (step: CareerStep, phase: CareerPhase) => {
    if (onOpenNovaChat) {
      const query = `I am working on my "${activePath?.targetRole}" roadmap in Phase ${phase.phaseNumber} (${phase.title}). Can you guide me through this specific milestone: "${step.title}"? Why it matters: ${step.whyItMatters}. Expected deliverable: ${step.completionCriteria || 'N/A'}. What are the exact steps and best practices to complete this?`;
      onOpenNovaChat(query);
    }
  };

  // Readiness Score Badge Color Helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';
    if (score >= 60) return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50';
    if (score >= 40) return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
    return 'text-rose-400 bg-rose-950/80 border-rose-500/50';
  };

  // Step counts & progress
  const { totalSteps, completedSteps, progressPercentage } = useMemo(() => {
    if (!activePath) return { totalSteps: 0, completedSteps: 0, progressPercentage: 0 };
    let total = 0;
    let done = 0;
    activePath.phases.forEach(p => {
      p.steps.forEach(s => {
        total += 1;
        if (s.status === 'COMPLETED') done += 1;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { totalSteps: total, completedSteps: done, progressPercentage: pct };
  }, [activePath]);

  const matchedSkills = useMemo(() => {
    if (!activePath) return [];
    return activePath.skillGaps.filter(g => g.status === 'MATCHED');
  }, [activePath]);

  const missingSkills = useMemo(() => {
    if (!activePath) return [];
    return activePath.skillGaps.filter(g => g.status !== 'MATCHED');
  }, [activePath]);

  return (
    <div className={`min-h-screen py-4 transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 border-slate-800' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <Route className="w-3.5 h-3.5" />
                  <span>Personalized Career Path</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  Deterministic Scoring • Multi-Phase Execution
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Your Tailored Career Blueprint
              </h1>

              <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Deconstruct any target tech role or internship opportunity into sequenced learning phases, verifiable milestone projects, and dynamic readiness scoring grounded by Gemini AI.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
              <button
                id="create-career-path-btn"
                onClick={() => setShowNewPathModal(true)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                  isDark 
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Plan New Career Path</span>
              </button>

              {/* View ATS Report Button */}
              {atsReports.length > 0 && onNavigateToATS && (
                <button
                  onClick={onNavigateToATS}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-white' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ATS Resume Score</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}
        </div>

        {/* Existing Paths Switcher Tabs */}
        {careerPaths.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            <span className={`text-xs font-bold uppercase tracking-wider shrink-0 mr-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Your Roadmaps:
            </span>
            {careerPaths.map((path) => {
              const isSelected = activePath && (activePath.id === path.id || activePath.careerPathId === path.careerPathId);
              return (
                <div
                  key={path.id || path.careerPathId}
                  className="flex items-center shrink-0"
                >
                  <button
                    onClick={() => setActivePath(path)}
                    className={`flex items-center space-x-2.5 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/30'
                          : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                        : isDark
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{path.targetRole}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-200 text-indigo-800'
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {path.readinessScore}%
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={`p-16 rounded-3xl border text-center space-y-4 ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <RotateCcw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Loading your personalized roadmaps...
            </p>
          </div>
        )}

        {/* Empty State when no Career Paths exist */}
        {!isLoading && careerPaths.length === 0 && (
          <div className={`p-12 sm:p-16 rounded-3xl border text-center space-y-5 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Route className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold">No Career Paths Generated Yet</h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Pick a target role (e.g. AI/ML Research Intern, Full Stack Developer) or select an opportunity to generate your tailor-made, step-by-step career path.
              </p>
            </div>

            {/* Quick Starter Roles */}
            <div className="max-w-xl mx-auto pt-2">
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Quick Start with a Popular Role:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setTargetRoleInput(role);
                      setShowNewPathModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300 hover:border-cyan-500' 
                        : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                    }`}
                  >
                    + {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowNewPathModal(true)}
              className={`mt-4 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold inline-flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                isDark 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My First Career Roadmap</span>
            </button>
          </div>
        )}

        {/* Active Career Path Detailed Dashboard View */}
        {!isLoading && activePath && (
          <div className="space-y-8 animate-fadeIn">

            {/* Next Recommended Action Banner */}
            {activePath.nextAction && (
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border-emerald-800/60 shadow-lg' 
                  : 'bg-gradient-to-r from-emerald-50 via-white to-cyan-50 border-emerald-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950' : 'bg-emerald-600 text-white'
                  }`}>
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Next Recommended Milestone
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {activePath.nextAction.actionType}
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activePath.nextAction.title}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {activePath.nextAction.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleStepStatus(activePath.nextAction!.phaseId, activePath.nextAction!.stepId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Advance Milestone</span>
                  </button>

                  {onOpenNovaChat && (
                    <button
                      onClick={() => onOpenNovaChat(`I am ready to work on the milestone "${activePath.nextAction?.title}". Can you give me a personalized step-by-step tutorial and project setup instructions?`)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1 transition-all cursor-pointer ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-500' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ask Nova</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Path Overview & Readiness Score Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left 2 Cols: Path Info & Summary */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                      isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {activePath.targetCompany ? `${activePath.targetRole} @ ${activePath.targetCompany}` : activePath.targetRole}
                    </span>
                    <span className={`text-xs flex items-center space-x-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Timeline: {activePath.estimatedWeeks} Weeks (~8-12 hrs/week)</span>
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {activePath.scoreBreakdown?.calculationExplanation || `Personalized execution roadmap designed to bridge all verified skill gaps and build portfolio evidence for ${activePath.targetRole}.`}
                  </p>

                  {/* High Level Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        Milestone Progress: {completedSteps} of {totalSteps} Completed
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions for this path */}
                  <div className="flex items-center space-x-3 pt-3">
                    {onOpenNovaChat && (
                      <button
                        onClick={() => onOpenNovaChat(`I am executing my "${activePath.targetRole}" career path. Can you review my progress and suggest the next best milestone to focus on this week?`)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300 hover:bg-cyan-900' 
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Discuss with Agent Nova</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeletePath(activePath.id || activePath.careerPathId || '')}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isDark 
                          ? 'border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30' 
                          : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Delete this roadmap"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Col: Dynamic ATS & Job Readiness Score Card */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Job Readiness Score
                      </span>
                      <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Deterministic Transparent Engine
                      </p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl border font-mono font-extrabold text-lg flex items-center space-x-1 ${
                      getScoreColor(activePath.readinessScore)
                    }`}>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{activePath.readinessScore}%</span>
                    </div>
                  </div>

                  {/* Score Breakdown Bars */}
                  {activePath.scoreBreakdown && (
                    <div className="space-y-2 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Required Skills (Max 40)</span>
                          <span className="font-mono">{activePath.scoreBreakdown.requiredSkillsScore}/40</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(activePath.scoreBreakdown.requiredSkillsScore / 40) * 100}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Projects & Experience (Max 20)</span>
                          <span className="font-mono">{activePath.scoreBreakdown.projectsExperienceScore}/20</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(activePath.scoreBreakdown.projectsExperienceScore / 20) * 100}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tools & Frameworks (Max 10)</span>
                          <span className="font-mono">{activePath.scoreBreakdown.toolsTechnologiesScore}/10</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(activePath.scoreBreakdown.toolsTechnologiesScore / 10) * 100}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Preferred & Soft Skills (Max 15)</span>
                          <span className="font-mono">{activePath.scoreBreakdown.preferredSkillsScore}/15</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(activePath.scoreBreakdown.preferredSkillsScore / 15) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <p className={`text-[10px] leading-tight pt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    💡 Pro tip: Checking off practical deliverables and learning resources dynamically updates your verified readiness score.
                  </p>
                </div>
              </div>
            </div>

            {/* Gap Analysis: Matched vs. Missing Skills & Tools */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-bold">Profile vs. Target Role Skill Audit</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Matched Strengths */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/60 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Already in Your Profile & Verified ({matchedSkills.length})
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((gap, idx) => (
                      <span
                        key={idx}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border flex items-center space-x-1 ${
                          isDark 
                            ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300' 
                            : 'bg-white border-emerald-200 text-emerald-800 shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{gap.skill}</span>
                      </span>
                    ))}
                    {matchedSkills.length === 0 && (
                      <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No verified matches yet. The roadmap will guide you through all foundational tools.
                      </span>
                    )}
                  </div>
                </div>

                {/* Gaps to Bridge */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Identified Skill & Tool Gaps to Bridge ({missingSkills.length})
                    </h3>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {missingSkills.map((gap, idx) => (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{gap.skill}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            gap.priority === 'HIGH' 
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' 
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          }`}>
                            {gap.priority}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {gap.timeToBridge || '1-2 weeks'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Roadmap Execution Phases & Milestones */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-lg font-bold">Execution Timeline & Step Milestones</h2>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Click on milestone checkboxes to cycle status: Not Started ➔ In Progress ➔ Completed.
                  </p>
                </div>

                {/* Phase Filter Controls */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFilterPhase('ALL')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filterPhase === 'ALL'
                        ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-indigo-100 text-indigo-700 border-indigo-300'
                        : isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    All Phases
                  </button>
                  {activePath.phases.map(phase => (
                    <button
                      key={phase.phaseNumber}
                      onClick={() => setFilterPhase(phase.phaseNumber)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        filterPhase === phase.phaseNumber
                          ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-indigo-100 text-indigo-700 border-indigo-300'
                          : isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Phase {phase.phaseNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Phases */}
              <div className="space-y-6">
                {activePath.phases
                  .filter(phase => filterPhase === 'ALL' || filterPhase === phase.phaseNumber)
                  .map((phase) => {
                    const isExpanded = expandedPhases[phase.phaseNumber] ?? true;
                    const phaseCompletedSteps = phase.steps.filter(s => s.status === 'COMPLETED').length;
                    const phaseProgress = phase.steps.length > 0 ? Math.round((phaseCompletedSteps / phase.steps.length) * 100) : 0;

                    return (
                      <div 
                        key={phase.phaseNumber}
                        className={`rounded-3xl border transition-all ${
                          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        {/* Phase Header */}
                        <div 
                          onClick={() => togglePhaseExpand(phase.phaseNumber)}
                          className={`p-5 sm:p-6 flex items-center justify-between cursor-pointer border-b transition-colors ${
                            isDark ? 'border-slate-800/80 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className={`w-8 h-8 rounded-xl font-mono font-extrabold text-xs flex items-center justify-center ${
                              phaseProgress === 100
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isDark
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            }`}>
                              P{phase.phaseNumber}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm sm:text-base font-bold">
                                  {phase.title}
                                </h3>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {phase.duration}
                                </span>
                              </div>
                              <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Focus: {phase.focus}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                {phaseCompletedSteps}/{phase.steps.length} Done ({phaseProgress}%)
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Phase Steps List */}
                        {isExpanded && (
                          <div className="p-5 sm:p-6 space-y-4">
                            {phase.steps.map((step) => {
                              const isCompleted = step.status === 'COMPLETED';
                              const isInProgress = step.status === 'IN_PROGRESS';

                              return (
                                <div
                                  key={step.id}
                                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                    isCompleted
                                      ? isDark 
                                        ? 'bg-emerald-950/20 border-emerald-800/40 opacity-90' 
                                        : 'bg-emerald-50/50 border-emerald-200'
                                      : isInProgress
                                        ? isDark 
                                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm shadow-cyan-950/20' 
                                          : 'bg-indigo-50/60 border-indigo-300'
                                        : isDark 
                                          ? 'bg-slate-950/60 border-slate-800/90' 
                                          : 'bg-slate-50/80 border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start space-x-3.5 flex-1">
                                      {/* Checkbox Trigger */}
                                      <button
                                        onClick={() => handleToggleStepStatus(phase.id, step.id)}
                                        className="mt-0.5 cursor-pointer shrink-0 transition-transform active:scale-95"
                                        title={`Status: ${step.status}. Click to cycle.`}
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        ) : isInProgress ? (
                                          <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                                        ) : (
                                          <Square className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
                                        )}
                                      </button>

                                      <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h4 className={`text-xs sm:text-sm font-bold ${
                                            isCompleted ? 'line-through text-slate-400' : ''
                                          }`}>
                                            {step.title}
                                          </h4>

                                          {/* Step Status Badge */}
                                          <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-md ${
                                            isCompleted
                                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                              : isInProgress
                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                : isDark
                                                  ? 'bg-slate-800 text-slate-400'
                                                  : 'bg-slate-200 text-slate-600'
                                          }`}>
                                            {step.status.replace('_', ' ')}
                                          </span>

                                          <span className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            ~{step.estimatedDuration}
                                          </span>
                                        </div>

                                        <p className={`text-xs leading-relaxed ${
                                          isDark ? 'text-slate-300' : 'text-slate-600'
                                        }`}>
                                          {step.whyItMatters}
                                        </p>

                                        {/* Skills to learn chips */}
                                        {step.skillsToLearn && step.skillsToLearn.length > 0 && (
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Skills:</span>
                                            {step.skillsToLearn.map((sk, sIdx) => (
                                              <span 
                                                key={sIdx}
                                                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                                                  isDark ? 'bg-slate-900 border border-slate-800 text-cyan-300' : 'bg-white border border-slate-200 text-indigo-700'
                                                }`}
                                              >
                                                {sk}
                                              </span>
                                            ))}
                                          </div>
                                        )}

                                        {/* Deliverable Proof of Work */}
                                        {step.completionCriteria && (
                                          <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-start space-x-2 border ${
                                            isDark 
                                              ? 'bg-slate-900 border-slate-800 text-slate-300' 
                                              : 'bg-white border-slate-200 text-slate-700'
                                          }`}>
                                            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                              <span className="font-bold text-amber-400">Deliverable / Proof: </span>
                                              <span>{step.completionCriteria}</span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Verified Learning Resources */}
                                        {step.learningResources && step.learningResources.length > 0 && (
                                          <div className="pt-2 flex flex-wrap items-center gap-2">
                                            <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                              Curated Resources:
                                            </span>
                                            {step.learningResources.map((res, rIdx) => (
                                              <a
                                                key={rIdx}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                                                  isDark
                                                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300 hover:border-cyan-500'
                                                    : 'bg-white hover:bg-slate-50 border-slate-300 text-indigo-700 hover:border-indigo-400'
                                                }`}
                                              >
                                                <BookOpen className="w-3 h-3 text-cyan-400" />
                                                <span>{res.title} ({res.provider})</span>
                                                <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Ask Nova for assistance with this step */}
                                    {onOpenNovaChat && (
                                      <button
                                        onClick={() => handleAskNova(step, phase)}
                                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center space-x-1 shrink-0 transition-all cursor-pointer ${
                                          isDark
                                            ? 'bg-slate-900 border-slate-800 text-cyan-300 hover:bg-cyan-950 hover:border-cyan-500'
                                            : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                        title="Ask Agent Nova for step-by-step guidance on this milestone"
                                      >
                                        <Bot className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Ask Nova</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recommended Portfolio Projects */}
            {activePath.projects && activePath.projects.length > 0 && (
              <div className={`p-6 sm:p-8 rounded-3xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-2 mb-4">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold">
                    Targeted Portfolio Projects to Win This Role
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePath.projects.map((project, pIdx) => (
                    <div
                      key={pIdx}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-emerald-400">{project.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          project.difficulty === 'Advanced' 
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' 
                            : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                        }`}>
                          {project.difficulty}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {project.objective}
                      </p>

                      <div className={`p-2.5 rounded-xl text-xs ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700'}`}>
                        <strong className="text-cyan-400">Expected Deliverable: </strong>
                        <span>{project.expectedOutput}</span>
                      </div>

                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {project.technologies?.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Plan New Career Path */}
        {showNewPathModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold">Plan a Personalized Career Path</h2>
                </div>
                <button
                  onClick={() => setShowNewPathModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {generationError && (
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}

              <form onSubmit={handleGeneratePath} className="space-y-4">
                
                {/* Target Role Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block">
                    Target Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetRoleInput}
                    onChange={e => setTargetRoleInput(e.target.value)}
                    placeholder="e.g. AI/ML Research Intern, Full Stack Developer, Data Scientist"
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                      isDark 
                        ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Or pick a preset role:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TARGET_ROLES.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRoleInput(role)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                          targetRoleInput === role
                            ? isDark ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-indigo-100 border-indigo-300 text-indigo-800'
                            : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Target Company */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block">
                    Target Organization / Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetCompanyInput}
                    onChange={e => setTargetCompanyInput(e.target.value)}
                    placeholder="e.g. CognitiveScale Labs India, Google, Microsoft, Startup"
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                      isDark 
                        ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Pick from Saved Opportunities if available */}
                {savedOpportunities.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold block">
                      Or link a Tracked / Saved Opportunity:
                    </label>
                    <select
                      value={selectedOpportunityId}
                      onChange={e => {
                        const sel = savedOpportunities.find(o => o.id === e.target.value);
                        if (sel) handleSelectOpportunityPreset(sel);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold border outline-none ${
                        isDark 
                          ? 'bg-slate-950 border-slate-700 text-slate-100' 
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="">-- Choose saved opportunity --</option>
                      {savedOpportunities.map(opp => (
                        <option key={opp.id} value={opp.id}>
                          {opp.title} ({opp.organization})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Include ATS Context Switch */}
                {atsReports.length > 0 && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="include-ats-check"
                      checked={includeAtsContext}
                      onChange={e => setIncludeAtsContext(e.target.checked)}
                      className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="include-ats-check" className="text-xs font-semibold cursor-pointer">
                      Factor in latest ATS Resume score ({atsReports[0].score}%) & verified skills
                    </label>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowNewPathModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-emerald-950/50'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    } ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isGenerating ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing Personalized Roadmap...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Roadmap</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
