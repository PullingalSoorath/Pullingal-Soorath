import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Play,
  Pause,
  LogOut,
  ShieldCheck,
  Check,
  CheckCheck,
  X,
  Download,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  Maximize2,
  Volume2,
  ChevronLeft,
  MapPin,
  Mail,
  Phone,
  FileText,
  Sidebar,
} from 'lucide-react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedProfile,
  subscribeToMessages,
  subscribeToAdminConversations,
  sendChatMessage,
  uploadChatMedia,
  markThreadAsRead,
  type UserProfile,
  type ChatMessage,
  type ChatThread,
} from '../../../lib/chatService';
import { sound } from '../../audio/audioEngine';

interface RealtimeChatAppProps {
  onOpenCVModal?: () => void;
  isTablet?: boolean;
  onGoHome?: () => void;
}

// Format timestamp helper
function formatTime(timestamp: unknown): string {
  if (!timestamp) return 'Just now';
  try {
    // If Firestore Timestamp object with toDate()
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      const date = (timestamp as { toDate: () => Date }).toDate();
      return date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch {
    // fallback
  }
  return 'Just now';
}

export const RealtimeChatApp: React.FC<RealtimeChatAppProps> = ({
  isTablet = false,
  onOpenCVModal,
  onGoHome,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Visitor Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Admin Dashboard State
  const [adminThreads, setAdminThreads] = useState<ChatThread[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<ChatThread | null>(null);

  // Auto-select first thread for admin on tablet
  useEffect(() => {
    if (isTablet && currentUser?.role === 'adminPS' && !selectedChatUser && adminThreads.length > 0) {
      setSelectedChatUser(adminThreads[0]);
    }
  }, [isTablet, currentUser?.role, selectedChatUser, adminThreads]);

  // Media Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Image & File picker
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChangedProfile((profile) => {
      setCurrentUser(profile);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Admin Threads if adminPS
  useEffect(() => {
    if (currentUser?.role === 'adminPS') {
      const unsub = subscribeToAdminConversations((threads) => {
        setAdminThreads(threads);
      });
      return () => unsub();
    }
  }, [currentUser?.role]);

  // Determine active conversation chatId
  const activeChatId =
    currentUser?.role === 'adminPS'
      ? selectedChatUser?.id || null
      : currentUser?.uid || null;

  // Subscribe to Messages for active conversation
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    // Mark as read when entering
    if (currentUser) {
      markThreadAsRead(activeChatId, currentUser.role);
    }

    const unsub = subscribeToMessages(activeChatId, (msgs) => {
      setMessages(msgs);
      if (currentUser) {
        markThreadAsRead(activeChatId, currentUser.role);
      }
    });

    return () => unsub();
  }, [activeChatId, currentUser]);

  // Handle Escape key to dismiss full image popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    sound.playClick();
    setAuthError(null);
    setLoadingAuth(true);
    const res = await signInWithGoogle();
    setLoadingAuth(false);
    if (res.error) {
      setAuthError(res.error);
    } else {
      sound.playSuccess();
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    sound.playClick();
    await signOutUser();
    setSelectedChatUser(null);
    setMessages([]);
  };

  // Send Text Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeChatId || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    sound.playClick();

    try {
      await sendChatMessage({
        chatId: activeChatId,
        sender: currentUser,
        type: 'text',
        text,
      });
      sound.playChirp(880, 0.05);
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
      // Revert text on failure
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Image Upload with instant optimistic screen preview
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !activeChatId) return;

    sound.playClick();
    setIsSending(true);

    // Create an immediate local preview object URL so the user sees it instantly on the chat screen
    let previewUrl: string | null = null;
    try {
      previewUrl = URL.createObjectURL(file);
      setUploadingPreview(previewUrl);
    } catch {
      // ignore
    }

    try {
      const mediaUrl = await uploadChatMedia(activeChatId, file, 'image');
      await sendChatMessage({
        chatId: activeChatId,
        sender: currentUser,
        type: 'image',
        mediaUrl,
      });
      sound.playSuccess();
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please check your connection.');
    } finally {
      setIsSending(false);
      setUploadingPreview(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start Voice Note Recording with resilient browser MIME detection
  const startRecording = async () => {
    sound.playClick();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Detect best supported audio MIME type across Chrome, Safari, Edge, Firefox
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';
        }
      } else {
        mimeType = '';
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record voice notes.');
    }
  };

  // Stop and Cancel Voice Note Recording
  const cancelRecording = () => {
    sound.playClick();
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  // Stop and Send Voice Note Recording
  const stopAndSendRecording = () => {
    sound.playClick();
    const duration = Math.max(1, recordingSeconds);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (!mediaRecorderRef.current || !currentUser || !activeChatId) {
      cancelRecording();
      return;
    }

    const mr = mediaRecorderRef.current;
    mr.onstop = async () => {
      mr.stream.getTracks().forEach((t) => t.stop());
      const mime = mr.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mime });
      if (audioBlob.size < 50) {
        setIsRecording(false);
        return;
      }

      setIsSending(true);
      try {
        const mediaUrl = await uploadChatMedia(activeChatId, audioBlob, 'audio');
        await sendChatMessage({
          chatId: activeChatId,
          sender: currentUser,
          type: 'audio',
          mediaUrl,
          audioDuration: duration,
        });
        sound.playSuccess();
      } catch (err) {
        console.error('Audio upload failed:', err);
        alert('Failed to send voice note.');
      } finally {
        setIsSending(false);
        setIsRecording(false);
        setRecordingSeconds(0);
        audioChunksRef.current = [];
      }
    };

    if (mr.state !== 'inactive') {
      mr.stop();
    }
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // -------------------------------------------------------------
  // VIEW 1: UNAUTHENTICATED ONBOARDING SCREEN
  // -------------------------------------------------------------
  if (!currentUser && !loadingAuth) {
    return (
      <div className="flex flex-col h-full w-full bg-[#030914] text-white p-4 justify-between relative overflow-hidden select-none">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {onGoHome && (
              <button
                onClick={() => {
                  sound.playClick();
                  onGoHome();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-[#00F5FF] border border-cyan-500/30 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer active:scale-95 mr-1"
                title="Return to Home Screen"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <MessageSquare className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-space text-white flex items-center gap-1.5">
                Live 1-on-1 Chat
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[#00F5FF] border border-cyan-500/30">
                  Firebase
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Direct channel with Pullingal Soorath</p>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="my-auto text-center space-y-4 z-10 py-4">
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00F5FF] shadow-[0_0_25px_rgba(0,245,255,0.35)] p-0.5 bg-black/50">
              <img
                src="./profile-neon.jpg"
                alt="Pullingal Soorath"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Pullingal Soorath</h3>
            <p className="text-xs text-cyan-400 font-mono">Professional Flutter Developer &bull; UI/UX Architect</p>
            <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto mt-2 leading-relaxed">
              Connect directly for job opportunities, mobile app inquiries, technical interviews, or quick questions.
            </p>
          </div>

          <div className="space-y-2 max-w-[280px] mx-auto">
            <button
              onClick={handleSignIn}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 active:scale-98 transition-all duration-200 cursor-pointer"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15s.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {authError && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-1.5 text-left">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-2">{authError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="z-10 border-t border-white/5 pt-2.5 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> End-to-end Isolation
          </span>
          <span>Admin Auto-Routing PS</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LOADING AUTH
  // -------------------------------------------------------------
  if (loadingAuth) {
    return (
      <div className="flex flex-col h-full w-full bg-[#030914] items-center justify-center space-y-3 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#00F5FF] border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-cyan-400">Authenticating Firebase Stream...</span>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: ADMIN CONVERSATIONS DASHBOARD (role === 'adminPS' and no user selected on smartphone)
  // -------------------------------------------------------------
  if (currentUser?.role === 'adminPS' && !selectedChatUser && !isTablet) {
    return (
      <div className="flex flex-col h-full w-full bg-[#030914] text-white overflow-hidden">
        {/* Admin Console Header */}
        <div className="p-3 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onGoHome && (
              <button
                onClick={() => {
                  sound.playClick();
                  onGoHome();
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-[#00F5FF] flex items-center gap-1 text-xs font-mono font-bold cursor-pointer"
                title="Return to Home Screen"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-violet-300">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">PS Admin Console</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 font-mono border border-violet-500/30">
                  adminPS
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {adminThreads.length} conversation{adminThreads.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {adminThreads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p className="text-xs">No active conversations yet.</p>
              <p className="text-[10px] text-slate-500">
                When visitors sign in and send a message, their threads will appear here in real-time.
              </p>
            </div>
          ) : (
            adminThreads.map((thread) => {
              const hasUnread = thread.unreadCountAdmin > 0;
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedChatUser(thread);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    hasUnread
                      ? 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                      : 'bg-slate-900/50 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="relative shrink-0">
                    {thread.userAvatar ? (
                      <img
                        src={thread.userAvatar}
                        alt={thread.userName}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs">
                        {thread.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00F5FF] text-black text-[9px] font-bold flex items-center justify-center shadow">
                        {thread.unreadCountAdmin}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{thread.userName}</span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {formatTime(thread.lastMessageTimestamp)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{thread.userEmail}</p>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        hasUnread ? 'text-[#00F5FF] font-medium' : 'text-slate-300'
                      }`}
                    >
                      {thread.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: ACTIVE CHAT SCREEN (Visitor or Admin in a specific thread)
  // -------------------------------------------------------------
  const isAdminView = currentUser?.role === 'adminPS';
  const partnerName = isAdminView
    ? selectedChatUser?.userName || 'Visitor'
    : 'Pullingal Soorath';
  const partnerEmail = isAdminView ? selectedChatUser?.userEmail || '' : 'pullingalsoorath@gmail.com';
  const partnerAvatar = isAdminView
    ? selectedChatUser?.userAvatar || ''
    : './profile-neon.jpg';

  return (
    <div className="flex flex-col h-full w-full bg-[#030914] text-white overflow-hidden relative">
      {/* Top App Bar */}
      <div className="px-3.5 py-2 bg-slate-900/95 border-b border-cyan-500/20 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          {/* Home Button (Returns to One UI home screen) */}
          {onGoHome && (
            <button
              onClick={() => {
                sound.playClick();
                onGoHome();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-[#00F5FF] border border-cyan-500/30 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer active:scale-95"
              title="Return to Home Screen"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Home</span>
            </button>
          )}

          {/* Admin Back to list button (on mobile or when sidebar closed) */}
          {isAdminView && (!isTablet || !showSidebar) && selectedChatUser && (
            <button
              onClick={() => {
                sound.playClick();
                setSelectedChatUser(null);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 shrink-0 cursor-pointer"
              title="Back to Conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Tablet Sidebar Toggle Button */}
          {isTablet && (
            <button
              onClick={() => {
                sound.playClick();
                setShowSidebar(!showSidebar);
              }}
              className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                showSidebar
                  ? 'bg-cyan-500/20 text-[#00F5FF] border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title={showSidebar ? 'Hide Sidebar' : 'Show Profile Sidebar'}
            >
              <Sidebar className="w-4 h-4" />
            </button>
          )}

          <div className="relative shrink-0">
            {partnerAvatar ? (
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-8 h-8 rounded-full object-cover border border-[#00F5FF]/50"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                {partnerName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">{partnerName}</span>
              {!isAdminView && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00F5FF]/15 text-[#00F5FF] font-mono border border-[#00F5FF]/30 font-bold">
                  Dev
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
              <span>{isAdminView ? partnerEmail : 'Online'}</span>
              <span className="text-slate-400">&bull; Typically replies quickly</span>
            </div>
          </div>
        </div>

        {/* User Info / Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-slate-300 block max-w-[120px] truncate">
              {currentUser?.displayName}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area (Split Tablet 2-Pane or Single Column Mobile) */}
      <div className="flex-1 min-h-0 flex w-full overflow-hidden">
        {/* Tablet Left Sidebar */}
        {isTablet && showSidebar && (
          <div className="w-72 xl:w-80 shrink-0 border-r border-cyan-500/20 bg-[#020612] flex flex-col justify-between overflow-hidden">
            {isAdminView ? (
              /* Admin Conversations List */
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-white">Conversations</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 font-mono">
                      {adminThreads.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {adminThreads.map((thread) => {
                    const isSelected = selectedChatUser?.id === thread.id;
                    const hasUnread = thread.unreadCountAdmin > 0;
                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedChatUser(thread);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-[#00F5FF]/50 shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                            : hasUnread
                            ? 'bg-cyan-950/40 border-cyan-500/30'
                            : 'bg-white/5 border-transparent hover:border-white/10'
                        }`}
                      >
                        <div className="relative shrink-0">
                          {thread.userAvatar ? (
                            <img
                              src={thread.userAvatar}
                              alt={thread.userName}
                              className="w-9 h-9 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs">
                              {thread.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00F5FF] text-black text-[8px] font-bold flex items-center justify-center shadow">
                              {thread.unreadCountAdmin}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{thread.userName}</span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {formatTime(thread.lastMessageTimestamp)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{thread.userEmail}</p>
                          <p className={`text-[11px] truncate mt-0.5 ${hasUnread ? 'text-[#00F5FF] font-medium' : 'text-slate-300'}`}>
                            {thread.lastMessage}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Visitor Developer Info Sidebar */
              <div className="p-4 flex flex-col justify-between h-full space-y-4 overflow-y-auto">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src="./profile-neon.jpg"
                        alt="Pullingal Soorath"
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-[#00F5FF]/60 shadow-[0_0_20px_rgba(0,245,255,0.3)]"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#020612] animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-space font-bold text-sm text-white">Pullingal Soorath</h3>
                      <p className="text-[11px] font-mono text-[#00F5FF]">Flutter &amp; Dart Architect</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Online
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">IST (GMT+5:30)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[11px] leading-relaxed">
                    Professional Flutter developer crafting responsive 60FPS cross-platform mobile &amp; web apps with BLoC, Clean Architecture, and Firebase.
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-[#00F5FF] shrink-0" />
                      <span className="truncate">Thirupuram, Trivandrum, Kerala</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">pullingalsoorath@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>+91 7025 2435 79</span>
                    </div>
                  </div>

                  {onOpenCVModal && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenCVModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-[#00F5FF] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Verified Resume</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1 text-emerald-400/90">
                    <ShieldCheck className="w-3.5 h-3.5" /> E2E Firestore Encrypted
                  </span>
                  <span className="text-cyan-400/80">Direct Line</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Chat Column (Messages + Input) */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[#030914] relative">
          {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs select-text">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2 select-none">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.15)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-white">Start a Conversation</p>
            <p className="text-[11px] text-slate-400 max-w-[260px]">
              {isAdminView
                ? 'Send a welcoming response to this visitor.'
                : 'Say hello to Pullingal Soorath! Feel free to send text, images, or audio voice notes.'}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUser?.uid;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div
                  className={`relative p-2.5 rounded-2xl max-w-[85%] break-words shadow-md transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-medium rounded-br-none'
                      : 'bg-slate-800 text-slate-100 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {/* Sender Role Header if partner is AdminPS */}
                  {!isMe && m.senderRole === 'adminPS' && (
                    <div className="text-[9px] font-bold text-cyan-300 mb-1 flex items-center gap-1 font-mono">
                      <span>Pullingal Soorath</span>
                      <span className="px-1 py-0.2 rounded bg-cyan-400/20 text-[#00F5FF]">Admin</span>
                    </div>
                  )}

                  {/* Message Body: Text */}
                  {m.type === 'text' && <p className="text-xs leading-relaxed">{m.text}</p>}

                  {/* Message Body: Image */}
                  {m.type === 'image' && m.mediaUrl && (
                    <div
                      className="cursor-pointer group relative overflow-hidden rounded-xl border border-white/20 shadow-md bg-black/40 mt-1"
                      onClick={() => {
                        sound.playClick();
                        setExpandedImage(m.mediaUrl || null);
                      }}
                    >
                      <img
                        src={m.mediaUrl}
                        alt="Attachment"
                        loading="lazy"
                        className="max-h-52 w-full max-w-[240px] rounded-xl object-cover hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1.5 backdrop-blur-[2px]">
                        <Maximize2 className="w-3.5 h-3.5 text-[#00F5FF]" />
                        <span>Click to expand image</span>
                      </div>
                    </div>
                  )}

                  {/* Message Body: Audio Voice Note */}
                  {m.type === 'audio' && m.mediaUrl && (
                    <VoiceNotePlayer
                      audioUrl={m.mediaUrl}
                      isMe={isMe}
                      audioDuration={m.audioDuration}
                    />
                  )}

                  {/* Timestamp & Status */}
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 font-mono ${
                      isMe ? 'text-cyan-950/70' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatTime(m.createdAt)}</span>
                    {isMe && (
                      <span>
                        {m.isRead ? (
                          <CheckCheck className="w-3 h-3 text-black inline" />
                        ) : (
                          <Check className="w-3 h-3 text-cyan-950 inline" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* Optimistic Uploading Image Card (User sees image immediately on screen) */}
        {uploadingPreview && (
          <div className="flex flex-col items-end max-w-full animate-fade-in">
            <div className="relative p-2.5 rounded-2xl max-w-[85%] bg-cyan-950/70 border border-cyan-500/40 rounded-br-none shadow-lg">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={uploadingPreview}
                  alt="Sending..."
                  className="max-h-48 w-full max-w-[240px] rounded-xl object-cover opacity-70 blur-[1px]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 gap-2 text-[#00F5FF] text-xs font-mono font-bold">
                  <div className="w-4 h-4 border-2 border-[#00F5FF] border-t-transparent rounded-full animate-spin" />
                  <span>Sending image...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recording HUD Overlay */}
      {isRecording && (
        <div className="px-3 py-2 bg-rose-950/90 border-t border-rose-500/30 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-300">
              Recording {formatSeconds(recordingSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-mono"
            >
              Cancel
            </button>
            <button
              onClick={stopAndSendRecording}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-[11px] flex items-center gap-1 shadow-lg shadow-rose-500/30"
            >
              <Send className="w-3 h-3" /> Send Voice
            </button>
          </div>
        </div>
      )}

      {/* Bottom Input Bar */}
      {!isRecording && (
        <form
          onSubmit={handleSendMessage}
          className="p-2 bg-slate-900/90 border-t border-white/5 flex items-center gap-1.5 shrink-0 z-10"
        >
          {/* Hidden File Input for Images */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors shrink-0 disabled:opacity-50"
            title="Attach Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={startRecording}
            disabled={isSending}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors shrink-0 disabled:opacity-50"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isSending ? 'Uploading...' : 'Type message...'}
            disabled={isSending}
            className="flex-1 bg-black/60 border border-white/10 focus:border-[#00F5FF]/50 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-slate-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
        </div>
      </div>

      {/* Tap-to-expand Image Fullscreen Webpage Pop-up with Top Left Corner Back Button */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in select-none"
          onClick={() => {
            sound.playClick();
            setExpandedImage(null);
          }}
        >
          {/* Top Left Corner Back Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              setExpandedImage(null);
            }}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-[#00F5FF] hover:text-black border border-cyan-500/40 text-[#00F5FF] font-mono text-xs font-bold shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md group"
            title="Back to Chat"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          {/* Top Right Corner Controls (Download & Close) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
            <a
              href={expandedImage}
              target="_blank"
              rel="noreferrer"
              download="chat_media_attachment.jpg"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors backdrop-blur-md cursor-pointer"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                setExpandedImage(null);
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/30 hover:text-rose-400 text-white transition-colors backdrop-blur-md cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Centered Image with subtle neon glow */}
          <div className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center">
            <img
              src={expandedImage}
              alt="Expanded Attachment"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-cyan-500/30"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Dedicated Voice Note Player Bubble with play/pause, scrub/seek, volume readout, and dynamic waveform animation
 */
const VoiceNotePlayer: React.FC<{
  audioUrl: string;
  isMe: boolean;
  audioDuration?: number;
}> = ({ audioUrl, isMe, audioDuration = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioDuration > 0) setDuration(audioDuration);

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioUrl;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration((prev) => {
        if ((!prev || !isFinite(prev)) && isFinite(audio.duration) && audio.duration > 0) {
          return audio.duration;
        }
        return prev;
      });
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, [audioUrl, audioDuration]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Audio play error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || !duration || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatSec = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[190px]">
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90 cursor-pointer ${
          isMe
            ? 'bg-black text-[#00F5FF] hover:bg-black/80'
            : 'bg-[#00F5FF] text-black hover:bg-[#00F5FF]/80'
        }`}
        title={isPlaying ? 'Pause' : 'Play voice note'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {/* Animated Waveform Visualizer */}
        <div className="flex items-center gap-0.5 h-3.5">
          {[35, 75, 45, 90, 60, 100, 40, 80, 55, 85, 70, 45].map((h, i) => (
            <span
              key={i}
              style={{
                height: isPlaying
                  ? `${Math.max(25, (h * Math.sin(currentTime * 6 + i)) % 100)}%`
                  : `${h * 0.4}%`,
                transition: 'height 120ms ease',
              }}
              className={`w-1 rounded-full ${
                isMe ? 'bg-cyan-950/80' : 'bg-cyan-400/80'
              }`}
            />
          ))}
        </div>

        {/* Seekable Progress Track */}
        <div
          onClick={handleSeek}
          className="w-full h-1.5 bg-black/20 hover:bg-black/30 rounded-full overflow-hidden cursor-pointer py-0.5"
          title="Click to seek"
        >
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isMe ? 'bg-cyan-950' : 'bg-[#00F5FF]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Time readout */}
        <div
          className={`flex justify-between text-[9px] font-mono ${
            isMe ? 'text-cyan-950/80' : 'text-slate-400'
          }`}
        >
          <span>{formatSec(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-2.5 h-2.5 opacity-60" />
            {formatSec(duration || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
