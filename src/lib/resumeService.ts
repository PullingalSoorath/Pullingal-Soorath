import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, getIndianStandardTime } from './firebase';

export interface ResumeMetadata {
  title: string;
  fileName: string;
  candidate: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  pagesCount: number;
  publicUrl: string;
  githubPagesUrl: string;
  summary: string;
  skills: string[];
}

export const DEFAULT_RESUME_INFO: ResumeMetadata = {
  title: 'Pullingal Soorath - Flutter Developer + UI / UX Designer Resume',
  fileName: 'Pullingal_Soorath_Resume.pdf',
  candidate: 'Pullingal Soorath',
  role: 'Flutter Developer + UI / UX Designer',
  email: 'pullingalsoorath@gmail.com',
  phone: '+91-7025 243 579',
  location: 'Neyyattinkara, Trivandrum, Kerala, India',
  fileSize: 133992,
  fileType: 'application/pdf',
  uploadedAt: '2026-11-13T17:48:00.000Z',
  pagesCount: 2,
  publicUrl: './Pullingal_Soorath_Resume.pdf',
  githubPagesUrl: 'https://pullingalsoorath.github.io/Pullingal-Soorath/Pullingal_Soorath_Resume.pdf',
  summary:
    'Self-Learned Flutter developer with a passion for designing exceptional user interfaces and crafting engaging mobile applications. Skilled in Flutter framework design and UI development.',
  skills: [
    'Flutter App Development',
    'UI/UX Design',
    'Push Notifications',
    'REST API Integration',
    'Firebase Integration',
    'BLoC & Provider',
    'SQFlite & Hive',
    'Razorpay Payment Integration',
    'Postman & Thunder Client',
    'HTML, CSS, Bootstrap',
    'Figma & Adobe XD',
    'Canva & Photoshop',
  ],
};

/**
 * Fetch latest resume record stored in Cloud Firestore.
 */
export async function fetchResumeMetadata(): Promise<ResumeMetadata> {
  if (!isFirebaseConfigured || !db) {
    return DEFAULT_RESUME_INFO;
  }

  try {
    const resumeRef = doc(db, 'resumes', 'latest');
    const snap = await getDoc(resumeRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_RESUME_INFO,
        ...data,
      } as ResumeMetadata;
    }
  } catch (err) {
    console.warn('Could not fetch resume metadata from Firestore, using local defaults:', err);
  }

  return DEFAULT_RESUME_INFO;
}

/**
 * Tracks a resume download event in Firestore analytics.
 */
export async function recordResumeDownload(source: string = 'web'): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  try {
    await addDoc(collection(db, 'resume_downloads'), {
      source,
      downloadedAtIST: getIndianStandardTime(),
      timestamp: serverTimestamp ? serverTimestamp() : Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    });
  } catch {
    // silently catch analytics errors
  }
}

/**
 * Initiates the direct browser download of the official 2-page PDF resume.
 */
export function downloadResumePdf(fileName: string = 'Pullingal_Soorath_Resume.pdf') {
  const link = document.createElement('a');
  link.href = `./${fileName}`;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  recordResumeDownload('direct_download_button');
}
