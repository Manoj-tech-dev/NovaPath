import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { 
  UserProfile, 
  Memory, 
  Application, 
  AgentRun, 
  EvaluatedOpportunity, 
  MemoryType, 
  MemoryImportance 
} from './types';
import { Navbar, NavTabType } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { MemoryPage } from './pages/MemoryPage';
import { AgentNovaPage } from './pages/AgentNovaPage';
import { CareerPathPage } from './pages/CareerPathPage';
import { AtsScannerView } from './components/ats/AtsScannerView';
import { AgentNovaFloatingWidget } from './components/AgentNovaFloatingWidget';
import { AuthModal } from './components/AuthModal';
import { subscribeToAuthState, signOut, AppAuthUser } from './firebase/auth';
import { getUserProfile, updateUserProfile } from './services/profileService';
import { getMemories, saveMemory, deleteMemory as deleteMemoryFirestore } from './services/memoryService';
import { getSavedOpportunities, saveOpportunity, updateSavedOpportunityStatus, removeSavedOpportunity } from './services/opportunityService';
import { saveAgentRun, getAgentRuns } from './services/agentRunService';

export function App() {
  const [authUser, setAuthUser] = useState<AppAuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [applications, setApplications] = useState<(Application & { opportunity?: any })[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [agentHistory, setAgentHistory] = useState<AgentRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [targetCareerOpportunity, setTargetCareerOpportunity] = useState<any | null>(null);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentAuthUser) => {
      setAuthUser(currentAuthUser);
      if (currentAuthUser) {
        await loadUserData(currentAuthUser.uid, currentAuthUser.displayName || undefined, currentAuthUser.email || undefined);
      } else {
        setUser(null);
        setMemories([]);
        setApplications([]);
        setActiveRun(null);
        setAgentHistory([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Firestore Data for Authenticated User
  const loadUserData = async (userId: string, defaultName?: string, defaultEmail?: string) => {
    try {
      const [profileData, memoryData, savedData, historyData] = await Promise.all([
        getUserProfile(userId, defaultName, defaultEmail),
        getMemories(userId),
        getSavedOpportunities(userId),
        getAgentRuns(userId)
      ]);

      setUser(profileData);
      setMemories(memoryData);
      setApplications(savedData);
      setAgentHistory(historyData);

      if (historyData.length > 0 && !activeRun) {
        setActiveRun(historyData[0]);
      }
    } catch (e) {
      console.error('Error loading Firestore user data:', e);
    }
  };

  // Run the agent workflow
  const handlePlanPath = async (goal: string) => {
    if (!goal.trim() || isLoading || !user) return;
    setIsLoading(true);
    try {
      const result = await api.runAgent(user.id, goal);
      setActiveRun(result);
      
      // Save completed agent run to Firestore
      await saveAgentRun(user.id, result);

      // Refresh memories and history from Firestore after agent execution
      const [updatedMemories, updatedHistory] = await Promise.all([
        getMemories(user.id),
        getAgentRuns(user.id)
      ]);
      setMemories(updatedMemories);
      setAgentHistory(updatedHistory);
      
      showNotification(`Agent execution completed: Found ${result.opportunities?.length || 0} matching opportunities.`);
    } catch (e: any) {
      console.error('Agent execution error:', e);
      showNotification(`Agent error: ${e.message || 'Workflow execution error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Save / Bookmark Opportunity to Cloud Firestore
  const handleToggleSave = async (opp: EvaluatedOpportunity) => {
    if (!user) return;
    const isSaved = applications.some(a => a.opportunity_id === opp.id);

    try {
      if (isSaved) {
        await removeSavedOpportunity(user.id, opp.id);
        setApplications(prev => prev.filter(a => a.opportunity_id !== opp.id));
        showNotification(`Removed "${opp.title}" from saved opportunities.`);
      } else {
        const newApp = await saveOpportunity(user.id, opp, 'SAVED');
        setApplications(prev => [newApp, ...prev.filter(a => a.opportunity_id !== opp.id)]);
        showNotification(`Saved "${opp.title}" to My Opportunities!`);
      }
    } catch (e: any) {
      console.error('Toggle save error:', e);
      showNotification('Could not update saved status.');
    }
  };

  // Update Profile in Cloud Firestore
  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const updated = await updateUserProfile(user.id, updatedData);
      setUser(updated);
      showNotification('Student profile updated in Firestore.');
    } catch (e: any) {
      console.error('Profile update error:', e);
      showNotification('Failed to update profile.');
    }
  };

  // Add Memory to Cloud Firestore
  const handleAddMemory = async (memData: { memory_type: MemoryType; memory_text: string; importance: MemoryImportance; category: string }) => {
    if (!user) return;
    try {
      const newMem = await saveMemory(user.id, memData);
      setMemories(prev => [newMem, ...prev]);
      showNotification('New preference saved to persistent memory.');
    } catch (e: any) {
      console.error('Save memory error:', e);
      showNotification('Failed to save memory.');
    }
  };

  // Delete Memory from Cloud Firestore
  const handleDeleteMemory = async (id: string) => {
    if (!user) return;
    try {
      await deleteMemoryFirestore(user.id, id);
      setMemories(prev => prev.filter(m => m.id !== id));
      showNotification('Memory node deleted.');
    } catch (e: any) {
      console.error('Delete memory error:', e);
    }
  };

  // Update Application Stage in Cloud Firestore
  const handleUpdateApplicationStatus = async (id: string, opportunityId: string, status: any, notes?: string) => {
    if (!user) return;
    try {
      await updateSavedOpportunityStatus(user.id, opportunityId, status, notes);
      setApplications(prev => prev.map(a => a.opportunity_id === opportunityId ? { ...a, status, notes: notes ?? a.notes } : a));
      showNotification(`Updated status to ${status}.`);
    } catch (e: any) {
      console.error('Update status error:', e);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!user) return;
    try {
      await removeSavedOpportunity(user.id, id);
      setApplications(prev => prev.filter(a => a.opportunity_id !== id && a.id !== id));
      showNotification('Opportunity removed from tracker.');
    } catch (e: any) {
      console.error('Delete application error:', e);
    }
  };

  const handleAddSkillToProfile = async (skill: string) => {
    if (!user) return;
    if (user.skills.includes(skill)) return;

    const updatedSkills = [...user.skills, skill];
    await handleUpdateProfile({ skills: updatedSkills });
    showNotification(`Skill "${skill}" successfully added to your profile!`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification('Signed out successfully.');
    } catch (e: any) {
      console.error('Sign out error:', e);
    }
  };

  const savedOpportunityIds = new Set(applications.map(a => a.opportunity_id));
  const isDark = theme === 'dark';

  // Loading Screen while authenticating
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center animate-pulse shadow-xl shadow-cyan-500/20">
            <span className="text-white text-xl font-bold">N</span>
          </div>
          <div className="text-xs font-mono font-semibold text-slate-400">
            Initializing NovaPath Agent Hub...
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Screen: Display AuthModal before dashboard access
  if (!authUser) {
    return (
      <AuthModal
        theme={theme}
        onSuccess={async (signedInUser) => {
          setAuthUser(signedInUser);
          await loadUserData(signedInUser.uid, signedInUser.displayName || undefined, signedInUser.email || undefined);
          showNotification(`Welcome to NovaPath, ${signedInUser.displayName || 'Student'}!`);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDark 
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200' 
        : 'bg-slate-50 text-slate-900 selection:bg-indigo-500/30 selection:text-indigo-900'
    }`}>
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 border animate-bounce ${
          isDark 
            ? 'bg-slate-900 border-cyan-500/50 text-cyan-300 shadow-cyan-500/10' 
            : 'bg-white border-indigo-200 text-indigo-700 shadow-indigo-500/15'
        }`}>
          <span>✨</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        savedCount={applications.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Routing */}
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            activeRun={activeRun}
            isLoading={isLoading}
            onPlanPath={handlePlanPath}
            savedOpportunityIds={savedOpportunityIds}
            onToggleSave={handleToggleSave}
            onBuildCareerPath={(opp) => {
              setTargetCareerOpportunity(opp);
              setActiveTab('career-path');
            }}
            memories={memories}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAddSkillToProfile={handleAddSkillToProfile}
            theme={theme}
          />
        )}

        {activeTab === 'career-path' && (
          <CareerPathPage
            user={user}
            theme={theme}
            savedOpportunities={applications.map(a => a.opportunity).filter(Boolean)}
            initialTargetOpportunity={targetCareerOpportunity}
            onOpenNovaChat={(contextMsg) => {
              setActiveTab('chat');
            }}
            onNavigateToATS={() => setActiveTab('ats')}
          />
        )}

        {activeTab === 'chat' && (
          <AgentNovaPage
            user={user}
            memories={memories}
            onNavigateToDashboardWithGoal={(goal) => {
              setActiveTab('dashboard');
              handlePlanPath(goal);
            }}
            theme={theme}
          />
        )}

        {activeTab === 'ats' && (
          <AtsScannerView
            user={user}
            theme={theme}
            onNavigateToChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateProfile={handleUpdateProfile}
            theme={theme}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesPage
            applications={applications}
            user={user}
            onUpdateStatus={handleUpdateApplicationStatus}
            onDeleteApplication={handleDeleteApplication}
            onToggleSave={handleToggleSave}
            onAddSkillToProfile={handleAddSkillToProfile}
            onNavigateToCareerPath={(opp) => {
              setTargetCareerOpportunity(opp);
              setActiveTab('career-path');
            }}
            theme={theme}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryPage
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            agentRuns={agentHistory}
            theme={theme}
          />
        )}
      </main>

      {/* Floating Agent Nova Quick Chat Widget (active on non-chat tabs) */}
      {activeTab !== 'chat' && (
        <AgentNovaFloatingWidget
          user={user}
          memories={memories}
          onExpandToFullChat={() => setActiveTab('chat')}
          theme={theme}
        />
      )}

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>NovaPath</strong> — Built for <strong>LaunchPadX 2026</strong> (Track 01: The Agent Hub) by <strong>NovaForge</strong>
          </span>
          <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Firebase Auth • Cloud Firestore • Gemini AI Grounding
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
