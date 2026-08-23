import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Opportunity, Application, ApplicationStatus } from '../types';
import { api } from './api';

/**
 * Loads opportunities from the curated dataset and live external index.
 */
export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    return await api.getOpportunities();
  } catch (err) {
    console.error('Error fetching opportunities:', err);
    return [];
  }
}

/**
 * Retrieves all saved opportunities for a user from users/{userId}/savedOpportunities
 */
export async function getSavedOpportunities(userId: string): Promise<(Application & { opportunity?: Opportunity })[]> {
  try {
    const savedCol = collection(db, 'users', userId, 'savedOpportunities');
    const q = query(savedCol, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        user_id: userId,
        opportunity_id: data.opportunity_id || docSnap.id,
        status: data.status || 'SAVED',
        notes: data.notes || '',
        applied_date: data.applied_date || undefined,
        opportunity: data.opportunity || undefined,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : (data.created_at || new Date().toISOString()),
        updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : (data.updated_at || new Date().toISOString())
      };
    });
  } catch (err) {
    console.error('Error fetching saved opportunities from Firestore:', err);
    return [];
  }
}

/**
 * Saves or updates an opportunity to users/{userId}/savedOpportunities/{opportunityId}
 */
export async function saveOpportunity(
  userId: string,
  opportunity: Opportunity,
  status: ApplicationStatus = 'SAVED',
  notes?: string
): Promise<Application & { opportunity: Opportunity }> {
  try {
    const docRef = doc(db, 'users', userId, 'savedOpportunities', opportunity.id);
    const appRecord = {
      id: opportunity.id,
      user_id: userId,
      opportunity_id: opportunity.id,
      status,
      notes: notes || '',
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        organization: opportunity.organization,
        type: opportunity.type,
        location: opportunity.location,
        remote: opportunity.remote,
        skills: opportunity.skills,
        eligibility: opportunity.eligibility,
        deadline: opportunity.deadline,
        description: opportunity.description,
        source: opportunity.source,
        url: opportunity.url,
        source_type: opportunity.source_type,
        stipend_or_salary: opportunity.stipend_or_salary,
        created_at: opportunity.created_at || new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(docRef, {
      ...appRecord,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }, { merge: true });

    return appRecord;
  } catch (err) {
    console.error('Error saving opportunity to Firestore:', err);
    throw err;
  }
}

/**
 * Updates application status and notes in users/{userId}/savedOpportunities/{opportunityId}
 */
export async function updateSavedOpportunityStatus(
  userId: string,
  opportunityId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'savedOpportunities', opportunityId);
    await setDoc(docRef, {
      status,
      ...(notes !== undefined ? { notes } : {}),
      updated_at: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Error updating saved opportunity in Firestore:', err);
    throw err;
  }
}

/**
 * Removes a saved opportunity from users/{userId}/savedOpportunities/{opportunityId}
 */
export async function removeSavedOpportunity(userId: string, opportunityId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId, 'savedOpportunities', opportunityId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error removing saved opportunity from Firestore:', err);
    throw err;
  }
}
