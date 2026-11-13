import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, getIndianStandardTime } from './firebase';

export interface RallyHighScore {
  id: string;
  playerName: string;
  score: number;
  timeFormatted: string;
  timeMs: number;
  topSpeed: number;
  stageName: string;
  date: string;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = 'ps_rally_3d_highscores_v1';

// Default authentic retro high scores
const DEFAULT_SCORES: RallyHighScore[] = [
  {
    id: 'legend-1',
    playerName: 'S. Pullingal (Dev)',
    score: 18500,
    timeFormatted: '01:14:8',
    timeMs: 74800,
    topSpeed: 178,
    stageName: 'Alpine Mountain Pass',
    date: '13 Nov 2026, 02:30 PM IST',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'legend-2',
    playerName: 'Nokia Champion',
    score: 15200,
    timeFormatted: '01:21:4',
    timeMs: 81400,
    topSpeed: 165,
    stageName: 'Forest Trail Rally',
    date: '12 Nov 2026, 06:15 PM IST',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'legend-3',
    playerName: 'WRC Speeder',
    score: 12800,
    timeFormatted: '01:29:1',
    timeMs: 89100,
    topSpeed: 152,
    stageName: 'Forest Trail Rally',
    date: '11 Nov 2026, 04:00 PM IST',
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'legend-4',
    playerName: 'Retro Racer 3D',
    score: 9600,
    timeFormatted: '01:38:5',
    timeMs: 98500,
    topSpeed: 142,
    stageName: 'Alpine Mountain Pass',
    date: '10 Nov 2026, 01:20 PM IST',
    timestamp: Date.now() - 259200000,
  },
];

function getLocalScores(): RallyHighScore[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_SCORES;
}

function setLocalScores(scores: RallyHighScore[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // ignore
  }
}

/**
 * Fetch top high scores from Firestore with local storage fallback
 */
export async function getTopHighScores(count: number = 10): Promise<RallyHighScore[]> {
  if (db && isFirebaseConfigured) {
    try {
      const colRef = collection(db, 'rally_highscores');
      const q = query(colRef, orderBy('score', 'desc'), limit(count));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const scores: RallyHighScore[] = [];
        snap.forEach((d) => {
          scores.push({ id: d.id, ...d.data() } as RallyHighScore);
        });
        setLocalScores(scores);
        return scores;
      }
    } catch (err) {
      console.warn('Firestore high scores fetch error, fallback to local:', err);
    }
  }
  return getLocalScores().slice(0, count);
}

/**
 * Subscribe to real-time high score updates from Firestore
 */
export function subscribeToHighScores(callback: (scores: RallyHighScore[]) => void) {
  if (db && isFirebaseConfigured) {
    try {
      const colRef = collection(db, 'rally_highscores');
      const q = query(colRef, orderBy('score', 'desc'), limit(10));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const scores: RallyHighScore[] = [];
            snap.forEach((d) => {
              scores.push({ id: d.id, ...d.data() } as RallyHighScore);
            });
            setLocalScores(scores);
            callback(scores);
          } else {
            callback(getLocalScores());
          }
        },
        (err) => {
          console.warn('Real-time high scores snapshot error:', err);
          callback(getLocalScores());
        }
      );
    } catch {
      callback(getLocalScores());
    }
  } else {
    callback(getLocalScores());
  }
  return () => {};
}

/**
 * Save new high score to Firestore & Local Storage (Create or Update)
 */
export async function saveHighScoreRecord(params: {
  playerName: string;
  score: number;
  timeFormatted: string;
  timeMs: number;
  topSpeed: number;
  stageName?: string;
}): Promise<{ success: boolean; id: string }> {
  const cleanName = params.playerName.trim() || 'Rally Driver';
  const id = `score_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newRecord: RallyHighScore = {
    id,
    playerName: cleanName,
    score: Math.round(params.score),
    timeFormatted: params.timeFormatted,
    timeMs: params.timeMs,
    topSpeed: Math.round(params.topSpeed),
    stageName: params.stageName || 'Forest Trail Rally',
    date: getIndianStandardTime(),
    timestamp: Date.now(),
  };

  // Always update local storage first
  const currentLocal = getLocalScores();
  const updatedLocal = [...currentLocal, newRecord]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  setLocalScores(updatedLocal);

  // Sync to Firestore
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'rally_highscores', id);
      await setDoc(docRef, newRecord);
      return { success: true, id };
    } catch (err) {
      console.warn('Failed to save high score to Firestore:', err);
    }
  }

  return { success: true, id };
}

/**
 * Update a high score player name (CRUD: Update)
 */
export async function updateHighScoreName(id: string, newName: string): Promise<boolean> {
  const cleanName = newName.trim();
  if (!cleanName) return false;

  // Local storage update
  const local = getLocalScores().map((s) => (s.id === id ? { ...s, playerName: cleanName } : s));
  setLocalScores(local);

  // Firestore update
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'rally_highscores', id);
      await updateDoc(docRef, { playerName: cleanName });
      return true;
    } catch (err) {
      console.warn('Firestore update error:', err);
    }
  }
  return true;
}

/**
 * Delete a high score record (CRUD: Delete)
 */
export async function deleteHighScoreRecord(id: string): Promise<boolean> {
  // Local storage delete
  const local = getLocalScores().filter((s) => s.id !== id);
  setLocalScores(local);

  // Firestore delete
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'rally_highscores', id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }
  }
  return true;
}
