import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

export const DEFAULT_STUDENT_PROFILE: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
  name: 'Student Developer',
  email: '',
  degree: 'B.Tech',
  branch: 'Artificial Intelligence & Machine Learning',
  year: 2,
  location: 'Hyderabad',
  skills: ['Python', 'SQL', 'Machine Learning', 'Git', 'Pandas'],
  career_interests: ['AI/ML', 'Data Science'],
  preferred_opportunity_types: ['Internship', 'Research'],
  remote_preference: true,
};

/**
 * Retrieves the user profile from users/{userId}/profile/data in Cloud Firestore.
 * If none exists, creates and returns the default profile for the student.
 */
export async function getUserProfile(userId: string, defaultName?: string, defaultEmail?: string): Promise<UserProfile> {
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: userId,
        name: data.name || defaultName || 'Student User',
        email: data.email || defaultEmail || '',
        degree: data.degree || 'B.Tech',
        branch: data.branch || 'Artificial Intelligence & Machine Learning',
        year: typeof data.year === 'number' ? data.year : 2,
        location: data.location || 'Hyderabad',
        skills: Array.isArray(data.skills) ? data.skills : ['Python', 'SQL', 'Machine Learning', 'Git', 'Pandas'],
        career_interests: Array.isArray(data.career_interests) ? data.career_interests : ['AI/ML', 'Data Science'],
        preferred_opportunity_types: Array.isArray(data.preferred_opportunity_types) ? data.preferred_opportunity_types : ['Internship', 'Research'],
        remote_preference: typeof data.remote_preference === 'boolean' ? data.remote_preference : true,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : (data.created_at || new Date().toISOString()),
        updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : (data.updated_at || new Date().toISOString()),
      };
    }

    // Profile does not exist yet; initialize with default student background
    const initialProfile: UserProfile = {
      id: userId,
      name: defaultName || 'Student User',
      email: defaultEmail || '',
      degree: 'B.Tech',
      branch: 'Artificial Intelligence & Machine Learning',
      year: 2,
      location: 'Hyderabad',
      skills: ['Python', 'SQL', 'Machine Learning', 'Git', 'Pandas'],
      career_interests: ['AI/ML', 'Data Science'],
      preferred_opportunity_types: ['Internship', 'Research'],
      remote_preference: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(profileRef, {
      ...initialProfile,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    return initialProfile;
  } catch (err) {
    console.error('Error in getUserProfile from Firestore:', err);
    // Graceful fallback to default in-memory profile
    return {
      id: userId,
      name: defaultName || 'Student User',
      email: defaultEmail || '',
      degree: 'B.Tech',
      branch: 'Artificial Intelligence & Machine Learning',
      year: 2,
      location: 'Hyderabad',
      skills: ['Python', 'SQL', 'Machine Learning', 'Git', 'Pandas'],
      career_interests: ['AI/ML', 'Data Science'],
      preferred_opportunity_types: ['Internship', 'Research'],
      remote_preference: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Updates the user profile in Firestore at users/{userId}/profile/data
 */
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    const updatePayload = {
      ...data,
      updated_at: serverTimestamp()
    };
    await setDoc(profileRef, updatePayload, { merge: true });
    
    // Return updated profile snapshot
    return await getUserProfile(userId);
  } catch (err) {
    console.error('Error updating profile in Firestore:', err);
    throw err;
  }
}
