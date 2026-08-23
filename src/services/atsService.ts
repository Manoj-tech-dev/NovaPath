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
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import { AtsReport, ResumeMetadata, ExtractedResumeData } from '../types';

/**
 * Helper to execute a promise with a timeout fallback
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs))
  ]);
}

/**
 * Uploads a resume file to Firebase Storage under resumes/{userId}/{resumeId}/{fileName}
 * and saves metadata to Firestore under users/{userId}/resumes/{resumeId}.
 * Safely guarded for demo/unauthenticated environments without blocking analysis.
 */
export async function uploadResumeToStorage(
  userId: string,
  file: File,
  resumeId?: string
): Promise<ResumeMetadata> {
  const actualResumeId = resumeId || `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `resumes/${userId}/${actualResumeId}/${file.name}`;

  // 1. Upload binary file to Firebase Storage if an active authenticated Firebase user exists
  const currentUser = auth.currentUser;
  if (currentUser && !currentUser.isAnonymous) {
    try {
      const storageRef = ref(storage, storagePath);
      await withTimeout(
        uploadBytes(storageRef, file, {
          contentType: file.type || 'application/octet-stream',
          customMetadata: {
            userId,
            resumeId: actualResumeId,
            fileName: file.name
          }
        }),
        3500,
        null
      );
    } catch (storageErr) {
      console.info('Firebase storage upload direct notification (proceeding with metadata sync):', storageErr);
    }
  }

  // 2. Save metadata to Firestore (No binary data in Firestore)
  const metadataDoc: ResumeMetadata = {
    id: actualResumeId,
    resumeId: actualResumeId,
    userId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storagePath,
    uploadedAt: new Date().toISOString(),
    status: 'UPLOADED'
  };

  try {
    const resumeDocRef = doc(db, `users/${userId}/resumes`, actualResumeId);
    await setDoc(resumeDocRef, {
      ...metadataDoc,
      createdAt: serverTimestamp()
    });
  } catch (fsErr) {
    console.warn('Firestore resume metadata set fallback:', fsErr);
  }

  return metadataDoc;
}

/**
 * Saves an ATS Analysis Report to Firestore under users/{userId}/atsReports/{reportId}
 */
export async function saveAtsReport(
  userId: string,
  report: AtsReport
): Promise<AtsReport> {
  const reportRef = doc(db, `users/${userId}/atsReports`, report.reportId || report.id);
  
  try {
    await setDoc(reportRef, {
      ...report,
      savedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore save ATS report fallback:', err);
  }

  return report;
}

/**
 * Fetches all previous ATS reports for the authenticated user from Firestore
 */
export async function getAtsReports(userId: string): Promise<AtsReport[]> {
  try {
    const reportsCol = collection(db, `users/${userId}/atsReports`);
    const q = query(reportsCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as AtsReport[];
    }
  } catch (err) {
    console.warn('Firestore get ATS reports query fallback:', err);
  }

  // Fallback to backend API
  try {
    const res = await fetch(`/api/ats/reports/${userId}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (apiErr) {
    console.error('Backend ATS reports fallback error:', apiErr);
  }

  return [];
}

/**
 * Fetches a single ATS report by reportId
 */
export async function getAtsReportById(userId: string, reportId: string): Promise<AtsReport | null> {
  try {
    const reportRef = doc(db, `users/${userId}/atsReports`, reportId);
    const snap = await getDoc(reportRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AtsReport;
    }
  } catch (err) {
    console.warn('Firestore single report fetch fallback:', err);
  }

  try {
    const res = await fetch(`/api/ats/reports/${userId}/${reportId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Deletes an ATS report and attempts to delete the associated storage resume file
 */
export async function deleteAtsReport(
  userId: string,
  reportId: string,
  resumeId?: string,
  fileName?: string
): Promise<boolean> {
  // 1. Delete from Firestore
  try {
    const reportRef = doc(db, `users/${userId}/atsReports`, reportId);
    await deleteDoc(reportRef);
  } catch (err) {
    console.warn('Firestore delete ATS report error:', err);
  }

  // 2. If resumeId provided, also remove resume metadata and file
  if (resumeId) {
    try {
      const resumeRef = doc(db, `users/${userId}/resumes`, resumeId);
      await deleteDoc(resumeRef);
    } catch {
      // ignore
    }

    if (fileName && auth.currentUser && !auth.currentUser.isAnonymous) {
      try {
        const storageRef = ref(storage, `resumes/${userId}/${resumeId}/${fileName}`);
        await withTimeout(deleteObject(storageRef), 2000, undefined);
      } catch {
        // ignore storage delete errors
      }
    }
  }

  // 3. Sync with backend API
  try {
    await fetch(`/api/ats/reports/${userId}/${reportId}`, { method: 'DELETE' });
  } catch {
    // ignore
  }

  return true;
}
