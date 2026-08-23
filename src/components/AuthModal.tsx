import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Lock, 
  User, 
  AlertCircle, 
  Compass, 
  Brain, 
  Briefcase,
  PlayCircle,
  KeyRound
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemoUser, AppAuthUser } from '../firebase/auth';

interface AuthModalProps {
  onSuccess: (user: AppAuthUser) => void;
  theme?: 'dark' | 'light';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await signInAsDemoUser('Student User', 'student@university.edu');
      onSuccess(user);
    } catch (err: any) {
      console.error('Demo Sign-In failed:', err);
      setAuthError('Could not start demo session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err?.code, err?.message);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setAuthError('Google sign-in popup was closed without selecting an account.');
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthError('Popup was blocked by your browser. Please allow popups for localhost:3000 to choose your Google account.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your Vercel domain';
        setAuthError(`Domain not authorized: Please add "${currentDomain}" to Authorized Domains in Firebase Console (Authentication > Settings > Authorized Domains).`);
      } else {
        setAuthError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdentifier = usernameOrEmail.trim();
    if (!cleanIdentifier || !password.trim()) {
      setAuthError('Please fill in both your username/email and password.');
      return;
    }
    if (password.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      let user: AppAuthUser;
      if (mode === 'signup') {
        user = await signUpWithEmail(cleanIdentifier, password, displayName.trim() || undefined);
      } else {
        user = await signInWithEmail(cleanIdentifier, password);
      }
      onSuccess(user);
    } catch (err: any) {
      console.error('Auth submit error:', err);
      setAuthError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors ${
      isDark 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-xl shadow-cyan-500/20 mb-3">
            <Zap className="h-7 w-7 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">NovaPath</h1>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Autonomous Opportunity & Career Execution Agent Hub
          </p>
        </div>

        {/* Auth Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/80' 
            : 'bg-white border-slate-200 shadow-xl'
        }`}>
          {/* Mode Switcher Tabs */}
          <div className={`grid grid-cols-2 p-1 rounded-2xl mb-5 border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setMode('login'); setAuthError(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? (isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-900 shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setAuthError(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? (isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-900 shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Username / Email & Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    id="signup-fullname-input"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      isDark 
                        ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Username or Email Address
              </label>
              <div className="relative">
                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  id="auth-username-or-email-input"
                  type="text"
                  required
                  placeholder="e.g. manoj or student@university.edu"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {isLoading 
                  ? 'Authenticating...' 
                  : (mode === 'signup' ? 'Create Account & Sign In' : 'Sign In with Username / Password')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            <span className={`absolute px-3 text-[10px] uppercase font-mono font-bold tracking-wider ${
              isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
            }`}>
              or alternate access
            </span>
          </div>

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-3 transition-all cursor-pointer border mb-3 ${
              isDark 
                ? 'bg-white hover:bg-slate-100 text-slate-900 border-white shadow-md' 
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {/* Google SVG Icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* 1-Click Fast Student Demo Sign-In */}
          <button
            id="instant-demo-signin-btn"
            type="button"
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer border ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant Student Demo Access</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">AI/ML 2nd Yr</span>
          </button>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
            <Compass className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
            <span>Autonomous Agent</span>
          </div>
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
            <Brain className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-400" />
            <span>Cloud Firestore Memory</span>
          </div>
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
            <Briefcase className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
            <span>Transparent Scoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};
