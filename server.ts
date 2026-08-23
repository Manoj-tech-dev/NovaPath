import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db, DEFAULT_USER, INITIAL_MEMORIES } from './database/store';
import { agentOrchestrator } from './agent/orchestrator';
import { 
  chatWithAgentNova, 
  searchWebOpportunities, 
  fetchDailyTechTrends, 
  ChatMessageParam,
  extractResumeData,
  analyzeResumeATS,
  analyzeJobMatch,
  generateResumeRecommendations,
  generatePersonalizedCareerPath
} from './services/gemini';
import { calculateAtsScores } from './src/features/ats/services/atsScoringService';
import { AtsReport, ResumeMetadata, CareerPath } from './src/types';

dotenv.config();

// Multer in-memory storage for safe, privacy-preserving resume parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'NovaPath Agent Hub',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Profile endpoints
  app.get('/api/profile/:id', (req, res) => {
    const user = db.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(user);
  });

  app.put('/api/profile/:id', (req, res) => {
    try {
      const updated = db.updateUser(req.params.id, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Memory endpoints
  app.get('/api/memory/:userId', (req, res) => {
    const memories = db.getMemories(req.params.userId);
    res.json(memories);
  });

  app.post('/api/memory', (req, res) => {
    try {
      const { user_id, memory_type, memory_text, importance, category } = req.body;
      if (!user_id || !memory_text) {
        return res.status(400).json({ error: 'user_id and memory_text are required' });
      }
      const newMemory = db.addMemory({
        user_id,
        memory_type: memory_type || 'PREFERENCE',
        memory_text,
        importance: importance || 'MEDIUM',
        category: category || 'General'
      });
      res.status(201).json(newMemory);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/memory/:id', (req, res) => {
    const updated = db.updateMemory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Memory item not found' });
    }
    res.json(updated);
  });

  app.delete('/api/memory/:id', (req, res) => {
    const success = db.deleteMemory(req.params.id);
    res.json({ success });
  });

  // Opportunities
  app.get('/api/opportunities', (req, res) => {
    const opps = db.getOpportunities();
    res.json(opps);
  });

  // Web-grounded Opportunity & Internship Live Search based on skills
  app.post('/api/opportunities/search', async (req, res) => {
    try {
      const { user_id, skills, query, location, type, remote } = req.body;
      const userId = user_id || 'usr_rahul_001';
      const user = db.getUser(userId) || DEFAULT_USER;
      const existingOpps = db.getOpportunities();

      const userSkills = (skills && skills.length > 0) ? skills : user.skills;
      
      const searchResults = await searchWebOpportunities(
        {
          skills: userSkills,
          query,
          location: location || user.location,
          type,
          remote: remote !== undefined ? remote : user.remote_preference,
          userProfile: user
        },
        existingOpps
      );

      // Persist new discoveries to database for caching & future alignment
      db.bulkAddOpportunities(searchResults.map(s => ({
        title: s.title,
        organization: s.organization,
        type: s.type,
        location: s.location,
        remote: s.remote,
        skills: s.skills,
        eligibility: s.eligibility,
        deadline: s.deadline,
        description: s.description,
        source: s.source,
        url: s.url,
        source_type: s.source_type,
        stipend_or_salary: s.stipend_or_salary
      })));

      // Mark which items are already saved in user's applications
      const userApps = db.getApplications(userId);
      const savedIds = new Set(userApps.map(a => a.opportunity_id));
      const savedTitles = new Set(userApps.map(a => a.opportunity?.title?.toLowerCase()).filter(Boolean));

      const enrichedResults = searchResults.map(res => ({
        ...res,
        isSaved: savedIds.has(res.id) || savedTitles.has(res.title.toLowerCase())
      }));

      res.json({
        total: enrichedResults.length,
        searchedSkills: userSkills,
        results: enrichedResults
      });
    } catch (e: any) {
      console.error('Error in opportunity web search:', e);
      res.status(500).json({ error: e.message || 'Failed to search opportunities' });
    }
  });

  // Daily Tech & AI Internship Trends with Search Grounding
  app.get('/api/trends/daily', async (req, res) => {
    try {
      const userId = (req.query.user_id as string) || 'usr_rahul_001';
      const user = db.getUser(userId) || DEFAULT_USER;
      const trendsResult = await fetchDailyTechTrends(user.skills);
      res.json(trendsResult);
    } catch (e: any) {
      console.error('Error fetching daily tech trends:', e);
      res.status(500).json({ error: e.message || 'Failed to fetch tech trends' });
    }
  });

  app.post('/api/opportunities', (req, res) => {
    try {
      const newOpp = db.addOpportunity(req.body);
      res.status(201).json(newOpp);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Applications / Saved Opportunities
  app.get('/api/applications/:userId', (req, res) => {
    const apps = db.getApplications(req.params.userId);
    res.json(apps);
  });

  app.post('/api/applications', (req, res) => {
    try {
      const { user_id, opportunity_id, status, notes } = req.body;
      if (!user_id || !opportunity_id) {
        return res.status(400).json({ error: 'user_id and opportunity_id are required' });
      }
      const saved = db.saveOrUpdateApplication(user_id, opportunity_id, status || 'SAVED', notes);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/applications/:id', (req, res) => {
    const success = db.deleteApplication(req.params.id);
    res.json({ success });
  });

  // Agent Nova AI Chatbot Endpoint
  app.post('/api/agent/chat', async (req, res) => {
    try {
      const { user_id, messages } = req.body;
      const userId = user_id || 'usr_rahul_001';
      const user = db.getUser(userId) || DEFAULT_USER;
      const memories = db.getMemories(userId);
      const opportunities = db.getOpportunities().slice(0, 8);

      const userProfileSummary = `Student: ${user.name} (${user.degree}, ${user.branch}, Year ${user.year})
Location: ${user.location} (Remote preferred: ${user.remote_preference})
Skills: ${user.skills.join(', ')}
Career Interests: ${user.career_interests.join(', ')}
Target Formats: ${user.preferred_opportunity_types.join(', ')}`;

      const memorySummary = memories.length > 0 
        ? memories.map(m => `[${m.memory_type} | Imp: ${m.importance}] ${m.memory_text}`).join('\n')
        : 'No specific past constraints recorded.';

      const opportunitiesSummary = opportunities.map(o => 
        `- ${o.title} at ${o.organization} (${o.type}, ${o.location}, Remote: ${o.remote}, Required Skills: ${o.skills.join(', ')})`
      ).join('\n');

      const chatMessages: ChatMessageParam[] = Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: 'user', content: 'What advice do you have for my career path?' }];

      const response = await chatWithAgentNova(
        chatMessages,
        userProfileSummary,
        memorySummary,
        opportunitiesSummary
      );

      res.json({
        ...response,
        context: {
          user_name: user.name,
          user_year: user.year,
          memories_count: memories.length
        }
      });
    } catch (e: any) {
      console.error('Agent Nova Chat Error:', e);
      res.status(500).json({ 
        error: e.message || 'Failed to process chat query',
        reply: "I'm having a brief connection hitch. Please try asking your question again!",
        suggestedQuestions: [
          'How do I prepare for AI/ML interviews?',
          'What projects should I build for my resume?',
          'What are top summer internships for 3rd year students?'
        ]
      });
    }
  });

  // Agent Execution Endpoints
  app.post('/api/agent/run', async (req, res) => {
    try {
      const { user_id, goal } = req.body;
      if (!goal || typeof goal !== 'string') {
        return res.status(400).json({ error: 'Goal string is required' });
      }
      const userId = user_id || 'usr_rahul_001';
      
      const result = await agentOrchestrator.execute({
        userId,
        goal
      });

      res.json(result);
    } catch (e: any) {
      console.error('Agent execution error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/agent/run/:runId', (req, res) => {
    const run = db.getAgentRun(req.params.runId);
    if (!run) {
      return res.status(404).json({ error: 'Agent run not found' });
    }
    res.json(run);
  });

  app.get('/api/agent/history/:userId', (req, res) => {
    const runs = db.getAgentRunsForUser(req.params.userId);
    res.json(runs);
  });

  // Demo Presets Endpoint (For Hackathon Judges!)
  app.post('/api/demo/preset', (req, res) => {
    const { preset } = req.body; // 'session-1', 'session-2', 'reset'
    if (preset === 'reset') {
      db.resetToDefaults();
      return res.json({ message: 'Database reset to default student profile', user: db.getUser('usr_rahul_001') });
    }

    if (preset === 'session-1') {
      // Simulate Session 1 outcome: User expressly specified preferences
      db.resetToDefaults();
      db.addMemory({
        user_id: 'usr_rahul_001',
        memory_type: 'PREFERENCE',
        memory_text: 'User explicitly stated: "I prefer Hyderabad and remote internships."',
        importance: 'HIGH',
        category: 'Session 1 Preference'
      });
      return res.json({ 
        message: 'Session 1 simulated: Location (Hyderabad) and Remote preference saved to persistent memory.',
        user: db.getUser('usr_rahul_001')
      });
    }

    if (preset === 'session-2') {
      // Session 2 state ready for "Find opportunities for me"
      const user = db.getUser('usr_rahul_001');
      return res.json({ 
        message: 'Ready for Session 2: Goal "Find opportunities for me" will automatically draw from persistent memory.',
        user
      });
    }

    res.status(400).json({ error: 'Unknown preset' });
  });

  // ==========================================
  // ATS Resume Scanner Endpoints
  // ==========================================

  // Upload and parse resume file
  app.post('/api/ats/upload', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No resume file uploaded' });
      }

      const userId = req.body.userId || 'usr_rahul_001';
      const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fileName = req.file.originalname;
      const fileType = req.file.mimetype || 'application/pdf';
      const fileSize = req.file.size;

      // Extract text & structured data safely using Gemini / parsers
      const { extractedData, rawText } = await extractResumeData(
        req.file.buffer,
        fileType,
        fileName
      );

      // Save metadata to database store
      const metadata: ResumeMetadata = {
        id: resumeId,
        resumeId,
        userId,
        fileName,
        fileType,
        fileSize,
        storagePath: `resumes/${userId}/${resumeId}/${fileName}`,
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADED'
      };
      db.saveResumeMetadata(metadata);

      res.json({
        success: true,
        resumeId,
        fileName,
        fileType,
        fileSize,
        extractedData,
        rawText
      });
    } catch (err: any) {
      console.error('ATS upload endpoint error:', err);
      res.status(500).json({ error: 'Failed to process and parse resume file', details: err.message });
    }
  });

  // Analyze Resume with ATS logic and optional Job Description
  app.post('/api/ats/analyze', upload.single('resume'), async (req, res) => {
    try {
      const userId = req.body.userId || 'usr_rahul_001';
      let extractedData = req.body.extractedData;
      let rawText = req.body.rawText || '';
      let fileName = req.body.fileName || 'Resume.pdf';
      let fileType = req.body.fileType || 'application/pdf';
      let resumeId = req.body.resumeId || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const jobDescription = req.body.jobDescription || '';
      const jobTitle = req.body.jobTitle || '';

      // If stringified JSON in multipart form data, parse it
      if (typeof extractedData === 'string') {
        try {
          extractedData = JSON.parse(extractedData);
        } catch {
          extractedData = null;
        }
      }

      // If a file is uploaded directly in the analyze request
      if (req.file) {
        fileName = req.file.originalname;
        fileType = req.file.mimetype;
        const extraction = await extractResumeData(req.file.buffer, fileType, fileName);
        extractedData = extraction.extractedData;
        rawText = extraction.rawText;
      }

      if (!extractedData) {
        return res.status(400).json({ error: 'Missing resume data or resume file for analysis' });
      }

      // 1. Run structured ATS analysis with Gemini
      const analysis = await analyzeResumeATS(extractedData, rawText, jobDescription);

      // 2. Deterministic scoring
      const hasJobDesc = !!(jobDescription && jobDescription.trim().length > 20);
      const { score, categoryScores, jobMatchScore } = calculateAtsScores(
        extractedData,
        analysis.findings,
        hasJobDesc
      );

      // 3. Assemble full ATS Report
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const atsReport: AtsReport = {
        id: reportId,
        reportId,
        userId,
        resumeId,
        fileName,
        fileType,
        score,
        jobTitle: jobTitle || undefined,
        jobDescription: jobDescription || undefined,
        jobMatchScore,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
        categoryScores,
        extractedData,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords,
        formattingIssues: analysis.formattingIssues,
        contentIssues: analysis.contentIssues,
        recommendations: analysis.recommendations,
        bulletImprovements: analysis.bulletImprovements,
        roleModifications: analysis.roleModifications
      };

      // Save to database store
      db.saveAtsReport(atsReport);

      res.json(atsReport);
    } catch (err: any) {
      console.error('ATS analyze endpoint error:', err);
      res.status(500).json({ error: 'Failed to analyze resume', details: err.message });
    }
  });

  // Get all ATS reports for user
  app.get('/api/ats/reports/:userId', (req, res) => {
    try {
      const reports = db.getAtsReports(req.params.userId);
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch ATS reports', details: err.message });
    }
  });

  // Get specific ATS report
  app.get('/api/ats/reports/:userId/:reportId', (req, res) => {
    try {
      const report = db.getAtsReport(req.params.userId, req.params.reportId);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch report', details: err.message });
    }
  });

  // Delete ATS report
  app.delete('/api/ats/reports/:userId/:reportId', (req, res) => {
    try {
      const deleted = db.deleteAtsReport(req.params.userId, req.params.reportId);
      res.json({ success: true, deleted });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete report', details: err.message });
    }
  });

  // --- Personalized Career Path Endpoints ---

  // Generate a new personalized career path
  app.post('/api/career-path/generate', async (req, res) => {
    try {
      const {
        userId = 'usr_rahul_001',
        targetRole,
        targetOpportunityId,
        targetOpportunityTitle,
        targetCompany,
        targetJobDescription,
        userProfile,
        atsReport
      } = req.body;

      if (!targetRole) {
        return res.status(400).json({ error: 'Target role is required' });
      }

      // Fetch user profile if not provided in payload
      const user = userProfile || db.getUser(userId) || DEFAULT_USER;

      // Fetch memories for user
      const memories = db.getMemories(userId);

      // Fetch latest ATS report if not provided in payload
      let effectiveAtsReport = atsReport;
      if (!effectiveAtsReport) {
        const userAtsReports = db.getAtsReports(userId);
        if (userAtsReports.length > 0) {
          effectiveAtsReport = userAtsReports[0];
        }
      }

      // If targetOpportunityId provided, enrich details from opportunity database
      let enrichedOpportunityTitle = targetOpportunityTitle;
      let enrichedCompany = targetCompany;
      let enrichedJobDescription = targetJobDescription;

      if (targetOpportunityId) {
        const opp = db.getOpportunities().find(o => o.id === targetOpportunityId);
        if (opp) {
          enrichedOpportunityTitle = enrichedOpportunityTitle || opp.title;
          enrichedCompany = enrichedCompany || opp.organization;
          enrichedJobDescription = enrichedJobDescription || `${opp.title} at ${opp.organization}\nRequired Skills: ${opp.skills.join(', ')}\nEligibility: ${opp.eligibility}\nDescription: ${opp.description}`;
        }
      }

      const careerPath = await generatePersonalizedCareerPath({
        userId,
        targetRole,
        targetOpportunityId,
        targetOpportunityTitle: enrichedOpportunityTitle,
        targetCompany: enrichedCompany,
        targetJobDescription: enrichedJobDescription,
        userProfile: user,
        atsReport: effectiveAtsReport,
        memories
      });

      // Save to database store
      db.saveCareerPath(careerPath);

      res.json(careerPath);
    } catch (err: any) {
      console.error('Career Path generation error:', err);
      res.status(500).json({ error: 'Failed to generate career path', details: err.message });
    }
  });

  // Get all career paths for a user
  app.get('/api/career-path/:userId', (req, res) => {
    try {
      const paths = db.getCareerPaths(req.params.userId);
      res.json(paths);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch career paths', details: err.message });
    }
  });

  // Get a single career path by ID
  app.get('/api/career-path/:userId/:pathId', (req, res) => {
    try {
      const path = db.getCareerPath(req.params.userId, req.params.pathId);
      if (!path) {
        return res.status(404).json({ error: 'Career path not found' });
      }
      res.json(path);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch career path', details: err.message });
    }
  });

  // Update milestone step status or entire path
  app.put('/api/career-path/:userId/:pathId/milestone', (req, res) => {
    try {
      const { updatedPath } = req.body;
      if (updatedPath) {
        const saved = db.saveCareerPath(updatedPath);
        return res.json(saved);
      }
      const existing = db.getCareerPath(req.params.userId, req.params.pathId);
      if (!existing) {
        return res.status(404).json({ error: 'Career path not found' });
      }
      res.json(existing);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update milestone', details: err.message });
    }
  });

  // Delete career path
  app.delete('/api/career-path/:userId/:pathId', (req, res) => {
    try {
      const deleted = db.deleteCareerPath(req.params.userId, req.params.pathId);
      res.json({ success: true, deleted });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete career path', details: err.message });
    }
  });

  // --- Vite Middleware setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaPath Agent Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
