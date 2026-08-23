export type OpportunityType = 'Internship' | 'Full-time' | 'Research' | 'Fellowship' | 'Apprenticeship';

export type SourceType = 'LIVE_API' | 'CURATED_DATASET' | 'CACHED_SOURCE';

export type MemoryType = 'PROFILE' | 'INTERACTION' | 'PREFERENCE' | 'FEEDBACK';

export type MemoryImportance = 'LOW' | 'MEDIUM' | 'HIGH';

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';

export type AgentStepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  degree: string;
  branch: string;
  year: number;
  location: string;
  skills: string[];
  career_interests: string[];
  preferred_opportunity_types: OpportunityType[];
  remote_preference: boolean;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  memory_text: string;
  importance: MemoryImportance;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  location: string;
  remote: boolean;
  skills: string[];
  eligibility: string;
  deadline?: string;
  description: string;
  source: string;
  url?: string;
  source_type: SourceType;
  stipend_or_salary?: string;
  created_at: string;
}

export interface MatchFactorBreakdown {
  skillsScore: number;       // Max 40
  eligibilityScore: number;  // Max 25
  locationScore: number;     // Max 15
  typeScore: number;         // Max 10
  experienceScore: number;   // Max 10
}

export interface EvaluatedOpportunity extends Opportunity {
  matchScore: number;        // 0 - 100%
  breakdown: MatchFactorBreakdown;
  matchReasons: string[];
  concerns: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

export interface SkillGapItem {
  skill: string;
  frequency: number;
  priority: 'CRITICAL' | 'RECOMMENDED' | 'NICE_TO_HAVE';
  suggestedAction: string;
  estimatedTimeToLearn: string;
  sampleMiniProject: string;
}

export interface ActionPlanItem {
  id: string;
  timeframe: 'TODAY' | 'NEXT_3_DAYS' | 'THIS_WEEK' | 'NEXT_2_WEEKS';
  title: string;
  description: string;
  completed: boolean;
  relatedOpportunityId?: string;
}

export interface AgentStep {
  id: string;
  agent_run_id: string;
  step_number: number;
  step_name: string;
  display_title: string;
  status: AgentStepStatus;
  result_summary: string;
  details?: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
}

export interface AgentRun {
  id: string;
  user_id: string;
  goal: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  summary?: string;
  retrieved_preferences?: string[];
  opportunities?: EvaluatedOpportunity[];
  skill_gaps?: SkillGapItem[];
  action_plan?: ActionPlanItem[];
  memory_updates?: Memory[];
  steps?: AgentStep[];
  created_at: string;
  completed_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity?: Opportunity;
  status: ApplicationStatus;
  notes?: string;
  applied_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  isError?: boolean;
}

export interface ChatApiResponse {
  reply: string;
  suggestedQuestions: string[];
  context?: {
    user_name: string;
    user_year: number;
    memories_count: number;
  };
}

export interface DailyTechTrend {
  id: string;
  title: string;
  summary: string;
  category: 'AI & Machine Learning' | 'Software Engineering' | 'Cloud & DevOps' | 'Hiring & Internships' | 'Open Source';
  growthSignal?: string;
  keySkills: string[];
  studentTakeaway: string;
  actionableProjectIdea: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
  publishedDate?: string;
}

export interface DailyTrendsResponse {
  timestamp: string;
  groundedWithSearch: boolean;
  trends: DailyTechTrend[];
  marketSummary: string;
}

// --- ATS Scanner Types ---

export type AtsIssueSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AtsIssue {
  id: string;
  severity: AtsIssueSeverity;
  category: string;
  problem: string;
  whyItMatters: string;
  recommendation: string;
}

export interface BulletImprovement {
  id: string;
  originalBullet: string;
  improvedBullet: string;
  reason: string;
  section?: string;
}

export interface ExtractedResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  summary: string | null;
  education: Array<{
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    graduationYear?: string | number;
    gpaOrGrade?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description?: string;
    technologies: string[];
    link?: string;
    bullets: string[];
  }>;
  skills: {
    technical: string[];
    frameworksAndTools: string[];
    softSkills?: string[];
    languages?: string[];
  };
  certifications: string[];
  achievements: string[];
  rawText?: string;
}

