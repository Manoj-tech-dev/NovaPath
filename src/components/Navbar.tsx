import React from 'react';
import { 
  Compass, 
  User, 
  Briefcase, 
  Brain, 
  Bot,
  Sparkles,
  Sun,
  Moon,
  Zap,
  HelpCircle,
  LogOut,
  FileCheck,
  Route
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTabType = 'dashboard' | 'career-path' | 'profile' | 'opportunities' | 'chat' | 'memory' | 'ats';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  user: UserProfile | null;
  savedCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenGuide?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  savedCount,
  theme,
  onToggleTheme,
  onOpenGuide,
  onSignOut
}) => {
  const navItems: Array<{
    id: NavTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    isNova?: boolean;
    isNew?: boolean;
  }> = [
    { id: 'dashboard', label: 'Agent Hub', icon: Compass },
    { id: 'career-path', label: 'Career Path', icon: Route, isNew: true },
    { id: 'chat', label: 'Agent Nova', icon: Bot, isNova: true },
    { id: 'ats', label: 'ATS Scanner', icon: FileCheck },
    { id: 'profile', label: 'Profile & Skills', icon: User },
    { 
      id: 'opportunities', 
      label: 'Opportunities', 
      icon: Briefcase,
      badge: savedCount > 0 ? savedCount : undefined 
    },
    { id: 'memory', label: 'Memory Bank', icon: Brain },
  ];

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
      isDark 
        ? 'bg-slate-950/90 border-slate-800/80 text-slate-100' 
        : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div 
            id="brand-logo-btn"
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              isDark 
                ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40' 
                : 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40'
            }`}>
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight">NovaPath</span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Opportunity Execution Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${
                    isActive 
                      ? isDark ? 'text-cyan-400' : 'text-indigo-600'
                      : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.isNova && (
                    <span className={`hidden lg:inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? isDark ? 'bg-cyan-900/60 text-cyan-300' : 'bg-indigo-200 text-indigo-800'
                        : isDark ? 'bg-indigo-950/80 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      AI Coach
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className={`ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isDark 
                        ? 'bg-cyan-500 text-slate-950' 
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Guide, Theme Switcher & User Profile Pill */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Guide Button */}
            {onOpenGuide && (
              <button
                id="open-guide-nav-btn"
                onClick={onOpenGuide}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/70 hover:border-cyan-500'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
                title="Open Agent Guide & Instructions"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Guide</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Student Profile Quick Badge */}
            {user && (
              <div 
                id="user-profile-nav-btn"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                  isDark 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold leading-tight truncate max-w-[110px]">{user.name}</p>
                  <p className={`text-[10px] font-medium leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Yr {user.year} • {user.location}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            {onSignOut && (
              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/30'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                }`}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

