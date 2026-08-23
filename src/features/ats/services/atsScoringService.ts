import { AtsCategoryScores, ExtractedResumeData, AtsIssue } from '../../../types';

export interface RawAtsEvaluationFindings {
  keywordRelevanceRate: number; // 0.0 to 1.0 (matching domain/industry standard or job description)
  structureCompletenessRate: number; // 0.0 to 1.0
  experienceQualityRate: number; // 0.0 to 1.0 (strong action verbs, concise points, clear roles)
  skillsAlignmentRate: number; // 0.0 to 1.0
  atsReadabilityRate: number; // 0.0 to 1.0 (clean headers, lack of unparseable constructs)
  contactCompletenessRate: number; // 0.0 to 1.0
  detectedFormattingIssues?: string[];
  detectedContentIssues?: string[];
}

/**
 * Deterministically computes category scores and overall ATS Readiness Score (out of 100)
 * based on structured extracted resume data and analytical findings.
 * Gemini provides observations and findings; this service strictly computes the final scores.
 */
export function calculateAtsScores(
  extractedData: ExtractedResumeData,
  findings: RawAtsEvaluationFindings,
  hasJobDescription: boolean = false
): {
  score: number;
  categoryScores: AtsCategoryScores;
  jobMatchScore?: number;
} {
  // 1. Contact Information Score (Max 10 points)
  let contactScore = 0;
  if (extractedData.name && extractedData.name.trim().length > 1) contactScore += 3;
  if (extractedData.email && extractedData.email.includes('@')) contactScore += 3;
  if (extractedData.phone && extractedData.phone.trim().length > 5) contactScore += 2;
  if (extractedData.linkedin || extractedData.github || extractedData.portfolio) contactScore += 2;
  contactScore = Math.min(10, Math.max(0, contactScore));

  // 2. Resume Structure Score (Max 20 points)
  let structureScore = 0;
  // Has essential standard sections
  if (extractedData.education && extractedData.education.length > 0) structureScore += 5;
  if (extractedData.experience && extractedData.experience.length > 0) structureScore += 6;
  if (extractedData.skills && ((extractedData.skills.technical?.length || 0) + (extractedData.skills.frameworksAndTools?.length || 0) > 0)) structureScore += 5;
  if ((extractedData.projects && extractedData.projects.length > 0) || (extractedData.certifications && extractedData.certifications.length > 0)) structureScore += 2;
  if (extractedData.summary && extractedData.summary.trim().length > 20) structureScore += 2;
  
  // Apply AI structural completeness rate modulation
  const modulatedStructure = Math.round(structureScore * 0.5 + (findings.structureCompletenessRate * 20) * 0.5);
  const finalStructureScore = Math.min(20, Math.max(4, modulatedStructure));

  // 3. Experience & Content Quality Score (Max 20 points)
  const experienceCount = extractedData.experience?.length || 0;
  const projectCount = extractedData.projects?.length || 0;
  let totalBullets = 0;
  extractedData.experience?.forEach(exp => totalBullets += (exp.bullets?.length || 0));
  extractedData.projects?.forEach(proj => totalBullets += (proj.bullets?.length || 0));

  let baseContentScore = 0;
  if (experienceCount + projectCount >= 3) baseContentScore += 8;
  else if (experienceCount + projectCount >= 1) baseContentScore += 5;

  if (totalBullets >= 6) baseContentScore += 6;
  else if (totalBullets >= 2) baseContentScore += 3;

  if (findings.experienceQualityRate > 0) {
    baseContentScore += Math.round(findings.experienceQualityRate * 6);
  } else {
    baseContentScore += 4;
  }
  const finalExperienceScore = Math.min(20, Math.max(3, baseContentScore));

  // 4. Skills Alignment Score (Max 15 points)
  const technicalSkillsCount = (extractedData.skills?.technical?.length || 0) + (extractedData.skills?.frameworksAndTools?.length || 0);
  let baseSkillsScore = 0;
  if (technicalSkillsCount >= 10) baseSkillsScore += 8;
  else if (technicalSkillsCount >= 5) baseSkillsScore += 6;
  else if (technicalSkillsCount >= 2) baseSkillsScore += 3;

  baseSkillsScore += Math.round(Math.min(1.0, Math.max(0.2, findings.skillsAlignmentRate)) * 7);
  const finalSkillsScore = Math.min(15, Math.max(2, baseSkillsScore));

  // 5. Keyword Relevance Score (Max 25 points)
  const keywordRate = Math.min(1.0, Math.max(0.1, findings.keywordRelevanceRate));
  const finalKeywordScore = Math.min(25, Math.max(3, Math.round(keywordRate * 25)));

  // 6. ATS Readability & Formatting Score (Max 10 points)
  const readabilityRate = Math.min(1.0, Math.max(0.2, findings.atsReadabilityRate));
  const finalReadabilityScore = Math.min(10, Math.max(2, Math.round(readabilityRate * 10)));

  // Calculate Total Score (Sum of all 6 pillars = 100)
  const totalScore = Math.min(100, Math.max(0, 
    finalKeywordScore + 
    finalStructureScore + 
    finalExperienceScore + 
    finalSkillsScore + 
    finalReadabilityScore + 
    contactScore
  ));

  const categoryScores: AtsCategoryScores = {
    keywordMatch: finalKeywordScore,
    structure: finalStructureScore,
    experienceQuality: finalExperienceScore,
    skillsAlignment: finalSkillsScore,
    atsReadability: finalReadabilityScore,
    contactInformation: contactScore,
  };

  // Optional job match score if job description was provided
  const jobMatchScore = hasJobDescription 
    ? Math.min(100, Math.max(10, Math.round((finalKeywordScore / 25 * 0.45 + finalSkillsScore / 15 * 0.35 + finalExperienceScore / 20 * 0.2) * 100)))
    : undefined;

  return {
    score: totalScore,
    categoryScores,
    jobMatchScore,
  };
}
