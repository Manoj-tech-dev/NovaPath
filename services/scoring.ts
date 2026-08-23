import { 
  UserProfile, 
  Opportunity, 
  EvaluatedOpportunity, 
  MatchFactorBreakdown,
  SkillGapItem
} from '../src/types';

export function evaluateOpportunityFit(
  opp: Opportunity,
  user: UserProfile,
  retrievedPreferences: string[]
): EvaluatedOpportunity {
  const userSkills = user.skills.map(s => s.toLowerCase().trim());
  const oppSkills = opp.skills.map(s => s.toLowerCase().trim());

  // 1. Skill Match (Max 40 points)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  opp.skills.forEach(skill => {
    const sLower = skill.toLowerCase().trim();
    if (userSkills.some(us => us === sLower || us.includes(sLower) || sLower.includes(us))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillRatio = opp.skills.length > 0 ? (matchedSkills.length / opp.skills.length) : 0.8;
  const skillsScore = Math.round(skillRatio * 40);

  // 2. Eligibility Match (Max 25 points)
  let eligibilityScore = 20;
  const eligLower = opp.eligibility.toLowerCase();
  const yearStr = `${user.year}`;
  if (eligLower.includes(yearStr) || eligLower.includes(`${user.year}nd`) || eligLower.includes(`${user.year}rd`) || eligLower.includes('all years') || eligLower.includes('undergraduate')) {
    eligibilityScore = 25;
  } else if (eligLower.includes('graduates only') || eligLower.includes('final year only') && user.year < 4) {
    eligibilityScore = 10;
  }

  // 3. Location Preference (Max 15 points)
  let locationScore = 0;
  const isUserLoc = opp.location.toLowerCase() === user.location.toLowerCase();
  const isRemote = opp.remote;
  
  if (isUserLoc) {
    locationScore = 15;
  } else if (isRemote && user.remote_preference) {
    locationScore = 14;
  } else if (isRemote) {
    locationScore = 12;
  } else {
    locationScore = 6;
  }

  // 4. Opportunity Preference (Max 10 points)
  let typeScore = 7;
  if (user.preferred_opportunity_types.includes(opp.type)) {
    typeScore = 10;
  }

  // 5. Experience / Year Fit (Max 10 points)
  let experienceScore = 8;
  if (user.year >= 2) {
    experienceScore = 10;
  } else {
    experienceScore = 7;
  }

  const matchScore = Math.min(100, Math.max(20, skillsScore + eligibilityScore + locationScore + typeScore + experienceScore));

  const breakdown: MatchFactorBreakdown = {
    skillsScore,
    eligibilityScore,
    locationScore,
    typeScore,
    experienceScore
  };

  // Match Reasons and Transparent Logic
  const matchReasons: string[] = [];
  if (skillsScore >= 25) {
    matchReasons.push(`Strong overlap in core skills (${matchedSkills.slice(0, 3).join(', ')})`);
  } else if (matchedSkills.length > 0) {
    matchReasons.push(`Matches essential baseline skills (${matchedSkills.join(', ')})`);
  }

  if (isUserLoc) {
    matchReasons.push(`Located directly in your target city (${opp.location})`);
  } else if (isRemote && user.remote_preference) {
    matchReasons.push('Offers remote flexibility matching your preferences');
  }

  if (eligibilityScore >= 20) {
    matchReasons.push(`Eligible for ${user.degree} ${user.year}${user.year === 1 ? 'st' : user.year === 2 ? 'nd' : user.year === 3 ? 'rd' : 'th'} Year standing`);
  }

  const concerns: string[] = [];
  if (missingSkills.length > 0) {
    concerns.push(`Additional tooling required: ${missingSkills.slice(0, 2).join(', ')}`);
  }
  if (!isUserLoc && !isRemote) {
    concerns.push(`On-site in ${opp.location} (relocation or commute may be needed)`);
  }

  return {
    ...opp,
    matchScore,
    breakdown,
    matchReasons,
    concerns,
    matchedSkills,
    missingSkills
  };
}

export function generateSkillGapAnalysis(
  evaluatedOpportunities: EvaluatedOpportunity[],
  user: UserProfile
): SkillGapItem[] {
  const gapCounts: Record<string, number> = {};

  evaluatedOpportunities.slice(0, 5).forEach(opp => {
    opp.missingSkills.forEach(skill => {
      gapCounts[skill] = (gapCounts[skill] || 0) + 1;
    });
  });

  const skillGaps: SkillGapItem[] = Object.entries(gapCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => {
      let priority: 'CRITICAL' | 'RECOMMENDED' | 'NICE_TO_HAVE' = 'RECOMMENDED';
      let estimatedTimeToLearn = '3–5 days';
      let suggestedAction = `Review fundamentals of ${skill} and build a quick hands-on component.`;
      let sampleMiniProject = `Build a demo micro-service or module utilizing ${skill}.`;

      const sLower = skill.toLowerCase();
      if (count >= 2 || sLower === 'tensorflow' || sLower === 'pytorch' || sLower === 'docker') {
        priority = 'CRITICAL';
      } else if (count === 1) {
        priority = 'NICE_TO_HAVE';
      }

      if (sLower.includes('tensorflow') || sLower.includes('pytorch')) {
        suggestedAction = 'Follow official tutorials on CNN/Transformer pipelines and practice model evaluation.';
        estimatedTimeToLearn = '4–7 days (10–12 hours)';
        sampleMiniProject = 'Train and deploy a quick image classification or text sentiment model using transfer learning.';
      } else if (sLower.includes('docker')) {
        suggestedAction = 'Learn Dockerfile creation, image building, and containerizing a Python FastAPI script.';
        estimatedTimeToLearn = '2–3 days (4–6 hours)';
        sampleMiniProject = 'Containerize a local ML prediction script with a health endpoint.';
      } else if (sLower.includes('fastapi')) {
        suggestedAction = 'Create REST API endpoints with Pydantic type validation and Swagger docs.';
        estimatedTimeToLearn = '2 days (4 hours)';
        sampleMiniProject = 'Deploy a lightweight inference REST API that takes JSON input and returns predictions.';
      } else if (sLower.includes('powerbi') || sLower.includes('tableau')) {
        suggestedAction = 'Connect sample datasets and build an interactive 3-card metric dashboard.';
        estimatedTimeToLearn = '2–3 days (5 hours)';
        sampleMiniProject = 'Create an interactive student performance or sales metrics visual report.';
      }

      return {
        skill,
        frequency: count,
        priority,
        suggestedAction,
        estimatedTimeToLearn,
        sampleMiniProject
      };
    });

  return skillGaps;
}
