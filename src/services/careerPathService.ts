import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  CareerPath, 
  CareerStepStatus, 
  UserProfile, 
  Opportunity,
  AtsReport
} from '../types';
import { calculateDeterministicReadinessScore } from './careerScoringService';

/**
 * Calls the backend API to generate a personalized career path using server-side Gemini
 */
export async function generateCareerPathAPI(params: {
  userId: string;
  targetRole: string;
  targetOpportunityId?: string;
  targetOpportunityTitle?: string;
  targetCompany?: string;
  targetJobDescription?: string;
  userProfile?: UserProfile | null;
  atsReport?: AtsReport | null;
}): Promise<CareerPath> {
  const res = await fetch('/api/career-path/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to generate personalized career path');
  }

  const data: CareerPath = await res.json();
  
  // Persist generated path to user's Firestore subcollection
  try {
    await saveCareerPath(params.userId, data);
  } catch (fsErr) {
    console.warn('Firestore async career path sync warning:', fsErr);
  }

  return data;
}

/**
 * Saves a Career Path to Firestore under users/{userId}/careerPaths/{careerPathId}
 */
export async function saveCareerPath(
  userId: string,
  careerPath: CareerPath
): Promise<CareerPath> {
  const pathId = careerPath.careerPathId || careerPath.id;
  const pathRef = doc(db, `users/${userId}/careerPaths`, pathId);

  try {
    await setDoc(pathRef, {
      ...careerPath,
      userId,
      savedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore save Career Path fallback:', err);
  }

  return careerPath;
}

/**
 * Fetches all Career Paths for the user from Firestore (with backend fallback)
 */
export async function getCareerPaths(userId: string): Promise<CareerPath[]> {
  try {
    const pathsCol = collection(db, `users/${userId}/careerPaths`);
    const q = query(pathsCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CareerPath[];
    }
  } catch (err) {
    console.warn('Firestore get career paths query fallback:', err);
  }

  // Fallback to backend API
  try {
    const res = await fetch(`/api/career-path/${userId}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (apiErr) {
    console.error('Backend career paths fallback error:', apiErr);
  }

  return [];
}

/**
 * Fetches a single Career Path by ID
 */
export async function getCareerPathById(userId: string, pathId: string): Promise<CareerPath | null> {
  try {
    const pathRef = doc(db, `users/${userId}/careerPaths`, pathId);
    const snap = await getDoc(pathRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as CareerPath;
    }
  } catch (err) {
    console.warn('Firestore single career path fetch fallback:', err);
  }

  try {
    const res = await fetch(`/api/career-path/${userId}/${pathId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Updates the completion status of a milestone step and dynamically recalculates readiness score
 */
export async function updateCareerStepStatus(
  userId: string,
  pathId: string,
  phaseId: string,
  stepId: string,
  newStatus: CareerStepStatus,
  currentPath: CareerPath,
  userProfile: UserProfile | null
): Promise<CareerPath> {
  // 1. Update the step status in the phases structure
  const updatedPhases = currentPath.phases.map(phase => {
    if (phase.id !== phaseId) return phase;
    return {
      ...phase,
      steps: phase.steps.map(step => {
        if (step.id !== stepId) return step;
        return {
          ...step,
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined
        };
      })
    };
  });

  // 2. Count total vs completed steps
  let totalSteps = 0;
  let completedSteps = 0;
  const newlyLearnedSkills: string[] = [];

  updatedPhases.forEach(p => {
    p.steps.forEach(s => {
      totalSteps += 1;
      if (s.status === 'COMPLETED') {
        completedSteps += 1;
        newlyLearnedSkills.push(...s.skillsToLearn);
      }
    });
  });

  // 3. Mark matching skill gaps as completed if their associated step was completed
  const updatedSkillGaps = currentPath.skillGaps.map(gap => {
    const isCovered = newlyLearnedSkills.some(
      s => s.toLowerCase().includes(gap.skill.toLowerCase()) || gap.skill.toLowerCase().includes(s.toLowerCase())
    );
    if (isCovered) {
      return { ...gap, status: 'MATCHED' as const, completed: true };
    }
    return gap;
  });

  // 4. Recalculate deterministic score
  const { score: newScore, breakdown: newBreakdown } = calculateDeterministicReadinessScore({
    user: userProfile,
    skillGaps: updatedSkillGaps,
    completedStepCount: completedSteps,
    totalStepCount: totalSteps
  });

  // 5. Update next action
  let nextAction = currentPath.nextAction;
  for (const p of updatedPhases) {
    const pendingStep = p.steps.find(s => s.status !== 'COMPLETED');
    if (pendingStep) {
      nextAction = {
        title: pendingStep.title,
        subtitle: `Phase ${p.phaseNumber}: ${p.title} • ${pendingStep.estimatedDuration}`,
        stepId: pendingStep.id,
        phaseId: p.id,
        actionType: pendingStep.recommendedProject ? 'BUILD' : 'LEARN'
      };
      break;
    }
  }

  const updatedPath: CareerPath = {
    ...currentPath,
    phases: updatedPhases,
    skillGaps: updatedSkillGaps,
    readinessScore: newScore,
    scoreBreakdown: newBreakdown,
    nextAction,
    updatedAt: new Date().toISOString()
  };

  // 6. Save in Firestore and sync to backend
  await saveCareerPath(userId, updatedPath);

  try {
    await fetch(`/api/career-path/${userId}/${pathId}/milestone`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phaseId,
        stepId,
        status: newStatus,
        updatedPath
      }),
    });
  } catch {
    // Ignore backend mirror error
  }

  return updatedPath;
}

/**
 * Deletes a Career Path
 */
export async function deleteCareerPath(userId: string, pathId: string): Promise<boolean> {
  try {
    const pathRef = doc(db, `users/${userId}/careerPaths`, pathId);
    await deleteDoc(pathRef);
  } catch (err) {
    console.warn('Firestore delete career path error:', err);
  }

  try {
    await fetch(`/api/career-path/${userId}/${pathId}`, { method: 'DELETE' });
  } catch {
    // ignore
  }

  return true;
}
