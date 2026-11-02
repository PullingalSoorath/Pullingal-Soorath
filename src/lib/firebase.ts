import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase credentials loaded from Vite environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { app, db, auth, storage, googleProvider };

export interface MessageSubmission {
  name: string;
  emailOrPhone: string;
  message: string;
  subject?: string;
  source: 'Smart Phone Messages App' | 'Connect Section';
}

/**
 * Returns the current time formatted to Indian Standard Time (IST, UTC+5:30)
 * in 12-hour format with AM/PM (e.g., "02 Nov 2026, 03:25:10 PM IST").
 */
export function getIndianStandardTime(date: Date = new Date()): string {
  try {
    const formatted = date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${formatted.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase())} IST`;
  } catch {
    // Fallback if Intl timeZone is unsupported
    const offset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + offset);
    return `${istDate.toUTCString().replace('GMT', 'IST')}`;
  }
}

/**
 * Saves contact/direct message into Cloud Firestore collection 'messages'.
 * Conforms to the structure:
 * Collection: 'messages'
 * Document: '<Name> - <Timestamp>'
 * Field '<Name>': { name, emailOrPhone, message, submittedAt }
 */
export async function saveMessageToFirestore(submission: MessageSubmission): Promise<{
  success: boolean;
  docId?: string;
  error?: string;
  savedLocally?: boolean;
}> {
  const cleanName = submission.name.trim() || 'Anonymous';
  const cleanContact = submission.emailOrPhone.trim();
  const cleanMessage = submission.message.trim();
  const indiaTime = getIndianStandardTime();
  const docId = `${cleanName.replace(/[/\\#?]/g, '_')} - ${Date.now()}`;

  // Data payload formatted with Indian Standard Time (12-hour format with AM/PM)
  const documentPayload = {
    name: cleanName,
    emailOrPhone: cleanContact,
    message: cleanMessage,
    subject: submission.subject || 'Direct Portfolio Message',
    source: submission.source,
    createdAt: indiaTime,
    submittedAtIso: indiaTime,
    timestamp: serverTimestamp ? serverTimestamp() : Date.now(),
    // Dedicated field named as the submitted person holding their details
    [cleanName]: {
      name: cleanName,
      emailOrPhone: cleanContact,
      message: cleanMessage,
      subject: submission.subject || 'Direct Portfolio Message',
      source: submission.source,
      submittedAt: indiaTime,
    },
  };

  // Always back up to localStorage buffer
  try {
    const existing = JSON.parse(localStorage.getItem('portfolio_messages_buffer') || '[]');
    existing.unshift({ docId, ...documentPayload, createdAt: indiaTime });
    localStorage.setItem('portfolio_messages_buffer', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Ignore localStorage quota errors
  }

  if (!isFirebaseConfigured || !db) {
    console.warn(
      'Firebase is not yet configured with valid credentials in .env. Message saved to local buffer:',
      documentPayload
    );
    return {
      success: true,
      docId,
      savedLocally: true,
    };
  }

  try {
    const docRef = doc(db, 'messages', docId);
    await setDoc(docRef, documentPayload);
    return {
      success: true,
      docId,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to save message to Firestore:', error);
    return {
      success: false,
      error: errorMessage,
      savedLocally: true,
    };
  }
}
