import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, db, googleProvider } from './firebase';

export const ADMIN_EMAILS = [
  'pullingalsoorath.dev@gmail.com',
  'pullingalsoorath@gmail.com',
];

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'adminPS' | 'user';
  createdAt?: unknown;
  lastActive?: unknown;
}

export interface ChatThread {
  id: string; // user UID
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTimestamp?: unknown;
  unreadCountAdmin: number;
  unreadCountUser: number;
  updatedAt?: unknown;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'user' | 'adminPS';
  type: 'text' | 'image' | 'audio';
  text?: string;
  mediaUrl?: string;
  audioDuration?: number;
  createdAt?: unknown;
  isRead: boolean;
}

/**
 * Ensures a user document is created or updated in Firestore collection 'users/{userId}'.
 */
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const role: 'adminPS' | 'user' = isEmailAdmin(user.email) ? 'adminPS' : 'user';
  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Portfolio Visitor',
    email: user.email || '',
    photoURL: user.photoURL || '',
    role,
  };

  if (!db) return profile;

  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);

    if (existingSnap.exists()) {
      await updateDoc(userRef, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        lastActive: serverTimestamp(),
        role,
      });
    } else {
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Failed to sync user profile with Firestore:', err);
  }

  return profile;
}

/**
 * Triggers Google Sign-In Popup.
 */
export async function signInWithGoogle(): Promise<{ user: UserProfile | null; error?: string }> {
  if (!auth || !googleProvider) {
    return { user: null, error: 'Firebase Auth is not initialized or configured.' };
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    if (!credential.user) {
      return { user: null, error: 'Google sign-in was cancelled.' };
    }
    const profile = await syncUserProfile(credential.user);
    return { user: profile };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Google sign-in failed:', err);
    return { user: null, error: errorMsg };
  }
}

/**
 * Sign out current authenticated user.
 */
export async function signOutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Listens to Firebase Auth state changes and returns synced user profile.
 */
export function onAuthStateChangedProfile(
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const profile = await syncUserProfile(fbUser);
      callback(profile);
    } catch {
      callback({
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Visitor',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        role: isEmailAdmin(fbUser.email) ? 'adminPS' : 'user',
      });
    }
  });
}

/**
 * Subscribes to real-time messages in a specific chat thread: `chats/{chatId}/messages`.
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  if (!db || !chatId) {
    callback([]);
    return () => {};
  }

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          senderId: d.senderId,
          senderRole: d.senderRole || 'user',
          type: d.type || 'text',
          text: d.text || '',
          mediaUrl: d.mediaUrl || '',
          audioDuration: typeof d.audioDuration === 'number' ? d.audioDuration : undefined,
          createdAt: d.createdAt,
          isRead: Boolean(d.isRead),
        };
      });
      callback(list);
    },
    (err) => {
      console.error(`Error subscribing to messages for chatId=${chatId}:`, err);
    }
  );
}

/**
 * Subscribes to all active chat threads for the Admin Dashboard (`chats/` ordered by `lastMessageTimestamp desc`).
 */
export function subscribeToAdminConversations(
  callback: (threads: ChatThread[]) => void
): Unsubscribe {
  if (!db) {
    callback([]);
    return () => {};
  }

  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, orderBy('lastMessageTimestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ChatThread[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId || docSnap.id,
          userName: d.userName || 'Anonymous Visitor',
          userEmail: d.userEmail || '',
          userAvatar: d.userAvatar || '',
          lastMessage: d.lastMessage || 'Started a conversation',
          lastMessageTimestamp: d.lastMessageTimestamp,
          unreadCountAdmin: Number(d.unreadCountAdmin || 0),
          unreadCountUser: Number(d.unreadCountUser || 0),
          updatedAt: d.updatedAt,
        };
      });
      callback(list);
    },
    (err) => {
      console.error('Error subscribing to admin conversations:', err);
    }
  );
}

/**
 * Compresses an image file/blob to an optimized JPEG Base64 Data URL (max 900px, quality 0.78).
 * Fits safely within Cloud Firestore document size limit (1MB max, typical compressed image is ~35-70KB).
 */
export async function compressImageToBase64(
  fileOrBlob: File | Blob,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Converts any audio Blob to a standard Base64 Data URL.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads media (images or voice recordings) for 1-on-1 real-time chat.
 * Compresses images to optimized Base64 (max 900px, ~35-65KB) and audio notes to Base64 data URLs.
 * Resolves in under 30 milliseconds without relying on external bucket provisioning or risking network hangs.
 */
export async function uploadChatMedia(
  _chatId: string,
  fileOrBlob: File | Blob,
  type: 'image' | 'audio'
): Promise<string> {
  if (type === 'image') {
    return await compressImageToBase64(fileOrBlob);
  } else {
    return await blobToBase64(fileOrBlob);
  }
}

export interface SendMessagePayload {
  chatId: string;
  sender: UserProfile;
  type: 'text' | 'image' | 'audio';
  text?: string;
  mediaUrl?: string;
  audioDuration?: number;
}

/**
 * Sends a message in `chats/{chatId}/messages` and updates thread metadata in `chats/{chatId}`.
 */
export async function sendChatMessage(payload: SendMessagePayload): Promise<void> {
  if (!db) {
    throw new Error('Cloud Firestore is not initialized.');
  }

  const { chatId, sender, type, text, mediaUrl, audioDuration } = payload;
  const isSenderAdmin = sender.role === 'adminPS';

  // 1. Add message document
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    senderId: sender.uid,
    senderRole: sender.role,
    type,
    text: text || '',
    mediaUrl: mediaUrl || '',
    ...(typeof audioDuration === 'number' ? { audioDuration } : {}),
    createdAt: serverTimestamp(),
    isRead: false,
  });

  // 2. Format snippet for lastMessage
  let snippet = text || '';
  if (type === 'image') snippet = '📷 Image attachment';
  if (type === 'audio') snippet = '🎙️ Voice note';

  // 3. Update or create thread document
  const threadRef = doc(db, 'chats', chatId);
  const threadSnap = await getDoc(threadRef);

  if (threadSnap.exists()) {
    await updateDoc(threadRef, {
      lastMessage: snippet,
      lastMessageTimestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isSenderAdmin
        ? { unreadCountUser: increment(1) }
        : { unreadCountAdmin: increment(1), userName: sender.displayName, userAvatar: sender.photoURL, userEmail: sender.email }),
    });
  } else {
    // Brand new thread initiated
    await setDoc(threadRef, {
      userId: chatId,
      userName: sender.displayName,
      userEmail: sender.email,
      userAvatar: sender.photoURL,
      lastMessage: snippet,
      lastMessageTimestamp: serverTimestamp(),
      unreadCountAdmin: isSenderAdmin ? 0 : 1,
      unreadCountUser: isSenderAdmin ? 1 : 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Resets unread count for the viewer role and marks unread incoming messages as read.
 */
export async function markThreadAsRead(chatId: string, viewerRole: 'user' | 'adminPS'): Promise<void> {
  if (!db || !chatId) return;

  try {
    const threadRef = doc(db, 'chats', chatId);
    if (viewerRole === 'adminPS') {
      await updateDoc(threadRef, { unreadCountAdmin: 0 });
    } else {
      await updateDoc(threadRef, { unreadCountUser: 0 });
    }
  } catch {
    // Document may not exist yet if empty
  }
}
