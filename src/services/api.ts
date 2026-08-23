import { 
  UserProfile, 
  Memory, 
  Opportunity, 
  Application, 
  AgentRun 
} from '../types';

export const API_BASE = '/api';

export const api = {
  // Profile
  getProfile: async (userId = 'usr_rahul_001'): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/profile/${userId}`);
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Memory
  getMemories: async (userId = 'usr_rahul_001'): Promise<Memory[]> => {
    const res = await fetch(`${API_BASE}/memory/${userId}`);
    if (!res.ok) throw new Error('Failed to load memories');
    return res.json();
  },

  addMemory: async (memory: Partial<Memory> & { user_id: string; memory_text: string }): Promise<Memory> => {
    const res = await fetch(`${API_BASE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory),
    });
    if (!res.ok) throw new Error('Failed to add memory');
    return res.json();
  },

  updateMemory: async (id: string, data: Partial<Memory>): Promise<Memory> => {
    const res = await fetch(`${API_BASE}/memory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update memory');
    return res.json();
  },

  deleteMemory: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/memory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete memory');
    const data = await res.json();
    return data.success;
  },

  // Opportunities
  getOpportunities: async (): Promise<Opportunity[]> => {
    const res = await fetch(`${API_BASE}/opportunities`);
    if (!res.ok) throw new Error('Failed to load opportunities');
    return res.json();
  },

  // Applications
  getApplications: async (userId = 'usr_rahul_001'): Promise<(Application & { opportunity?: Opportunity })[]> => {
    const res = await fetch(`${API_BASE}/applications/${userId}`);
    if (!res.ok) throw new Error('Failed to load applications');
    return res.json();
  },

  saveApplication: async (userId: string, opportunityId: string, status: Application['status'] = 'SAVED', notes?: string): Promise<Application> => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, opportunity_id: opportunityId, status, notes }),
    });
    if (!res.ok) throw new Error('Failed to save opportunity');
    return res.json();
  },

  deleteApplication: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/applications/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove application');
    const data = await res.json();
    return data.success;
  },

  // Agent
  runAgent: async (userId = 'usr_rahul_001', goal: string): Promise<AgentRun> => {
    const res = await fetch(`${API_BASE}/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, goal }),
    });
    if (!res.ok) throw new Error('Agent execution failed');
    return res.json();
  },

  getAgentRun: async (runId: string): Promise<AgentRun> => {
    const res = await fetch(`${API_BASE}/agent/run/${runId}`);
    if (!res.ok) throw new Error('Failed to load agent run');
    return res.json();
  },

  getAgentHistory: async (userId = 'usr_rahul_001'): Promise<AgentRun[]> => {
    const res = await fetch(`${API_BASE}/agent/history/${userId}`);
    if (!res.ok) throw new Error('Failed to load agent history');
    return res.json();
  },

  // Demo Presets
  setDemoPreset: async (preset: 'session-1' | 'session-2' | 'reset') => {
    const res = await fetch(`${API_BASE}/demo/preset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset }),
    });
    if (!res.ok) throw new Error('Failed to set demo preset');
    return res.json();
  },

  // Agent Nova AI Chatbot
  chatWithAgentNova: async (
    userId = 'usr_rahul_001',
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{ reply: string; suggestedQuestions: string[]; context?: any }> => {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, messages }),
    });
    if (!res.ok) throw new Error('Agent Nova chat request failed');
    return res.json();
  },

  // Web-grounded Opportunity & Internship Search based on Skills
  searchOpportunities: async (params: {
    user_id?: string;
    skills?: string[];
    query?: string;
    location?: string;
    type?: string;
    remote?: boolean;
  }): Promise<{
    total: number;
    searchedSkills: string[];
    results: Array<Opportunity & {
      matchScore: number;
      matchingSkills: string[];
      missingSkills: string[];
      fitReason: string;
      isSaved?: boolean;
    }>;
  }> => {
    const res = await fetch(`${API_BASE}/opportunities/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to search live opportunities');
    return res.json();
  },

  // Daily Tech & AI Internship Trends (Google Search Grounded)
  getDailyTrends: async (userId: string = 'usr_rahul_001'): Promise<{
    timestamp: string;
    groundedWithSearch: boolean;
    trends: Array<{
      id: string;
      title: string;
      summary: string;
      category: 'AI & Machine Learning' | 'Software Engineering' | 'Cloud & DevOps' | 'Hiring & Internships' | 'Open Source';
      growthSignal?: string;
      keySkills: string[];
      studentTakeaway: string;
      actionableProjectIdea: string;
      sources?: Array<{ title: string; url: string }>;
      publishedDate?: string;
    }>;
    marketSummary: string;
  }> => {
    const res = await fetch(`${API_BASE}/trends/daily?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch daily tech trends');
    return res.json();
  },
};
