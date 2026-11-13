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
  name: string; // 2-15 chars, required by firestore security rules
  score: number;
  stage: string;
  timeFormatted: string;
  timeMs: number;
  topSpeed: number;
  date: string;
  timestamp: number;
}

const FIRESTORE_COLLECTION = 'rally3d_highscores';
const LOCAL_STORAGE_KEY = 'ps_rally3d_highscores_v2';

// Default authentic Nokia Rally 3D World Records
const DEFAULT_LEGEND_SCORES: RallyHighScore[] = [
  {
    id: 'legend-1',
    name: 'S. Pullingal',
    score: 18500,
    stage: 'Desert Canyon',
    timeFormatted: '01:14:8',
    timeMs: 74800,
    topSpeed: 184,
    date: '13 Nov 2026, 02:30 PM IST',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'legend-2',
    name: 'Nokia Champion',
    score: 15200,
    stage: 'Alpine Snow',
    timeFormatted: '01:21:4',
    timeMs: 81400,
    topSpeed: 172,
    date: '12 Nov 2026, 06:15 PM IST',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'legend-3',
    name: 'WRC Speeder',
    score: 12800,
    stage: 'Forest Dirt',
    timeFormatted: '01:29:1',
    timeMs: 89100,
    topSpeed: 161,
    date: '11 Nov 2026, 04:00 PM IST',
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'legend-4',
    name: 'Retro Racer',
    score: 9600,
    stage: 'Forest Dirt',
    timeFormatted: '01:38:5',
    timeMs: 98500,
    topSpeed: 148,
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
  return DEFAULT_LEGEND_SCORES;
}

function setLocalScores(scores: RallyHighScore[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // ignore
  }
}

/**
 * Validate player name (Firestore rules requirement: 2 to 15 characters string)
 */
export function validatePlayerName(name: string): { isValid: boolean; error?: string } {
  const trimmed = (name || '').trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  if (trimmed.length > 15) {
    return { isValid: false, error: 'Name cannot exceed 15 characters' };
  }
  return { isValid: true };
}

/**
 * Fetch top high scores from Firestore with graceful localStorage fallback
 */
export async function getTopScores(limitCount: number = 10): Promise<RallyHighScore[]> {
  if (db && isFirebaseConfigured) {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const q = query(colRef, orderBy('score', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const scores: RallyHighScore[] = [];
        snap.forEach((d) => {
          const data = d.data();
          scores.push({
            id: d.id,
            name: data.name || 'Anonymous',
            score: Number(data.score) || 0,
            stage: data.stage || 'Forest Dirt',
            timeFormatted: data.timeFormatted || '--:--:-',
            timeMs: Number(data.timeMs) || 0,
            topSpeed: Number(data.topSpeed) || 0,
            date: data.date || getIndianStandardTime(),
            timestamp: Number(data.timestamp) || Date.now(),
          });
        });
        setLocalScores(scores);
        return scores;
      }
    } catch (err) {
      console.warn('Firestore high scores fetch error, falling back to local storage:', err);
    }
  }
  return getLocalScores().slice(0, limitCount);
}

/**
 * Get current #1 World Record holder
 */
export async function getWorldRecord(): Promise<RallyHighScore> {
  const scores = await getTopScores(1);
  return scores[0] || DEFAULT_LEGEND_SCORES[0];
}

/**
 * Real-time subscription to global leaderboard changes
 */
export function subscribeToLeaderboard(callback: (scores: RallyHighScore[]) => void) {
  if (db && isFirebaseConfigured) {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const q = query(colRef, orderBy('score', 'desc'), limit(10));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const scores: RallyHighScore[] = [];
            snap.forEach((d) => {
              const data = d.data();
              scores.push({
                id: d.id,
                name: data.name || 'Anonymous',
                score: Number(data.score) || 0,
                stage: data.stage || 'Forest Dirt',
                timeFormatted: data.timeFormatted || '--:--:-',
                timeMs: Number(data.timeMs) || 0,
                topSpeed: Number(data.topSpeed) || 0,
                date: data.date || getIndianStandardTime(),
                timestamp: Number(data.timestamp) || Date.now(),
              });
            });
            setLocalScores(scores);
            callback(scores);
          } else {
            callback(getLocalScores());
          }
        },
        (err) => {
          console.warn('Leaderboard snapshot warning:', err);
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
 * Create a new high score entry in Firestore & localStorage (CRUD: Create)
 */
export async function createScore(params: {
  name: string;
  score: number;
  stage?: string;
  timeFormatted?: string;
  timeMs?: number;
  topSpeed?: number;
}): Promise<{ success: boolean; id: string; error?: string }> {
  const validation = validatePlayerName(params.name);
  if (!validation.isValid) {
    return { success: false, id: '', error: validation.error };
  }

  const cleanName = params.name.trim();
  const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const record: RallyHighScore = {
    id,
    name: cleanName,
    score: Math.round(Number(params.score) || 0),
    stage: params.stage || 'Forest Dirt',
    timeFormatted: params.timeFormatted || '00:00:0',
    timeMs: Math.round(Number(params.timeMs) || 0),
    topSpeed: Math.round(Number(params.topSpeed) || 0),
    date: getIndianStandardTime(),
    timestamp: Date.now(),
  };

  // Always update local cache first
  const localList = getLocalScores();
  const updatedList = [...localList, record].sort((a, b) => b.score - a.score).slice(0, 20);
  setLocalScores(updatedList);

  // Sync to Firestore
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await setDoc(docRef, {
        name: record.name,
        score: record.score,
        stage: record.stage,
        timeFormatted: record.timeFormatted,
        timeMs: record.timeMs,
        topSpeed: record.topSpeed,
        date: record.date,
        timestamp: record.timestamp,
      });
      return { success: true, id };
    } catch (err: any) {
      console.warn('Firestore highscore creation failed:', err);
      return { success: true, id, error: err?.message };
    }
  }

  return { success: true, id };
}

/**
 * Update record holder player name (CRUD: Update)
 */
export async function updateRecordHolder(
  id: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const validation = validatePlayerName(newName);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const cleanName = newName.trim();

  // Local storage update
  const local = getLocalScores().map((s) => (s.id === id ? { ...s, name: cleanName } : s));
  setLocalScores(local);

  // Firestore update
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await updateDoc(docRef, { name: cleanName });
      return { success: true };
    } catch (err: any) {
      console.warn('Firestore update error (requires auth/admin rules):', err);
      // Return success because local cache updated
      return { success: true, error: err?.message };
    }
  }

  return { success: true };
}

/**
 * Delete a high score entry (CRUD: Delete)
 */
export async function deleteScore(id: string): Promise<{ success: boolean; error?: string }> {
  // Local storage delete
  const local = getLocalScores().filter((s) => s.id !== id);
  setLocalScores(local);

  // Firestore delete
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (err: any) {
      console.warn('Firestore delete error (requires auth/admin rules):', err);
      return { success: true, error: err?.message };
    }
  }

  return { success: true };
}
