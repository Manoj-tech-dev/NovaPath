import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Memory, 
  Opportunity, 
  Application, 
  AgentRun, 
  AgentStep,
  AtsReport,
  ResumeMetadata,
  CareerPath
} from '../src/types';

interface DBData {
  users: UserProfile[];
  memories: Memory[];
  opportunities: Opportunity[];
  applications: Application[];
  agent_runs: AgentRun[];
  agent_steps: AgentStep[];
  ats_reports: AtsReport[];
  resumes: ResumeMetadata[];
  career_paths: CareerPath[];
}

const DATA_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'data') 
  : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial user per hackathon requirements
export const DEFAULT_USER: UserProfile = {
  id: 'usr_rahul_001',
  name: 'Student User',
  email: 'student@example.edu.in',
  degree: 'B.Tech',
  branch: 'Artificial Intelligence & Machine Learning',
  year: 2,
  location: 'Hyderabad',
  skills: ['Python', 'SQL', 'Machine Learning', 'Git', 'Pandas'],
  career_interests: ['AI/ML', 'Data Science', 'Deep Learning Research'],
  preferred_opportunity_types: ['Internship', 'Research'],
  remote_preference: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Initial curated opportunities
export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_aiml_hyd_01',
    title: 'AI/ML Research Intern',
    organization: 'CognitiveScale Labs India',
    type: 'Internship',
    location: 'Hyderabad',
    remote: true,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Docker'],
    eligibility: 'B.Tech / M.Tech 2nd, 3rd, or 4th year in CSE/AI/Data Science',
    deadline: '2026-09-30',
    description: 'Work on productionizing computer vision & tabular ML pipelines for enterprise decision intelligence. Mentored by senior research scientists.',
    source: 'CognitiveScale Careers Hub',
    url: 'https://cognitivescale.com/careers/india-interns',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹35,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_aiml_hyd_02',
    title: 'Data Science & Analytics Intern',
    organization: 'Microsoft R&D India',
    type: 'Internship',
    location: 'Hyderabad',
    remote: false,
    skills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'PowerBI', 'Data Visualization'],
    eligibility: 'Pre-final / 2nd-3rd year engineering students with strong analytical skills',
    deadline: '2026-10-15',
    description: 'Analyze telemetry and user behavior across Azure Cloud products. Build predictive models and automated dashboards for product leaders.',
    source: 'Microsoft University Recruiting India',
    url: 'https://careers.microsoft.com/students/india',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹50,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_aiml_hyd_03',
    title: 'Machine Learning Engineering Intern',
    organization: 'Swiggy Tech Labs',
    type: 'Internship',
    location: 'Hyderabad',
    remote: true,
    skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'FastAPI', 'Algorithms'],
    eligibility: 'Engineering undergraduates (2nd, 3rd, or 4th year) with proven Python proficiency',
    deadline: '2026-09-20',
    description: 'Build real-time delivery routing optimization, recommendation ranking engines, and demand prediction systems handling millions of orders.',
    source: 'Swiggy Careers Portal',
    url: 'https://bytes.swiggy.com/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹40,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_aiml_hyd_04',
    title: 'Applied Deep Learning Fellow',
    organization: 'IIIT Hyderabad — Center for Visual Information Tech (CVIT)',
    type: 'Research',
    location: 'Hyderabad',
    remote: true,
    skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Linear Algebra'],
    eligibility: 'Undergraduate students (1st, 2nd, 3rd year) with strong mathematical foundation',
    deadline: '2026-10-01',
    description: 'Conduct funded academic research under faculty guidance on multi-modal foundation models and low-resource Indic language NLP.',
    source: 'IIIT-H CVIT Summer/Autumn Research Internship',
    url: 'https://cvit.iiit.ac.in/admissions/internships',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹25,000 / month + Publication Grant',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_aiml_blr_05',
    title: 'Junior AI Engineer (Generative AI)',
    organization: 'Sarvam AI',
    type: 'Internship',
    location: 'Bengaluru',
    remote: true,
    skills: ['Python', 'Machine Learning', 'LLMs', 'Transformers', 'FastAPI'],
    eligibility: 'B.Tech/BE in CS/IT/AI (2nd-4th year) with experience in GenAI libraries',
    deadline: '2026-09-25',
    description: 'Contribute to state-of-the-art voice and multilingual LLMs designed specifically for Indian languages.',
    source: 'Sarvam AI Careers',
    url: 'https://sarvam.ai/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹45,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_web_hyd_06',
    title: 'Full Stack Web Development Intern',
    organization: 'Darwinbox',
    type: 'Internship',
    location: 'Hyderabad',
    remote: false,
    skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'REST APIs'],
    eligibility: '2nd/3rd/4th year engineering students',
    deadline: '2026-10-10',
    description: 'Develop enterprise-grade cloud HRMS features, responsive web components, and optimized microservices.',
    source: 'Darwinbox Careers',
    url: 'https://darwinbox.com/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹30,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_aiml_hyd_07',
    title: 'Computer Vision & Robotics Intern',
    organization: 'T-Hub Innovation Center',
    type: 'Internship',
    location: 'Hyderabad',
    remote: false,
    skills: ['Python', 'OpenCV', 'Machine Learning', 'ROS', 'C++'],
    eligibility: 'Students pursuing B.Tech in Robotics, AI, CSE, or ECE',
    deadline: '2026-11-01',
    description: 'Work with emerging deep-tech startups within Asia’s largest innovation hub on autonomous drones and industrial robotics.',
    source: 'T-Hub Ecosystem Talent Portal',
    url: 'https://t-hub.co/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹28,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_aiml_hyd_08',
    title: 'NLP & Voice Intelligence Intern',
    organization: 'Verloop.io',
    type: 'Internship',
    location: 'Hyderabad',
    remote: true,
    skills: ['Python', 'Machine Learning', 'NLP', 'NLTK', 'HuggingFace', 'SQL'],
    eligibility: 'Undergrads in CSE / AI / ECE with knowledge of conversational AI',
    deadline: '2026-09-18',
    description: 'Build intent classification and dialogue management modules for conversational automation engines.',
    source: 'Verloop.io Careers',
    url: 'https://verloop.io/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹32,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_sde_blr_09',
    title: 'Software Development Engineer (Graduate / Entry-Level)',
    organization: 'Razorpay',
    type: 'Full-time',
    location: 'Bengaluru',
    remote: true,
    skills: ['Go', 'Python', 'SQL', 'System Design', 'Microservices', 'Git'],
    eligibility: 'Graduating engineering students (2025/2026 batch) in CS/IT/ECE',
    deadline: '2026-10-30',
    description: 'Architect low-latency payment processing pipelines handling billions in monthly transaction volumes.',
    source: 'Razorpay Early Careers',
    url: 'https://razorpay.com/jobs',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹18 - 24 LPA',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_frontend_hyd_10',
    title: 'Frontend Engineer (React / TypeScript)',
    organization: 'Postman India',
    type: 'Full-time',
    location: 'Hyderabad',
    remote: true,
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'REST APIs', 'Performance Optimization'],
    eligibility: 'Recent graduates & final-year students with modern frontend portfolio',
    deadline: '2026-10-15',
    description: 'Build high-performance collaboration tools, API visualizers, and responsive client applications used by 30M+ developers.',
    source: 'Postman Careers Hub',
    url: 'https://www.postman.com/company/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹16 - 22 LPA',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_backend_hyd_11',
    title: 'Backend Engineering Intern (Java / Spring Boot)',
    organization: 'CRED',
    type: 'Internship',
    location: 'Bengaluru',
    remote: true,
    skills: ['Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'Redis', 'Kafka'],
    eligibility: 'Pre-final & final year engineering undergraduates with strong OOP & DB concepts',
    deadline: '2026-09-28',
    description: 'Build fault-tolerant distributed services for credit card statement reconciliation and rewards distribution.',
    source: 'CRED Careers',
    url: 'https://careers.cred.club',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹60,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_cloud_hyd_12',
    title: 'Cloud Platform & DevOps Intern',
    organization: 'Amazon Web Services (AWS) India',
    type: 'Internship',
    location: 'Hyderabad',
    remote: false,
    skills: ['Python', 'Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    eligibility: '2nd / 3rd / 4th year B.Tech students in CSE/IT/ECE',
    deadline: '2026-10-20',
    description: 'Automate multi-region cloud infrastructure, container orchestration, and observability monitoring for AWS core services.',
    source: 'Amazon University Talent',
    url: 'https://amazon.jobs/en/teams/university-talent',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹80,000 / month',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_data_hyd_13',
    title: 'Data Analyst & BI Specialist',
    organization: 'Zomato',
    type: 'Full-time',
    location: 'Gurugram',
    remote: true,
    skills: ['SQL', 'Python', 'Pandas', 'Tableau', 'Statistics', 'A/B Testing'],
    eligibility: 'Final year engineering or fresh graduates with analytical mindset',
    deadline: '2026-10-05',
    description: 'Analyze hyper-local customer ordering trends, delivery partner efficiency, and pricing optimization experiments.',
    source: 'Zomato Tech Careers',
    url: 'https://zomato.com/careers',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹12 - 16 LPA',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_google_hyd_14',
    title: 'Software Engineering Intern (Summer 2026)',
    organization: 'Google India',
    type: 'Internship',
    location: 'Hyderabad',
    remote: false,
    skills: ['C++', 'Python', 'Java', 'Data Structures', 'Algorithms', 'Distributed Systems'],
    eligibility: 'Currently enrolled in a Bachelor’s or Master’s degree in Computer Science or related technical field',
    deadline: '2026-11-15',
    description: 'Solve real engineering scalability problems across Google Search, Android, Cloud, and Geo teams alongside senior staff engineers.',
    source: 'Google Students Careers Portal',
    url: 'https://careers.google.com/students',
    source_type: 'CURATED_DATASET',
    stipend_or_salary: '₹1,10,000 / month',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem_01',
    user_id: 'usr_rahul_001',
    memory_type: 'PROFILE',
    memory_text: 'Student enrolled in B.Tech 2nd Year (AI & Machine Learning) with strong foundation in Python and SQL.',
    importance: 'HIGH',
    category: 'Academic Background',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem_02',
    user_id: 'usr_rahul_001',
    memory_type: 'PREFERENCE',
    memory_text: 'Prefers Hyderabad location and explicitly values remote or hybrid internship opportunities.',
    importance: 'HIGH',
    category: 'Location & Work Style',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem_03',
    user_id: 'usr_rahul_001',
    memory_type: 'PREFERENCE',
    memory_text: 'Targeting AI/ML internship roles that involve applied machine learning or data science pipelines.',
    importance: 'HIGH',
    category: 'Career Goals',
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

class DatabaseStore {
  private data: DBData;

  constructor() {
    this.data = {
      users: [],
      memories: [],
      opportunities: [],
      applications: [],
      agent_runs: [],
      agent_steps: [],
      ats_reports: [],
      resumes: [],
      career_paths: []
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.ats_reports) this.data.ats_reports = [];
        if (!this.data.resumes) this.data.resumes = [];
        if (!this.data.career_paths) this.data.career_paths = [];
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Database initialization warning, resetting to defaults:', e);
      this.resetToDefaults();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }

  public resetToDefaults() {
    this.data = {
      users: [JSON.parse(JSON.stringify(DEFAULT_USER))],
      memories: JSON.parse(JSON.stringify(INITIAL_MEMORIES)),
      opportunities: JSON.parse(JSON.stringify(INITIAL_OPPORTUNITIES)),
      applications: [
        {
          id: 'app_seed_01',
          user_id: 'usr_rahul_001',
          opportunity_id: 'opp_aiml_hyd_01',
          status: 'SAVED',
          notes: 'Saved during initial discovery exploration.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      agent_runs: [],
      agent_steps: [],
      ats_reports: [],
      resumes: [],
      career_paths: []
    };
    this.persist();
  }

  // --- Users ---
  public getUser(id: string): UserProfile | undefined {
    let user = this.data.users.find(u => u.id === id);
    if (!user && id === 'usr_rahul_001') {
      user = JSON.parse(JSON.stringify(DEFAULT_USER));
      this.data.users.push(user!);
      this.persist();
    }
    return user;
  }

  public updateUser(id: string, updates: Partial<UserProfile>): UserProfile {
    const idx = this.data.users.findIndex(u => u.id === id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      this.data.users[idx] = {
        ...this.data.users[idx],
        ...updates,
        updated_at: now
      };
      this.persist();
      return this.data.users[idx];
    } else {
      const newUser: UserProfile = {
        ...DEFAULT_USER,
        ...updates,
        id,
        updated_at: now,
        created_at: now
      };
      this.data.users.push(newUser);
      this.persist();
      return newUser;
    }
  }

  // --- Memories ---
  public getMemories(userId: string): Memory[] {
    return this.data.memories.filter(m => m.user_id === userId);
  }

  public addMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Memory {
    const newMemory: Memory = {
      ...memory,
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.memories.unshift(newMemory);
    this.persist();
    return newMemory;
  }

  public updateMemory(id: string, updates: Partial<Memory>): Memory | null {
    const idx = this.data.memories.findIndex(m => m.id === id);
    if (idx >= 0) {
      this.data.memories[idx] = {
        ...this.data.memories[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.persist();
      return this.data.memories[idx];
    }
    return null;
  }

  public deleteMemory(id: string): boolean {
    const initialLen = this.data.memories.length;
    this.data.memories = this.data.memories.filter(m => m.id !== id);
    if (this.data.memories.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Opportunities ---
  public getOpportunities(): Opportunity[] {
    return this.data.opportunities;
  }

  public getOpportunityById(id: string): Opportunity | undefined {
    return this.data.opportunities.find(o => o.id === id);
  }

  public addOpportunity(opportunity: Omit<Opportunity, 'id' | 'created_at'>): Opportunity {
    const newOpp: Opportunity = {
      ...opportunity,
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString()
    };
    this.data.opportunities.unshift(newOpp);
    this.persist();
    return newOpp;
  }

  public bulkAddOpportunities(opps: Omit<Opportunity, 'id' | 'created_at'>[]): Opportunity[] {
    const added: Opportunity[] = [];
    for (const opp of opps) {
      // Check if duplicate title + organization exists
      const exists = this.data.opportunities.some(
        o => o.title.toLowerCase() === opp.title.toLowerCase() && 
             o.organization.toLowerCase() === opp.organization.toLowerCase()
      );
      if (!exists) {
        const newOpp: Opportunity = {
          ...opp,
          id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          created_at: new Date().toISOString()
        };
        this.data.opportunities.unshift(newOpp);
        added.push(newOpp);
      }
    }
    if (added.length > 0) {
      this.persist();
    }
    return added;
  }

  // --- Applications / Saved ---
  public getApplications(userId: string): (Application & { opportunity?: Opportunity })[] {
    const apps = this.data.applications.filter(a => a.user_id === userId);
    return apps.map(a => ({
      ...a,
      opportunity: this.data.opportunities.find(o => o.id === a.opportunity_id)
    }));
  }

  public saveOrUpdateApplication(userId: string, opportunityId: string, status: Application['status'] = 'SAVED', notes?: string): Application {
    const existing = this.data.applications.find(a => a.user_id === userId && a.opportunity_id === opportunityId);
    const now = new Date().toISOString();
    if (existing) {
      existing.status = status;
      if (notes !== undefined) existing.notes = notes;
      existing.updated_at = now;
      this.persist();
      return existing;
    }
    const newApp: Application = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId,
      opportunity_id: opportunityId,
      status,
      notes: notes || '',
      created_at: now,
      updated_at: now
    };
    this.data.applications.push(newApp);
    this.persist();
    return newApp;
  }

  public deleteApplication(id: string): boolean {
    const initial = this.data.applications.length;
    this.data.applications = this.data.applications.filter(a => a.id !== id);
    if (this.data.applications.length !== initial) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Agent Runs & Steps ---
  public createAgentRun(userId: string, goal: string): AgentRun {
    const run: AgentRun = {
      id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId,
      goal,
      status: 'RUNNING',
      retrieved_preferences: [],
      created_at: new Date().toISOString(),
      steps: []
    };
    this.data.agent_runs.unshift(run);
    this.persist();
    return run;
  }

  public updateAgentRun(id: string, updates: Partial<AgentRun>): AgentRun | null {
    const idx = this.data.agent_runs.findIndex(r => r.id === id);
    if (idx >= 0) {
      this.data.agent_runs[idx] = {
        ...this.data.agent_runs[idx],
        ...updates
      };
      this.persist();
      return this.data.agent_runs[idx];
    }
    return null;
  }

  public getAgentRun(id: string): AgentRun | undefined {
    const run = this.data.agent_runs.find(r => r.id === id);
    if (run) {
      run.steps = this.data.agent_steps.filter(s => s.agent_run_id === id).sort((a, b) => a.step_number - b.step_number);
    }
    return run;
  }

  public getAgentRunsForUser(userId: string): AgentRun[] {
    return this.data.agent_runs.filter(r => r.user_id === userId);
  }

  public addAgentStep(step: Omit<AgentStep, 'id' | 'created_at'>): AgentStep {
    const newStep: AgentStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString()
    };
    this.data.agent_steps.push(newStep);
    this.persist();
    return newStep;
  }

  public updateAgentStep(id: string, updates: Partial<AgentStep>): AgentStep | null {
    const idx = this.data.agent_steps.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.data.agent_steps[idx] = {
        ...this.data.agent_steps[idx],
        ...updates
      };
      this.persist();
      return this.data.agent_steps[idx];
    }
    return null;
  }

  // --- ATS Scanner & Resumes ---
  public saveResumeMetadata(metadata: ResumeMetadata): ResumeMetadata {
    if (!this.data.resumes) this.data.resumes = [];
    const idx = this.data.resumes.findIndex(r => r.id === metadata.id || (r.userId === metadata.userId && r.resumeId === metadata.resumeId));
    if (idx >= 0) {
      this.data.resumes[idx] = { ...this.data.resumes[idx], ...metadata };
    } else {
      this.data.resumes.unshift(metadata);
    }
    this.persist();
    return metadata;
  }

  public getResumeMetadata(userId: string, resumeId: string): ResumeMetadata | undefined {
    if (!this.data.resumes) return undefined;
    return this.data.resumes.find(r => r.userId === userId && (r.resumeId === resumeId || r.id === resumeId));
  }

  public saveAtsReport(report: AtsReport): AtsReport {
    if (!this.data.ats_reports) this.data.ats_reports = [];
    const idx = this.data.ats_reports.findIndex(r => (r.id === report.id || r.reportId === report.reportId) && r.userId === report.userId);
    if (idx >= 0) {
      this.data.ats_reports[idx] = { ...this.data.ats_reports[idx], ...report };
    } else {
      this.data.ats_reports.unshift(report);
    }
    this.persist();
    return report;
  }

  public getAtsReports(userId: string): AtsReport[] {
    if (!this.data.ats_reports) return [];
    return this.data.ats_reports.filter(r => r.userId === userId);
  }

  public getAtsReport(userId: string, reportId: string): AtsReport | undefined {
    if (!this.data.ats_reports) return undefined;
    return this.data.ats_reports.find(r => r.userId === userId && (r.id === reportId || r.reportId === reportId));
  }

  public deleteAtsReport(userId: string, reportId: string): boolean {
    if (!this.data.ats_reports) return false;
    const initialLen = this.data.ats_reports.length;
    this.data.ats_reports = this.data.ats_reports.filter(r => !(r.userId === userId && (r.id === reportId || r.reportId === reportId)));
    this.persist();
    return this.data.ats_reports.length < initialLen;
  }

  // --- Personalized Career Paths ---
  public saveCareerPath(careerPath: CareerPath): CareerPath {
    if (!this.data.career_paths) this.data.career_paths = [];
    const idx = this.data.career_paths.findIndex(
      p => (p.id === careerPath.id || p.careerPathId === careerPath.careerPathId) && p.userId === careerPath.userId
    );
    if (idx >= 0) {
      this.data.career_paths[idx] = { ...this.data.career_paths[idx], ...careerPath, updatedAt: new Date().toISOString() };
    } else {
      this.data.career_paths.unshift(careerPath);
    }
    this.persist();
    return careerPath;
  }

  public getCareerPaths(userId: string): CareerPath[] {
    if (!this.data.career_paths) return [];
    return this.data.career_paths.filter(p => p.userId === userId);
  }

  public getCareerPath(userId: string, pathId: string): CareerPath | undefined {
    if (!this.data.career_paths) return undefined;
    return this.data.career_paths.find(p => p.userId === userId && (p.id === pathId || p.careerPathId === pathId));
  }

  public deleteCareerPath(userId: string, pathId: string): boolean {
    if (!this.data.career_paths) return false;
    const initialLen = this.data.career_paths.length;
    this.data.career_paths = this.data.career_paths.filter(
      p => !(p.userId === userId && (p.id === pathId || p.careerPathId === pathId))
    );
    this.persist();
    return this.data.career_paths.length < initialLen;
  }
}

export const db = new DatabaseStore();

