import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
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

export function createApp() {
  const app = express();
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
        userSkills, 
        user.career_interests, 
        existingOpps,
        {
          location: location || user.location,
          type: type || 'Internship',
          remote: typeof remote === 'boolean' ? remote : user.remote_preference,
          customQuery: query
        }
      );

      if (searchResults && searchResults.length > 0) {
        const added = db.bulkAddOpportunities(searchResults);
        res.json({
          message: `Discovered and added ${added.length} new opportunities grounded in live web intelligence.`,
          new_opportunities: added,
          total_opportunities: db.getOpportunities()
        });
      } else {
        res.json({
          message: 'No new unique opportunities found matching the specified parameters.',
          new_opportunities: [],
          total_opportunities: db.getOpportunities()
        });
      }
    } catch (e: any) {
      console.error('Web search opportunities error:', e);
      res.status(500).json({ error: e.message || 'Failed to search web opportunities' });
    }
  });

  // Daily Technology Trends & Market Intelligence
  app.get('/api/trends', async (req, res) => {
    try {
      const user = db.getUser('usr_rahul_001') || DEFAULT_USER;
      const trends = await fetchDailyTechTrends(user.skills, user.career_interests);
      res.json(trends);
    } catch (e: any) {
      console.error('Tech trends API error:', e);
      res.status(500).json({ error: 'Failed to retrieve tech trends' });
    }
  });

  // Applications / Saved
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
      const appRecord = db.saveOrUpdateApplication(user_id, opportunity_id, status || 'SAVED', notes);
      res.json(appRecord);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/applications/:id', (req, res) => {
    const success = db.deleteApplication(req.params.id);
    res.json({ success });
  });

  // Agent Runs & Execution
  app.post('/api/agent/run', async (req, res) => {
    try {
      const { user_id, goal } = req.body;
      if (!user_id || !goal) {
        return res.status(400).json({ error: 'user_id and goal are required' });
      }
      
      const user = db.getUser(user_id) || DEFAULT_USER;
      const memories = db.getMemories(user_id);
      const opportunities = db.getOpportunities();

      const run = await agentOrchestrator.executeGoal(goal, user, memories, opportunities);
      res.json(run);
    } catch (e: any) {
      console.error('Agent run execution error:', e);
      res.status(500).json({ error: e.message || 'Agent execution failed' });
    }
  });

  const getRunsHandler = (req: express.Request, res: express.Response) => {
    const runs = db.getAgentRunsForUser(req.params.userId);
    res.json(runs);
  };

  app.get('/api/agent/history/:userId', getRunsHandler);
  app.get('/api/agent/runs/:userId', getRunsHandler);

  app.get('/api/agent/run/:id', (req, res) => {
    const run = db.getAgentRun(req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Agent run not found' });
    }
    res.json(run);
  });

  // Chat with Agent Nova (Autonomous Assistant & Career Mentor)
  const handleChat = async (req: express.Request, res: express.Response) => {
    try {
      const { user_id, messages, message, conversation_history } = req.body;
      const targetUserId = user_id || 'usr_rahul_001';

      // Support both array of messages [{role, content}] and single message with history
      let chatMessages: ChatMessageParam[] = [];
      if (Array.isArray(messages) && messages.length > 0) {
        chatMessages = messages.map(m => ({
          role: m.role === 'assistant' || m.sender === 'nova' ? 'assistant' : 'user',
          content: m.content || m.text || ''
        }));
      } else if (message) {
        if (Array.isArray(conversation_history)) {
          chatMessages = [
            ...conversation_history.map(m => ({
              role: m.role === 'assistant' || m.sender === 'nova' ? 'assistant' : 'user',
              content: m.content || m.text || ''
            })),
            { role: 'user', content: message }
          ];
        } else {
          chatMessages = [{ role: 'user', content: message }];
        }
      }

      if (chatMessages.length === 0) {
        return res.status(400).json({ error: 'Messages are required' });
      }

      const user = db.getUser(targetUserId) || DEFAULT_USER;
      const memories = db.getMemories(targetUserId);
      const opportunities = db.getOpportunities();

      const userProfileSummary = `Name: ${user.name}, Degree: ${user.degree}, Branch: ${user.branch}, Year: ${user.year}, Location: ${user.location}, Skills: ${user.skills.join(', ')}, Interests: ${user.career_interests.join(', ')}, Preferences: ${user.preferred_opportunity_types.join(', ')}`;
      const memorySummary = memories.length > 0 
        ? memories.map(m => `[${m.category || m.memory_type}]: ${m.memory_text}`).join('\n')
        : 'No specific personal memory notes recorded yet.';
      const opportunitiesSummary = opportunities.slice(0, 8).map(o => `${o.title} at ${o.company} (${o.type}, Match: ${o.match_score}%, Skills: ${o.required_skills.join(', ')})`).join('\n');

      const result = await chatWithAgentNova(
        chatMessages,
        userProfileSummary,
        memorySummary,
        opportunitiesSummary
      );

      res.json({
        reply: result.reply,
        suggestedQuestions: result.suggestedQuestions || [],
        suggested_actions: result.suggestedQuestions || [],
        context: result.context
      });
    } catch (e: any) {
      console.error('Chat endpoint error:', e);
      res.status(500).json({ error: e.message || 'Error processing chat message' });
    }
  };

  app.post('/api/agent/chat', handleChat);
  app.post('/api/chat', handleChat);

  // --- ATS Scanner Endpoints ---

  // Upload and parse resume file (PDF, DOCX, or Images)
  app.post('/api/ats/upload', upload.single('resume'), async (req, res) => {
    try {
      const userId = req.body.userId || 'usr_rahul_001';
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No resume file uploaded. Please attach a PDF, DOCX, or PNG/JPG image.' });
      }

      const fileName = file.originalname;
      const fileType = file.mimetype;
      const fileSize = file.size;

      // Extract structured resume data with Gemini Multimodal / PDF-parse / Mammoth
      const extraction = await extractResumeData(file.buffer, fileType, fileName);
      const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Save metadata to local store
      const resumeMetadata: ResumeMetadata = {
        id: resumeId,
        resumeId,
        userId,
        fileName,
        fileType,
        fileSize,
        storagePath: `resumes/${userId}/${resumeId}/${fileName}`,
        uploadedAt: new Date().toISOString(),
        status: 'PARSED'
      };

      db.saveResumeMetadata(resumeMetadata);

      res.json({
        resumeId,
        fileName,
        fileType,
        fileSize,
        extractedData: extraction.extractedData,
        rawText: extraction.rawText,
        metadata: resumeMetadata
      });
    } catch (err: any) {
      console.error('ATS resume upload error:', err);
      res.status(500).json({ error: 'Failed to process resume file', details: err.message });
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

  // Dedicated job description match check
  app.post('/api/ats/job-match', async (req, res) => {
    try {
      const { extractedData, jobDescription } = req.body;
      if (!extractedData || !jobDescription) {
        return res.status(400).json({ error: 'Missing extractedData or jobDescription' });
      }
      const matchResult = await analyzeJobMatch(extractedData, jobDescription);
      res.json(matchResult);
    } catch (err: any) {
      console.error('Job match endpoint error:', err);
      res.status(500).json({ error: 'Failed to analyze job match', details: err.message });
    }
  });

  // Generate resume bullet point recommendations
  app.post('/api/ats/recommendations', async (req, res) => {
    try {
      const { extractedData, jobDescription } = req.body;
      if (!extractedData) {
        return res.status(400).json({ error: 'Missing extractedData' });
      }
      const recs = await generateResumeRecommendations(extractedData, jobDescription);
      res.json(recs);
    } catch (err: any) {
      console.error('Recommendations endpoint error:', err);
      res.status(500).json({ error: 'Failed to generate recommendations', details: err.message });
    }
  });

  // Get user's previous ATS reports
  app.get('/api/ats/reports/:userId', (req, res) => {
    const reports = db.getAtsReports(req.params.userId);
    res.json(reports);
  });

  // Get specific ATS report
  app.get('/api/ats/reports/:userId/:reportId', (req, res) => {
    const report = db.getAtsReport(req.params.userId, req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  });

  // Delete ATS report
  app.delete('/api/ats/reports/:userId/:reportId', (req, res) => {
    const deleted = db.deleteAtsReport(req.params.userId, req.params.reportId);
    res.json({ success: deleted });
  });

  // --- Personalized Dynamic Career Path Endpoints ---

  // Generate a tailored, multi-phase Career Execution Path
  app.post('/api/career-path/generate', async (req, res) => {
    try {
      const { user_id, target_role, target_opportunity_id, custom_interests, timeframe_months } = req.body;
      const userId = user_id || 'usr_rahul_001';
      const user = db.getUser(userId) || DEFAULT_USER;
      const memories = db.getMemories(userId);
      const targetOpp = target_opportunity_id ? db.getOpportunityById(target_opportunity_id) : undefined;
      const targetRoleTitle = target_role || targetOpp?.title || 'AI/ML Software Engineer';

      const generated = await generatePersonalizedCareerPath(
        user,
        targetRoleTitle,
        memories,
        targetOpp,
        custom_interests,
        timeframe_months || 6
      );

      const pathId = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const careerPath: CareerPath = {
        id: pathId,
        careerPathId: pathId,
        userId,
        targetRole: targetRoleTitle,
        targetOpportunityId: target_opportunity_id || undefined,
        currentReadinessScore: generated.currentReadinessScore,
        estimatedTimeToReadiness: generated.estimatedTimeToReadiness,
        summary: generated.summary,
        skillGaps: generated.skillGaps,
        phases: generated.phases,
        strategicRecommendations: generated.strategicRecommendations,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveCareerPath(careerPath);
      res.json(careerPath);
    } catch (err: any) {
      console.error('Career path generation error:', err);
      res.status(500).json({ error: 'Failed to generate career path', details: err.message });
    }
  });

  // Get user's saved career paths
  app.get('/api/career-path/:userId', (req, res) => {
    const paths = db.getCareerPaths(req.params.userId);
    res.json(paths);
  });

  // Get single career path
  app.get('/api/career-path/:userId/:pathId', (req, res) => {
    const pathRecord = db.getCareerPath(req.params.userId, req.params.pathId);
    if (!pathRecord) {
      return res.status(404).json({ error: 'Career path not found' });
    }
    res.json(pathRecord);
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

  return app;
}
