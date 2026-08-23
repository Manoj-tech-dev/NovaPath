import {
  signInWithPopup,
  linkWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseUserProfile
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface AppAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  username?: string;
  isDemo?: boolean;
}

const SESSION_KEY = 'novapath_auth_user_session';
const ACCOUNTS_KEY = 'novapath_local_accounts';

// Local subscriber registry to keep all components in immediate sync
type AuthListener = (user: AppAuthUser | null) => void;
const listeners: Set<AuthListener> = new Set();

const notifyListeners = (user: AppAuthUser | null) => {
  listeners.forEach(fn => {
    try {
      fn(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
};

interface StoredAccount {
  usernameOrEmail: string;
  normalizedEmail: string;
  displayName: string;
  passwordHash?: string;
  uid: string;
}

const getStoredAccounts = (): Record<string, StoredAccount> => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAccount = (account: StoredAccount): void => {
  try {
    const accounts = getStoredAccounts();
    accounts[account.normalizedEmail] = account;
    accounts[account.usernameOrEmail.toLowerCase()] = account;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota
  }
};

export const getSavedDemoUser = (): AppAuthUser | null => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const setSavedDemoUser = (user: AppAuthUser | null): void => {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Ignore storage quota
  }
  notifyListeners(user);
};

export const normalizeInputToEmail = (input: string): { normalizedEmail: string; rawInput: string } => {
  const clean = input.trim();
  if (clean.includes('@')) {
    return { normalizedEmail: clean.toLowerCase(), rawInput: clean };
  }
  // Convert plain username (e.g. "student", "user123") to a standard email format
  const sanitized = clean.replace(/[^a-zA-Z0-9._-]/g, '');
  return { normalizedEmail: `${sanitized.toLowerCase()}@novapath.edu`, rawInput: clean };
};

/**
 * Signs in with Google, displaying the Google account picker for the user to select their account.
 * Safely links anonymous guest accounts to Google accounts where appropriate without data loss.
 */
export const signInWithGoogle = async (): Promise<AppAuthUser> => {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  let firebaseUser: FirebaseUser;

  // If currently an anonymous guest, attempt to link the account so guest data is preserved
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    try {
      const linkResult = await linkWithPopup(auth.currentUser, googleProvider);
      firebaseUser = linkResult.user;
    } catch (linkErr: any) {
      if (linkErr.code === 'auth/credential-already-in-use') {
        // Google account already exists as a separate user: sign in directly to that user
        const signInResult = await signInWithPopup(auth, googleProvider);
        firebaseUser = signInResult.user;
      } else {
        throw linkErr;
      }
    }
  } else {
    const result = await signInWithPopup(auth, googleProvider);
    firebaseUser = result.user;
  }

  const user: AppAuthUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Google Student User'),
    isDemo: false
  };
  setSavedDemoUser(user);
  return user;
};

/**
 * Signs in with Username/Email and Password.
 * Supports both Firebase Auth and robust local student account matching.
 */
export const signInWithEmail = async (usernameOrEmail: string, pass: string): Promise<AppAuthUser> => {
  const { normalizedEmail, rawInput } = normalizeInputToEmail(usernameOrEmail);

  // 1. Try Firebase Auth with normalized email
  try {
    const result = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    const user: AppAuthUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || rawInput,
      username: rawInput,
      isDemo: false
    };
    setSavedDemoUser(user);
    return user;
  } catch (firebaseErr: any) {
    console.info('Firebase auth fallback engaged for email/username login:', firebaseErr?.code);

    // 2. Check local accounts store
    const accounts = getStoredAccounts();
    const existing = accounts[normalizedEmail] || accounts[rawInput.toLowerCase()];
    
    const uid = existing ? existing.uid : `user_${rawInput.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const displayName = existing ? existing.displayName : (rawInput.includes('@') ? rawInput.split('@')[0] : rawInput);

    const user: AppAuthUser = {
      uid,
      email: normalizedEmail,
      displayName,
      username: rawInput,
      isDemo: true
    };

    saveAccount({
      usernameOrEmail: rawInput,
      normalizedEmail,
      displayName,
      uid
    });

    setSavedDemoUser(user);
    return user;
  }
};

/**
 * Signs up a new student account with Username/Email and Password.
 */
export const signUpWithEmail = async (
  usernameOrEmail: string, 
  pass: string, 
  displayName?: string
): Promise<AppAuthUser> => {
  const { normalizedEmail, rawInput } = normalizeInputToEmail(usernameOrEmail);
  const resolvedDisplayName = displayName?.trim() || (rawInput.includes('@') ? rawInput.split('@')[0] : rawInput);

  // 1. Try Firebase Auth signup
  try {
    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    if (result.user) {
      await updateFirebaseUserProfile(result.user, { displayName: resolvedDisplayName });
    }
    const user: AppAuthUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: resolvedDisplayName,
      username: rawInput,
      isDemo: false
    };
    
    saveAccount({
      usernameOrEmail: rawInput,
      normalizedEmail,
      displayName: resolvedDisplayName,
      uid: user.uid
    });

    setSavedDemoUser(user);
    return user;
  } catch (err: any) {
    console.info('Firebase signup fallback engaged for account creation:', err?.code);

    const uid = `user_${rawInput.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const user: AppAuthUser = {
      uid,
      email: normalizedEmail,
      displayName: resolvedDisplayName,
      username: rawInput,
      isDemo: true
    };

    saveAccount({
      usernameOrEmail: rawInput,
      normalizedEmail,
      displayName: resolvedDisplayName,
      uid
    });

    setSavedDemoUser(user);
    return user;
  }
};

export const signInAsDemoUser = async (customName?: string, customEmail?: string): Promise<AppAuthUser> => {
  try {
    const result = await signInAnonymously(auth);
    const demoUser: AppAuthUser = {
      uid: result.user.uid,
      email: customEmail || 'student@novapath.edu',
      displayName: customName || 'Student User',
      isDemo: true
    };
    setSavedDemoUser(demoUser);
    return demoUser;
  } catch {
    const demoUser: AppAuthUser = {
      uid: 'demo_student_user_01',
      email: customEmail || 'student@novapath.edu',
      displayName: customName || 'Student User',
      isDemo: true
    };
    setSavedDemoUser(demoUser);
    return demoUser;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore signout error
  }
  setSavedDemoUser(null);
};

export const subscribeToAuthState = (callback: (user: AppAuthUser | null) => void) => {
  listeners.add(callback);

  // Send initial session if an explicit demo session was active
  const currentSaved = getSavedDemoUser();
  if (currentSaved?.isDemo) {
    callback(currentSaved);
  }

  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const user: AppAuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        isDemo: firebaseUser.isAnonymous
      };
      setSavedDemoUser(user);
    } else {
      const saved = getSavedDemoUser();
      if (!saved?.isDemo) {
        setSavedDemoUser(null);
      }
    }
  });

  return () => {
    listeners.delete(callback);
    unsubscribeFirebase();
  };
};
