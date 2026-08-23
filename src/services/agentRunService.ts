import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AgentRun } from '../types';
import { api } from './api';

/**
 * Saves a completed or in-progress agent execution run to users/{userId}/agentRuns/{runId}
 */
export async function saveAgentRun(userId: string, run: AgentRun): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'agentRuns', run.id);
    await setDoc(docRef, {
      ...run,
      user_id: userId,
      created_at: run.created_at || new Date().toISOString(),
      updated_at: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving agent run to Firestore:', err);
    // Non-blocking: ensure UI workflow completes
  }
}

/**
 * Retrieves agent execution history for a user from users/{userId}/agentRuns
 */
export async function getAgentRuns(userId: string, maxRuns = 10): Promise<AgentRun[]> {
  try {
    const runsCol = collection(db, 'users', userId, 'agentRuns');
    const q = query(runsCol, orderBy('created_at', 'desc'), limit(maxRuns));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Fallback to server agent history
      return await api.getAgentHistory(userId);
    }

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data() as AgentRun;
      return {
        ...data,
        id: docSnap.id
      };
    });
  } catch (err) {
    console.error('Error fetching agent runs from Firestore:', err);
    return await api.getAgentHistory(userId);
  }
}

/**
 * Retrieves a single agent run by ID
 */
export async function getAgentRunById(userId: string, runId: string): Promise<AgentRun | null> {
  try {
    const docRef = doc(db, 'users', userId, 'agentRuns', runId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return {
        ...(snap.data() as AgentRun),
        id: snap.id
      };
    }
    return await api.getAgentRun(runId);
  } catch (err) {
    console.error('Error fetching single agent run from Firestore:', err);
    return await api.getAgentRun(runId);
  }
}
