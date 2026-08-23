import React, { useState } from 'react';
import { User, Save, Check, Plus, X, Sparkles, MapPin, GraduationCap, Award } from 'lucide-react';
import { UserProfile, OpportunityType } from '../types';

interface ProfilePageProps {
  user: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  theme?: 'dark' | 'light';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, 
  onUpdateProfile,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<UserProfile>(
    user || {
      id: 'usr_student_001',
      name: 'Student User',
      email: 'student@university.edu',
      degree: 'B.Tech',
      branch: 'Artificial Intelligence & Machine Learning',
      year: 2,
      location: 'Hyderabad',
      skills: ['Python', 'SQL', 'Machine Learning', 'Git', 'Pandas'],
      career_interests: ['AI/ML', 'Data Science'],
      preferred_opportunity_types: ['Internship', 'Research'],
      remote_preference: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = () => {
    if (!newSkill.trim() || formData.skills.includes(newSkill.trim())) return;
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim() || formData.career_interests.includes(newInterest.trim())) return;
    setFormData(prev => ({
      ...prev,
      career_interests: [...prev.career_interests, newInterest.trim()]
    }));
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      career_interests: prev.career_interests.filter(i => i !== interest)
    }));
  };

  const toggleType = (type: OpportunityType) => {
    setFormData(prev => {
      const exists = prev.preferred_opportunity_types.includes(type);
      return {
        ...prev,
        preferred_opportunity_types: exists
          ? prev.preferred_opportunity_types.filter(t => t !== type)
          : [...prev.preferred_opportunity_types, type]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const allTypes: OpportunityType[] = ['Internship', 'Research', 'Full-time', 'Fellowship', 'Apprenticeship'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
            isDark 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Student Profile & Skill Inventory
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Persistent academic profile used by NovaPath to evaluate eligibility and compute transparent match scores.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border ${
            isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <Check className="h-4 w-4" />
            <span>Profile Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Academic Details */}
        <div className={`rounded-3xl p-6 sm:p-7 border space-y-5 transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100' : 'bg-white border-slate-200/90 shadow-xl text-slate-900'
        }`}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center space-x-2">
            <User className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span>Academic Background</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none border font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none border font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Degree Program
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.Tech / BE"
                className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none border font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Branch / Specialization
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g. Artificial Intelligence & Machine Learning"
                className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none border font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Current Academic Year
              </label>
              <select
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none border font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
                }`}
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Pre-final)</option>
                <option value={4}>4th Year (Final Year)</option>
              </select>
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Base Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Hyderabad"
                className={`w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none border font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Technical Skills Inventory */}
        <div className={`rounded-3xl p-6 sm:p-7 border space-y-5 transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100' : 'bg-white border-slate-200/90 shadow-xl text-slate-900'
        }`}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center space-x-2">
            <Award className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span>Technical Skills</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
                  isDark 
                    ? 'bg-slate-950 text-cyan-300 border-cyan-800/50' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              placeholder="Add skill (e.g. PyTorch, React, Docker)"
              className={`flex-1 rounded-xl p-3 text-xs focus:ring-2 focus:outline-none border font-medium ${
                isDark 
                  ? 'bg-slate-950 border-slate-700 text-white focus:ring-cyan-500 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-indigo-500 placeholder-slate-400'
              }`}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Career Preferences */}
        <div className={`rounded-3xl p-6 sm:p-7 border space-y-5 transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100' : 'bg-white border-slate-200/90 shadow-xl text-slate-900'
        }`}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span>Opportunity Preferences</span>
          </h2>

          <div>
            <label className={`text-xs font-semibold block mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Preferred Opportunity Types
            </label>
            <div className="flex flex-wrap gap-2">
              {allTypes.map(type => {
                const selected = formData.preferred_opportunity_types.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selected
                        ? isDark
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-sm'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : isDark
                          ? 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type} {selected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.remote_preference}
                onChange={e => setFormData({ ...formData, remote_preference: e.target.checked })}
                className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
              />
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Prefer Remote or Hybrid Internship Opportunities
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-7 py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg cursor-pointer disabled:opacity-50 transition-all ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 shadow-indigo-500/25'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

