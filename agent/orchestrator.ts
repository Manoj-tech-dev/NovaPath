import { db } from '../database/store';
import { opportunitySearchTool } from '../tools/opportunity_search';
import { parseGoalWithAI } from '../services/gemini';
import { evaluateOpportunityFit, generateSkillGapAnalysis } from '../services/scoring';
import { 
  AgentRun, 
  AgentStep, 
  EvaluatedOpportunity, 
  SkillGapItem, 
  ActionPlanItem, 
  Memory 
} from '../src/types';

export interface RunAgentParams {
  userId: string;
  goal: string;
}

export class AgentOrchestrator {
  /**
   * Executes the full 10-step multi-step reasoning workflow for NovaPath
   */
  public async execute(params: RunAgentParams): Promise<AgentRun> {
    const { userId, goal } = params;

    // Initialize agent run record
    const run = db.createAgentRun(userId, goal);
    const steps: AgentStep[] = [];

    const recordStep = (
      stepNumber: number,
      stepName: string,
      displayTitle: string,
      status: AgentStep['status'],
      resultSummary: string,
      details?: Record<string, unknown>
    ): AgentStep => {
      const step = db.addAgentStep({
        agent_run_id: run.id,
        step_number: stepNumber,
        step_name: stepName,
        display_title: displayTitle,
        status,
        result_summary: resultSummary,
        details,
        started_at: new Date().toISOString(),
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : undefined
      });
      steps.push(step);
      return step;
    };

    try {
      // ----------------------------------------------------
      // STEP 1: Understand Objective
      // ----------------------------------------------------
      const step1 = recordStep(
        1,
        'understand_objective',
        'Understanding your objective',
        'RUNNING',
        'Decomposing natural language goal and extracting target criteria...'
      );

      // ----------------------------------------------------
      // STEP 2: Load User Profile
      // ----------------------------------------------------
      const step2 = recordStep(
        2,
        'load_profile',
        'Loading your student profile',
        'RUNNING',
        'Fetching academic background, coursework, and technical skills...'
      );
      const user = db.getUser(userId) || db.getUser('usr_rahul_001')!;
      
      db.updateAgentStep(step2.id, {
        status: 'COMPLETED',
        result_summary: `Loaded profile for ${user.name} (${user.degree} Year ${user.year}, ${user.branch}) with ${user.skills.length} verified skills.`,
        completed_at: new Date().toISOString(),
        details: {
          user_name: user.name,
          degree: user.degree,
          year: user.year,
          skills: user.skills
        }
      });

      // ----------------------------------------------------
      // STEP 3: Retrieve Memory & Preferences
      // ----------------------------------------------------
      const step3 = recordStep(
        3,
        'retrieve_memory',
        'Retrieving persistent memory & preferences',
        'RUNNING',
        'Checking historical preferences, location choices, and interaction memory...'
      );
      const memories = db.getMemories(userId);
      const retrievedPreferences: string[] = [];

      memories.forEach(m => {
        retrievedPreferences.push(m.memory_text);
      });

      // Also ensure location & remote preference are represented
      if (user.location) {
        retrievedPreferences.push(`Preferred location: ${user.location}`);
      }
      if (user.remote_preference) {
        retrievedPreferences.push('Remote flexibility preferred');
      }

      db.updateAgentStep(step3.id, {
        status: 'COMPLETED',
        result_summary: `Recalled ${memories.length} persistent memory nodes including location (${user.location}) and work style preferences.`,
        completed_at: new Date().toISOString(),
        details: {
          retrieved_preferences: retrievedPreferences
        }
      });

      // Finish Step 1 with AI / Deterministic synthesis
      const parsedGoal = await parseGoalWithAI(
        goal,
        `Student: ${user.name}, ${user.degree} Year ${user.year} (${user.branch}), Skills: ${user.skills.join(', ')}`,
        retrievedPreferences.join('; ')
      );

      db.updateAgentStep(step1.id, {
        status: 'COMPLETED',
        result_summary: parsedGoal.intentSummary || `Identified goal targeting ${parsedGoal.roleOrDomain} ${parsedGoal.opportunityType || 'opportunities'} in ${parsedGoal.preferredLocation || user.location}.`,
        completed_at: new Date().toISOString(),
        details: { parsed_goal: parsedGoal }
      });

      // ----------------------------------------------------
      // STEP 4: Create Search Plan
      // ----------------------------------------------------
      const step4 = recordStep(
        4,
        'plan_search',
        'Creating opportunity search plan',
        'RUNNING',
        'Synthesizing query constraints across domain, location, and eligibility criteria...'
      );

      const targetLocation = parsedGoal.preferredLocation || user.location;
      const targetDomain = parsedGoal.roleOrDomain || user.career_interests[0] || 'AI/ML';
      const targetRemote = parsedGoal.remotePreferred ?? user.remote_preference;

      db.updateAgentStep(step4.id, {
        status: 'COMPLETED',
        result_summary: `Formulated multi-criteria search plan: Domain='${targetDomain}', Location='${targetLocation}', Remote='${targetRemote ? 'Yes' : 'Any'}'.`,
        completed_at: new Date().toISOString(),
        details: {
          targetLocation,
          targetDomain,
          targetRemote
        }
      });

      // ----------------------------------------------------
      // STEP 5: Search Opportunity Sources
      // ----------------------------------------------------
      const step5 = recordStep(
        5,
        'search_opportunities',
        'Searching opportunity sources',
        'RUNNING',
        'Querying structured database and verified external opportunity index...'
      );

      const searchResults = await opportunitySearchTool.search({
        goal,
        roleOrDomain: targetDomain,
        location: targetLocation,
        skills: user.skills,
        opportunityType: parsedGoal.opportunityType || 'Internship',
        remotePreference: targetRemote
      });

      db.updateAgentStep(step5.id, {
        status: 'COMPLETED',
        result_summary: `Retrieved ${searchResults.totalFound} candidate opportunities from ${searchResults.sourceDescription}.`,
        completed_at: new Date().toISOString(),
        details: {
          totalFound: searchResults.totalFound,
          querySummary: searchResults.querySummary
        }
      });

      // ----------------------------------------------------
      // STEP 6: Evaluate Fit (Deterministic Scoring)
      // ----------------------------------------------------
      const step6 = recordStep(
        6,
        'evaluate_fit',
        'Evaluating opportunity-to-profile fit',
        'RUNNING',
        'Computing 5-factor deterministic match scores (Skills, Eligibility, Location, Type, Experience)...'
      );

      const evaluatedOpps: EvaluatedOpportunity[] = searchResults.opportunities.map(opp => 
        evaluateOpportunityFit(opp, user, retrievedPreferences)
      );

      db.updateAgentStep(step6.id, {
        status: 'COMPLETED',
        result_summary: `Evaluated ${evaluatedOpps.length} opportunities with transparent weighted scoring matrix.`,
        completed_at: new Date().toISOString(),
        details: {
          evaluated_count: evaluatedOpps.length
        }
      });

      // ----------------------------------------------------
      // STEP 7: Identify Skill Gaps
      // ----------------------------------------------------
      const step7 = recordStep(
        7,
        'identify_skill_gaps',
        'Identifying skill gaps & learning paths',
        'RUNNING',
        'Comparing student skill inventory against high-affinity opportunities...'
      );

      const skillGaps: SkillGapItem[] = generateSkillGapAnalysis(evaluatedOpps, user);

      const topGapNames = skillGaps.slice(0, 3).map(g => g.skill).join(', ');
      db.updateAgentStep(step7.id, {
        status: 'COMPLETED',
        result_summary: skillGaps.length > 0 
          ? `Identified ${skillGaps.length} priority skill gaps (${topGapNames}) with targeted learning steps.`
          : 'Profile already covers 100% of core required skills for top roles.',
        completed_at: new Date().toISOString(),
        details: {
          gaps_count: skillGaps.length,
          top_gaps: skillGaps.slice(0, 3)
        }
      });

      // ----------------------------------------------------
      // STEP 8: Rank Opportunities
      // ----------------------------------------------------
      const step8 = recordStep(
        8,
        'rank_opportunities',
        'Ranking your best opportunity matches',
        'RUNNING',
        'Sorting opportunities by multidimensional suitability and deadline priority...'
      );

      evaluatedOpps.sort((a, b) => b.matchScore - a.matchScore);
      const topMatch = evaluatedOpps[0];

      db.updateAgentStep(step8.id, {
        status: 'COMPLETED',
        result_summary: topMatch 
          ? `Top match: '${topMatch.title}' at ${topMatch.organization} (${topMatch.matchScore}% Match Score).`
          : 'Ranked all available matches.',
        completed_at: new Date().toISOString(),
        details: {
          top_match_title: topMatch?.title,
          top_match_score: topMatch?.matchScore
        }
      });

      // ----------------------------------------------------
      // STEP 9: Generate Action Plan
      // ----------------------------------------------------
      const step9 = recordStep(
        9,
        'generate_action_plan',
        'Creating your concrete action plan',
        'RUNNING',
        'Generating timeline-based execution checklist (Today, Next 3 Days, This Week, Next 2 Weeks)...'
      );

      const actionPlan: ActionPlanItem[] = [
        {
          id: `plan_act_${Date.now()}_1`,
          timeframe: 'TODAY',
          title: `Review and bookmark ${topMatch ? topMatch.title : 'top opportunity'} at ${topMatch ? topMatch.organization : 'CognitiveScale'}`,
          description: `Read the role requirements on the official source (${topMatch ? topMatch.source : 'Careers portal'}), verify deadline (${topMatch?.deadline || 'Upcoming'}), and align resume keywords with ${topMatch?.matchedSkills.slice(0, 3).join(', ') || 'required skills'}.`,
          completed: false,
          relatedOpportunityId: topMatch?.id
        },
        {
          id: `plan_act_${Date.now()}_2`,
          timeframe: 'TODAY',
          title: 'Update resume with relevant project highlights',
          description: 'Highlight your Python & Machine Learning project experience and course achievements from your B.Tech program.',
          completed: false
        },
        {
          id: `plan_act_${Date.now()}_3`,
          timeframe: 'NEXT_3_DAYS',
          title: skillGaps.length > 0 ? `Learn ${skillGaps[0].skill} fundamentals` : 'Deepen technical interview readiness',
          description: skillGaps.length > 0 
            ? `${skillGaps[0].suggestedAction} Target completion: ${skillGaps[0].estimatedTimeToLearn}.`
            : 'Review core algorithms and data structures questions for technical rounds.',
          completed: false
        },
        {
          id: `plan_act_${Date.now()}_4`,
          timeframe: 'NEXT_3_DAYS',
          title: skillGaps.length > 0 ? `Build mini-project for ${skillGaps[0].skill}` : 'Deploy portfolio project to GitHub',
          description: skillGaps.length > 0 
            ? skillGaps[0].sampleMiniProject 
            : 'Clean up README, add architecture diagrams, and ensure live demo links work.',
          completed: false
        },
        {
          id: `plan_act_${Date.now()}_5`,
          timeframe: 'THIS_WEEK',
          title: `Submit applications to top 3 ranked opportunities in ${targetLocation}`,
          description: `Submit tailored applications for ${evaluatedOpps.slice(0, 3).map(o => o.organization).join(', ')}. Track each submission in NovaPath Applications tracker.`,
          completed: false
        },
        {
          id: `plan_act_${Date.now()}_6`,
          timeframe: 'THIS_WEEK',
          title: 'Prepare standard technical & behavioural interview responses',
          description: 'Practice explaining your ML project architectures, model evaluation trade-offs, and collaborative team experiences.',
          completed: false
        },
        {
          id: `plan_act_${Date.now()}_7`,
          timeframe: 'NEXT_2_WEEKS',
          title: 'Follow up on submitted applications & network with mentors',
          description: 'Connect with alumni or engineers at target organizations on LinkedIn to request informational referrals.',
          completed: false
        }
      ];

      db.updateAgentStep(step9.id, {
        status: 'COMPLETED',
        result_summary: `Created ${actionPlan.length}-step structured action plan with realistic timeframes.`,
        completed_at: new Date().toISOString(),
        details: {
          total_actions: actionPlan.length
        }
      });

      // ----------------------------------------------------
      // STEP 10: Save Memory Updates
      // ----------------------------------------------------
      const step10 = recordStep(
        10,
        'update_memory',
        'Updating persistent memory',
        'RUNNING',
        'Storing newly learned preferences and goal session context...'
      );

      const memoryUpdates: Memory[] = [];

      // Save goal preference memory
      if (goal && goal.trim().length > 3) {
        const newGoalMem = db.addMemory({
          user_id: userId,
          memory_type: 'INTERACTION',
          memory_text: `User executed career goal: "${goal.trim()}"`,
          importance: 'MEDIUM',
          category: 'Execution History'
        });
        memoryUpdates.push(newGoalMem);
      }

      // If user mentioned specific location or remote preferences, remember them
      if (parsedGoal.preferredLocation && parsedGoal.preferredLocation !== user.location) {
        const locMem = db.addMemory({
          user_id: userId,
          memory_type: 'PREFERENCE',
          memory_text: `Preferred target city noted as ${parsedGoal.preferredLocation}.`,
          importance: 'HIGH',
          category: 'Location'
        });
        memoryUpdates.push(locMem);
      }

      if (parsedGoal.remotePreferred !== undefined && parsedGoal.remotePreferred !== user.remote_preference) {
        const remMem = db.addMemory({
          user_id: userId,
          memory_type: 'PREFERENCE',
          memory_text: `Explicit remote work preference noted: ${parsedGoal.remotePreferred ? 'Prefers remote/hybrid' : 'Prefers on-site'}.`,
          importance: 'HIGH',
          category: 'Work Style'
        });
        memoryUpdates.push(remMem);
      }

      db.updateAgentStep(step10.id, {
        status: 'COMPLETED',
        result_summary: `Persisted ${memoryUpdates.length} memory updates to student's long-term profile storage.`,
        completed_at: new Date().toISOString(),
        details: {
          memory_updates_count: memoryUpdates.length
        }
      });

      // ----------------------------------------------------
      // Finalize Agent Run
      // ----------------------------------------------------
      const summary = `Analyzed goal: "${goal}". Successfully retrieved student profile and long-term preferences, evaluated ${evaluatedOpps.length} opportunities, identified ${skillGaps.length} skill development priorities, and formulated a tailored ${actionPlan.length}-step action plan.`;

      const completedRun = db.updateAgentRun(run.id, {
        status: 'COMPLETED',
        summary,
        retrieved_preferences: retrievedPreferences,
        opportunities: evaluatedOpps,
        skill_gaps: skillGaps,
        action_plan: actionPlan,
        memory_updates: memoryUpdates,
        completed_at: new Date().toISOString()
      });

      return completedRun || run;
    } catch (err: unknown) {
      console.error('Agent execution error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      db.updateAgentRun(run.id, {
        status: 'FAILED',
        summary: `Agent execution encountered an error: ${errMsg}`
      });
      return db.getAgentRun(run.id)!;
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
