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
import { Memory, MemoryImportance, MemoryType } from '../types';

export const INITIAL_FIRESTORE_MEMORIES: Array<Omit<Memory, 'id' | 'created_at' | 'updated_at'>> = [
  {
    user_id: '',
    memory_type: 'PREFERENCE',
    memory_text: 'Student prefers Hyderabad and remote AI/ML internships.',
    importance: 'HIGH',
    category: 'Location & Work Style'
  },
  {
    user_id: '',
    memory_type: 'PREFERENCE',
    memory_text: 'Targeting summer 2026 roles in Python, Machine Learning, and Agent Orchestration.',
    importance: 'HIGH',
    category: 'Domain & Career'
  },
  {
    user_id: '',
    memory_type: 'PROFILE',
    memory_text: 'Enrolled in 2nd year B.Tech AI/ML with core background in Python, SQL, and Pandas.',
    importance: 'MEDIUM',
    category: 'Academic Background'
  }
];

/**
 * Retrieves all persistent memories for a given user from users/{userId}/memories
 */
export async function getMemories(userId: string): Promise<Memory[]> {
  try {
    const memCollection = collection(db, 'users', userId, 'memories');
    const q = query(memCollection, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed default memories if first-time user
      const seededList: Memory[] = [];
      for (const item of INITIAL_FIRESTORE_MEMORIES) {
        const docRef = doc(memCollection);
        const memObj: Memory = {
          id: docRef.id,
          user_id: userId,
          memory_type: item.memory_type,
          memory_text: item.memory_text,
          importance: item.importance,
          category: item.category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await setDoc(docRef, {
          ...memObj,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        seededList.push(memObj);
      }
      return seededList;
    }

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        user_id: userId,
        memory_type: data.memory_type || 'PREFERENCE',
        memory_text: data.memory_text || '',
        importance: data.importance || 'MEDIUM',
        category: data.category || 'General',
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : (data.created_at || new Date().toISOString()),
        updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : (data.updated_at || new Date().toISOString())
      };
    });
  } catch (err) {
    console.error('Error fetching memories from Firestore:', err);
    return [];
  }
}

/**
 * Saves a new persistent memory to users/{userId}/memories/{memoryId}
 */
export async function saveMemory(
  userId: string, 
  memData: {
    memory_type: MemoryType;
    memory_text: string;
    importance?: MemoryImportance;
    category?: string;
  }
): Promise<Memory> {
  try {
    const memCollection = collection(db, 'users', userId, 'memories');
    const docRef = doc(memCollection);
    const newMemory: Memory = {
      id: docRef.id,
      user_id: userId,
      memory_type: memData.memory_type,
      memory_text: memData.memory_text,
      importance: memData.importance || 'MEDIUM',
      category: memData.category || 'General',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(docRef, {
      ...newMemory,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    return newMemory;
  } catch (err) {
    console.error('Error saving memory to Firestore:', err);
    throw err;
  }
}

/**
 * Updates an existing memory item in users/{userId}/memories/{memoryId}
 */
export async function updateMemory(
  userId: string,
  memoryId: string,
  data: Partial<Memory>
): Promise<Memory> {
  try {
    const docRef = doc(db, 'users', userId, 'memories', memoryId);
    await setDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    }, { merge: true });

    const snap = await getDoc(docRef);
    const savedData = snap.data() || {};
    return {
      id: docRef.id,
      user_id: userId,
      memory_type: savedData.memory_type || 'PREFERENCE',
      memory_text: savedData.memory_text || '',
      importance: savedData.importance || 'MEDIUM',
      category: savedData.category || 'General',
      created_at: savedData.created_at?.toDate ? savedData.created_at.toDate().toISOString() : (savedData.created_at || new Date().toISOString()),
      updated_at: savedData.updated_at?.toDate ? savedData.updated_at.toDate().toISOString() : (savedData.updated_at || new Date().toISOString())
    };
  } catch (err) {
    console.error('Error updating memory in Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a memory item from users/{userId}/memories/{memoryId}
 */
export async function deleteMemory(userId: string, memoryId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId, 'memories', memoryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting memory from Firestore:', err);
    throw err;
  }
}
