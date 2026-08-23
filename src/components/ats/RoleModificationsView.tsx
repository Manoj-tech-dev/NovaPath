import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Target, 
  CheckSquare, 
  Square, 
  MessageSquare, 
  Layers, 
  Briefcase, 
  ArrowRight,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import { RoleModificationBlueprint } from '../../types';

interface RoleModificationsViewProps {
  roleModifications?: RoleModificationBlueprint;
  jobTitle?: string;
  theme: 'dark' | 'light';
}

export const RoleModificationsView: React.FC<RoleModificationsViewProps> = ({
  roleModifications,
  jobTitle,
  theme
}) => {
  const isDark = theme === 'dark';
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!roleModifications) {
    return (
      <div className={`p-8 text-center rounded-3xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <h4 className="text-base font-bold">Role Modification Blueprint Generating</h4>
        <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Run an ATS scan with a target job title or description to generate a role-specific blueprint.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const toggleChecklist = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const likelihoodBadge = {
    HIGH: {
      text: 'High Selection Probability',
      color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
      lightColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    MODERATE: {
      text: 'Moderate Probability (Fix Gaps to Secure Interview)',
      color: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      lightColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    NEEDS_TAILORING: {
      text: 'Needs Strategic Tailoring for this Role',
      color: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
      lightColor: 'bg-rose-50 text-rose-800 border-rose-200'
    }
  }[roleModifications.selectionLikelihood || 'MODERATE'];

  const handleCopyFullPlan = () => {
    const markdown = `# Role Selection Blueprint for ${roleModifications.targetRole || jobTitle || 'Target Role'}

## Selection Likelihood: ${roleModifications.selectionLikelihood}

### Recommended Headline
${roleModifications.headlineSuggestion}

### Tailored Executive Summary
${roleModifications.summaryRewrite}

### Priority Skills to Elevate
${roleModifications.skillsToElevate?.map(s => `- ${s}`).join('\n')}

### Project Reframing & Angles
${roleModifications.projectModifications?.map(p => `#### ${p.projectName}\n- Current Framing: ${p.currentFocus}\n- Recommended Role Angle: ${p.recommendedRoleAngle}\n- Key Tech to Highlight: ${p.suggestedTechToHighlight?.join(', ')}`).join('\n\n')}

### Experience Phrasing Modifications
${roleModifications.experienceModifications?.map(e => `#### ${e.roleOrSection}\n- Advice: ${e.suggestedChanges}\n- Sample Bullet: ${e.sampleBullet}`).join('\n\n')}

### Interview Talking Points for this Role
${roleModifications.interviewTalkingPoints?.map(t => `- ${t}`).join('\n')}

### Role Submission Checklist
${roleModifications.submissionChecklist?.map(c => `[ ] ${c}`).join('\n')}
`;
    copyToClipboard(markdown, 'full-plan');
  };

  return (
    <div className="space-y-6" id="role-modifications-view">
      {/* Target Role & Selection Readiness Hero Banner */}
      <div
        className={`p-6 rounded-3xl border relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border-slate-800 shadow-xl'
            : 'bg-gradient-to-r from-white via-indigo-50/40 to-indigo-100/30 border-slate-200 shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isDark ? likelihoodBadge.color : likelihoodBadge.lightColor}`}>
                {likelihoodBadge.text}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight flex items-center space-x-2">
              <Target className="w-6 h-6 text-cyan-400" />
              <span>Target Role: {roleModifications.targetRole || jobTitle || 'Engineering Role'}</span>
            </h3>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Recruiter-aligned resume modifications to position your experience and maximize interview callbacks for this position.
            </p>
          </div>

          <button
            type="button"
            id="copy-full-plan-btn"
            onClick={handleCopyFullPlan}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border flex items-center space-x-2 transition-all cursor-pointer shadow-sm self-start sm:self-center ${
              isDark
                ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300 hover:bg-cyan-900'
                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copiedSection === 'full-plan' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Blueprint Copied!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Export Action Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Tailored Headline & Summary Rewrite (Copyable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recommended Headline */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Role-Optimized Resume Headline</span>
              </span>
              <button
                type="button"
                id="copy-headline-btn"
                onClick={() => copyToClipboard(roleModifications.headlineSuggestion, 'headline')}
                className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Copy headline"
              >
                {copiedSection === 'headline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-semibold">{copiedSection === 'headline' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className={`p-3.5 rounded-2xl border text-sm font-semibold mt-2 ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
              {roleModifications.headlineSuggestion}
            </div>
          </div>
          <p className={`text-[11px] mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Place this single line directly under your candidate name to immediately pass recruiter scanning filters.
          </p>
        </div>

        {/* Tailored Executive Summary */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Role-Tailored Executive Summary</span>
              </span>
              <button
                type="button"
                id="copy-summary-btn"
                onClick={() => copyToClipboard(roleModifications.summaryRewrite, 'summary')}
                className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Copy summary"
              >
                {copiedSection === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-semibold">{copiedSection === 'summary' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed font-normal mt-2 ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
              "{roleModifications.summaryRewrite}"
            </div>
          </div>
          <p className={`text-[11px] mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Ready-to-paste 2-3 sentence overview highlighting relevant competencies and problem solving.
          </p>
        </div>
      </div>

      {/* 2. Priority Skills to Elevate for this Role */}
      {roleModifications.skillsToElevate && roleModifications.skillsToElevate.length > 0 && (
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold flex items-center space-x-2 text-purple-400">
              <TrendingUp className="w-4 h-4" />
              <span>Priority Skills to Elevate at Top of Skills Section</span>
            </h4>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Place these first for highest ATS keyword density
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {roleModifications.skillsToElevate.map((skill, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                  isDark
                    ? 'bg-purple-950/60 border-purple-800/80 text-purple-200'
                    : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}
              >
                <Sparkles className="w-3 h-3 mr-1.5 text-purple-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Project Reframing & Role Angle Modifications */}
      {roleModifications.projectModifications && roleModifications.projectModifications.length > 0 && (
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h4 className="text-sm font-bold flex items-center space-x-2 text-teal-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Project Framing Modifications for this Role</span>
          </h4>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Shift the narrative of your existing projects to highlight the architectural depth and technical responsibilities expected in this role.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {roleModifications.projectModifications.map((proj, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/70 border-slate-800/90' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-teal-300">{proj.projectName}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                    Project #{idx + 1}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  {/* Current Framing */}
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      Current / Generic Framing
                    </span>
                    <p className="italic">"{proj.currentFocus}"</p>
                  </div>

                  {/* Recommended Role Angle */}
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-teal-950/40 border-teal-800/60 text-teal-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center space-x-1">
                      <ArrowRight className="w-3 h-3" />
                      <span>Recommended Role Angle</span>
                    </span>
                    <p className="font-semibold">{proj.recommendedRoleAngle}</p>
                  </div>
                </div>

                {/* Tech stack to emphasize */}
                {proj.suggestedTechToHighlight && proj.suggestedTechToHighlight.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center space-x-2 text-xs">
                    <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Key Tech to Highlight:</span>
                    <div className="flex flex-wrap gap-1">
                      {proj.suggestedTechToHighlight.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                            isDark ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Experience & Bullet Phrasing Modifications */}
      {roleModifications.experienceModifications && roleModifications.experienceModifications.length > 0 && (
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h4 className="text-sm font-bold flex items-center space-x-2 text-emerald-400 mb-3">
            <Briefcase className="w-4 h-4" />
            <span>Experience Bullet Phrasing Shifts</span>
          </h4>
          <div className="space-y-3">
            {roleModifications.experienceModifications.map((exp, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{exp.roleOrSection}</span>
                </div>
                <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  <strong>Modification Advice:</strong> {exp.suggestedChanges}
                </p>
                <div className={`p-3 rounded-xl border font-medium ${isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'}`}>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                    Sample Role-Aligned Bullet
                  </span>
                  "{exp.sampleBullet}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Interview Talking Points for this Role */}
      {roleModifications.interviewTalkingPoints && roleModifications.interviewTalkingPoints.length > 0 && (
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h4 className="text-sm font-bold flex items-center space-x-2 text-amber-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Interview Prep & Technical Talking Points</span>
          </h4>
          <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Based on your resume and this target role, be ready to confidently address these technical architecture points during interviews:
          </p>
          <div className="space-y-2.5">
            {roleModifications.interviewTalkingPoints.map((point, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-200' : 'bg-amber-50/60 border-amber-200 text-slate-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${
                  isDark ? 'bg-amber-900/80 text-amber-300' : 'bg-amber-200 text-amber-900'
                }`}>
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Interactive Role Submission Checklist */}
      {roleModifications.submissionChecklist && roleModifications.submissionChecklist.length > 0 && (
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h4 className="text-sm font-bold flex items-center space-x-2 text-cyan-400 mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Role Application Pre-Flight Checklist</span>
          </h4>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Check off each task as you update your resume before submitting to the recruiter:
          </p>
          <div className="space-y-2.5">
            {roleModifications.submissionChecklist.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleChecklist(idx)}
                  className={`p-3 rounded-xl border flex items-center space-x-3 text-xs cursor-pointer transition-all ${
                    isChecked
                      ? isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200 line-through opacity-80' : 'bg-emerald-50 border-emerald-200 text-emerald-800 line-through'
                      : isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Square className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  )}
                  <span className="font-medium select-none">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