export interface RoleModificationBlueprint {
  targetRole: string;
  selectionLikelihood: 'HIGH' | 'MODERATE' | 'NEEDS_TAILORING';
  headlineSuggestion: string;
  summaryRewrite: string;
  skillsToElevate: string[];
  projectModifications: Array<{
    projectName: string;
    currentFocus: string;
    recommendedRoleAngle: string;
    suggestedTechToHighlight: string[];
  }>;
  experienceModifications: Array<{
    roleOrSection: string;
    suggestedChanges: string;
    sampleBullet: string;
  }>;
  interviewTalkingPoints: string[];
  submissionChecklist: string[];
}

export interface AtsCategoryScores {
  keywordMatch: number;       // Max 25
  structure: number;          // Max 20
  experienceQuality: number;  // Max 20
  skillsAlignment: number;    // Max 15
  atsReadability: number;     // Max 10
  contactInformation: number; // Max 10
}

export interface AtsReport {
  id: string;
  reportId: string;
  userId: string;
  resumeId: string;
  fileName: string;
  fileType: string;
  score: number; // 0 - 100
  jobTitle?: string;
  jobDescription?: string;
  jobMatchScore?: number; // 0 - 100
  createdAt: string;
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  categoryScores: AtsCategoryScores;
  extractedData: ExtractedResumeData;
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingIssues: AtsIssue[];
  contentIssues: AtsIssue[];
  recommendations: string[];
  bulletImprovements: BulletImprovement[];
  roleModifications?: RoleModificationBlueprint;
}

export interface ResumeMetadata {
  id: string;
  resumeId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedAt: string;
  status: 'UPLOADED' | 'ANALYZED' | 'ARCHIVED';
}

// --- Personalized Career Path Types ---

export type CareerSkillGapPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type CareerSkillGapStatus = 'MATCHED' | 'PARTIALLY_MATCHED' | 'MISSING' | 'UNKNOWN';

export type CareerStepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface CareerSkillGap {
  id: string;
  skill: string;
  status: CareerSkillGapStatus;
  priority: CareerSkillGapPriority;
  reason: string;
  category?: 'Required' | 'Preferred' | 'Tool' | 'Soft Skill' | 'Domain Knowledge';
  timeToBridge: string;
  completed?: boolean;
}

export interface CareerResource {
  id: string;
  title: string;
  provider: string;
  type: 'Official Documentation' | 'Tutorial & Guide' | 'Interactive Course' | 'Open Source Repository' | 'Book / Paper' | 'Certification Guide';
  url: string;
  skillCovered: string;
  isVerified: boolean;
  description?: string;
}

export interface CareerProject {
  id: string;
  title: string;
  objective: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  expectedOutput: string;
  skillsDemonstrated: string[];
  milestoneStepId?: string;
  status?: CareerStepStatus;
}

export interface CareerStep {
  id: string;
  title: string;
  whyItMatters: string;
  skillsToLearn: string[];
  estimatedDuration: string;
  learningResources: CareerResource[];
  practiceTask: string;
  recommendedProject?: string;
  completionCriteria: string;
  status: CareerStepStatus;
  completedAt?: string;
}

export interface CareerPhase {
  id: string;
  phaseNumber: number;
  title: string;
  duration: string;
  focus: string;
  steps: CareerStep[];
}

export interface CareerScoreBreakdown {
  requiredSkillsScore: number;       // Max 40
  preferredSkillsScore: number;      // Max 15
  projectsExperienceScore: number;   // Max 20
  toolsTechnologiesScore: number;    // Max 10
  educationCertificationsScore: number; // Max 5
  profileCompletenessScore: number;  // Max 10
  total: number;                     // 0 - 100
  calculationExplanation: string;
}

export interface CareerPath {
  id: string;
  careerPathId: string;
  userId: string;
  targetRole: string;
  targetOpportunityId?: string;
  targetOpportunityTitle?: string;
  targetCompany?: string;
  targetJobDescription?: string;
  readinessScore: number;            // 0 - 100 deterministic
  estimatedWeeks: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  skillGaps: CareerSkillGap[];
  phases: CareerPhase[];
  resources: CareerResource[];
  projects: CareerProject[];
  scoreBreakdown: CareerScoreBreakdown;
  atsInsights?: {
    atsReportId?: string;
    weakAreas?: string[];
    recommendationsApplied?: string[];
    roleModificationsSummary?: string;
  };
  nextAction?: {
    title: string;
    subtitle: string;
    stepId: string;
    phaseId: string;
    actionType: 'LEARN' | 'BUILD' | 'RESUME' | 'PRACTICE';
  };
}


