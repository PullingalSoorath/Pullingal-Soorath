import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Download,
  Mail,
  Phone,
  Gamepad2,
  ChevronLeft,
  RotateCcw,
  ExternalLink,
  Award,
  Compass,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';

interface AIChatBotAppProps {
  onOpenCVModal?: () => void;
  onLaunchApp?: (appId: string) => void;
  onGoHome?: () => void;
  isTablet?: boolean;
}

interface ActionButton {
  label: string;
  icon?: React.ElementType;
  action: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: ActionButton[];
}

export const AIChatBotApp: React.FC<AIChatBotAppProps> = ({
  onOpenCVModal,
  onLaunchApp,
  onGoHome,
  isTablet: _isTablet = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested prompt pills
  const SUGGESTED_QUESTIONS = [
    { text: 'Who is Pullingal Soorath?', category: 'bio' },
    { text: 'What are your top Flutter skills?', category: 'skills' },
    { text: 'Tell me about your featured projects', category: 'projects' },
    { text: 'Can I see or download your resume?', category: 'resume' },
    { text: 'How can I contact or hire you?', category: 'contact' },
    { text: 'Tell me about your transition to tech', category: 'story' },
    { text: 'Tell me about the 3D Rally Game', category: 'rally' },
  ];

  // Auto-scroll inside chat list only (never scrolling outer webpage)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome message from the AI Chatbot
  useEffect(() => {
    const welcomeMsg: Message = {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 **Hello! I am Pullingal Soorath's AI Assistant.**\n\nWelcome to my interactive portfolio! You can **ask me anything you need to know about me** — my Flutter development skills, architecture (BLoC & Provider), featured projects, contact details, or background.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actions: [
        {
          label: '📄 Download CV / Resume',
          icon: Download,
          action: () => {
            sound.playClick();
            onOpenCVModal?.();
          },
        },
        {
          label: '🏎️ Play 3D Rally Game',
          icon: Gamepad2,
          action: () => {
            sound.playClick();
            onLaunchApp?.('rally');
          },
        },
      ],
    };

    setMessages([welcomeMsg]);
  }, [onOpenCVModal, onLaunchApp]);

  // Comprehensive Knowledge Engine to reply about Pullingal Soorath
  const generateAIResponse = (query: string): { text: string; actions?: ActionButton[] } => {
    const q = query.toLowerCase().trim();

    // 1. Who is Pullingal Soorath / Bio
    if (
      q.includes('who are you') ||
      q.includes('who is') ||
      q.includes('about you') ||
      q.includes('about me') ||
      q.includes('tell me about yourself') ||
      q.includes('introduce') ||
      q.includes('bio') ||
      q.includes('profile')
    ) {
      return {
        text: `**Pullingal Soorath** is a passionate, self-learned **Professional Flutter Developer & UI/UX Architect** based in **Thirupuram, Trivandrum, Kerala, India**.\n\nHe specializes in building clean, high-performance cross-platform mobile apps for Android and iOS, combining rigorous architecture (BLoC, Provider, Clean Architecture) with pixel-perfect, fluid interfaces designed in Figma.\n\nHe is actively **open for full-time and contract developer roles**!`,
        actions: [
          {
            label: '📄 View Resume CV',
            icon: Download,
            action: () => onOpenCVModal?.(),
          },
          {
            label: '✉️ Send Email',
            icon: Mail,
            action: () => {
              window.location.href = 'mailto:pullingalsoorath@gmail.com';
            },
          },
        ],
      };
    }

    // 2. Technical Skills / Tech Stack
    if (
      q.includes('skill') ||
      q.includes('tech stack') ||
      q.includes('technolog') ||
      q.includes('language') ||
      q.includes('what do you know') ||
      q.includes('expertise') ||
      q.includes('dart')
    ) {
      return {
        text: `Here is Pullingal Soorath's primary **Technical Skill Stack**:\n\n• **Core Mobile**: Flutter Framework (95%), Dart Programming Language (95%), Custom RenderObjects, 60FPS fluid physics animations.\n• **State Management**: BLoC Pattern & Cubit (92%), Provider (90%).\n• **Backend & Cloud**: Firebase (Auth, Cloud Firestore, Cloud Storage, FCM), REST APIs (HTTP networking, JSON serialization, pagination).\n• **Local Databases**: SQFlite, Hive NoSQL DB, Shared Preferences.\n• **Design & Prototyping**: Figma UI/UX (92%), Adobe XD, Adobe Photoshop.\n• **Web & 3D**: Three.js WebGL, HTML5, CSS3/Tailwind, TypeScript.\n• **DevOps & Tools**: Git, GitHub, Postman, VS Code, Android Studio.`,
        actions: [
          {
            label: '⚡ Open Skills App',
            icon: Award,
            action: () => onLaunchApp?.('skills'),
          },
        ],
      };
    }

    // 3. Featured Projects
    if (
      q.includes('project') ||
      q.includes('app') ||
      q.includes('what have you built') ||
      q.includes('portfolio') ||
      q.includes('work') ||
      q.includes('github')
    ) {
      return {
        text: `Pullingal Soorath has engineered several standout applications:\n\n1. **Real-Time Chat App** (Flutter & Firebase): Group chats, photo sharing, live presence, and push notifications.\n2. **AI Neural Chat Bot** (Flutter & Gemini API): Generative streaming conversations with markdown code formatting.\n3. **RallyGame 3D** (Three.js & Ray Physics): 3D rally game featuring 6 vehicles (Rally 4WD, Muscle V8, Rocket, White Beast), 1v1 AI duels, nitro boost, stunt jumps, and Cloud Firestore high-score CRUD.\n4. **Instagram UI Clone** (Flutter): Pixel-perfect social feeds, stories, and state management.\n5. **YouTube UI Clone** (Flutter): Custom video players, search, and responsive cards.\n6. **Feature-Rich To-Do App** (Flutter & REST API): Task categories, priority reminders, and offline storage.`,
        actions: [
          {
            label: '📂 Open Project Gallery',
            icon: Compass,
            action: () => onLaunchApp?.('gallery'),
          },
          {
            label: '🏎️ Play Rally Game 3D',
            icon: Gamepad2,
            action: () => onLaunchApp?.('rally'),
          },
        ],
      };
    }

    // 4. Rally Game 3D
    if (
      q.includes('rally') ||
      q.includes('game') ||
      q.includes('car') ||
      q.includes('racing') ||
      q.includes('3d')
    ) {
      return {
        text: `**RallyGame 3D** is a high-performance 3D WebGL rally racing game built with Three.js and adapted from the open-source RallyGame architecture!\n\n**Features:**\n• **6 Iconic Cars**: Rally Raid 4WD, American V8 Muscle, Rocket Hypercar, and the infamous White Beast.\n• **4 Dynamic Environments**: Valley Dirt Trail, Desert Canyon, City Expressway, and Floating Skyway.\n• **Game Modes**: 1v1 AI Duel racing with live lead distance tracker, Time Trial with checkpoint bonuses, and Free Roam stunt jumping.\n• **Physics**: Nitro boost jets, suspension jump force, handbrake power slides, and real engine sounds.\n• **Firebase CRUD Leaderboard**: Persistent global records stored in Firestore!`,
        actions: [
          {
            label: '🏎️ Launch Rally Game Now',
            icon: Gamepad2,
            action: () => onLaunchApp?.('rally'),
          },
        ],
      };
    }

    // 5. Contact / Hire / Phone / Email
    if (
      q.includes('contact') ||
      q.includes('hire') ||
      q.includes('email') ||
      q.includes('phone') ||
      q.includes('number') ||
      q.includes('call') ||
      q.includes('reach') ||
      q.includes('interview') ||
      q.includes('available') ||
      q.includes('location') ||
      q.includes('where are you')
    ) {
      return {
        text: `You can reach **Pullingal Soorath** directly through the following channels:\n\n• **Email**: [pullingalsoorath@gmail.com](mailto:pullingalsoorath@gmail.com)\n• **Phone / WhatsApp**: [+91 7025 2435 79](tel:+917025243579)\n• **Location**: Thirupuram, Trivandrum, Kerala, India (UTC +5:30 IST)\n• **Status**: Open for Full-Time, Remote, and Contract Roles!\n• **GitHub**: [github.com/pullingalsoorath](https://github.com/pullingalsoorath)\n• **LinkedIn**: Available upon request`,
        actions: [
          {
            label: '✉️ Send Email',
            icon: Mail,
            action: () => {
              window.location.href = 'mailto:pullingalsoorath@gmail.com';
            },
          },
          {
            label: '📞 Call +91 7025 2435 79',
            icon: Phone,
            action: () => {
              window.location.href = 'tel:+917025243579';
            },
          },
        ],
      };
    }

    // 6. Resume / CV / Experience
    if (
      q.includes('cv') ||
      q.includes('resume') ||
      q.includes('experience') ||
      q.includes('work history') ||
      q.includes('years')
    ) {
      return {
        text: `**Experience Summary:**\n\n• **Professional Flutter Developer** (2023 – Present):\nArchitected and delivered production-grade cross-platform Flutter applications. Focused on Clean Architecture, event-driven BLoC state management, REST API integration, and Firebase real-time services.\n\n• **Transition to Software Development**:\nSuccessfully transitioned from a non-IT background to software engineering through rigorous self-directed training and continuous project delivery.\n\nWould you like to review or download the full resume?`,
        actions: [
          {
            label: '📄 Download Resume CV',
            icon: Download,
            action: () => onOpenCVModal?.(),
          },
        ],
      };
    }

    // 7. Transition Story / Non-IT to Software
    if (
      q.includes('transition') ||
      q.includes('non-it') ||
      q.includes('how did you learn') ||
      q.includes('story') ||
      q.includes('journey') ||
      q.includes('self-learn')
    ) {
      return {
        text: `**The Journey to Software Development:**\n\nPullingal Soorath successfully transitioned from a non-IT background into professional software engineering through dedicated self-learning, relentless curiosity, and structured practice.\n\nBy immersing himself in Dart, Flutter, Clean Architecture, and UI/UX design, he built multiple real-world applications (chat engines, AI bots, clones, and 3D games) to prove production readiness. His journey showcases high adaptability, perseverance, and a deep passion for writing clean, impactful code.`,
        actions: [
          {
            label: '📄 Check Resume CV',
            icon: Download,
            action: () => onOpenCVModal?.(),
          },
        ],
      };
    }

    // 8. Education & Certifications
    if (
      q.includes('education') ||
      q.includes('college') ||
      q.includes('school') ||
      q.includes('degree') ||
      q.includes('iti') ||
      q.includes('dca') ||
      q.includes('qualification')
    ) {
      return {
        text: `**Academic & Training History:**\n\n1. **Professional Flutter Developer Training** (2023 – Present)\n   Specialized in reactive state engines, Flutter framework internals, and cloud backends.\n\n2. **Industrial Training Institution (ITI)** (2019 – 2022)\n   Govt. ITI Dhanuvachapuram.\n\n3. **Diploma In Computer Application (DCA)** (2017 – 2018)\n   Pearl Computer Institution (C-DIT).\n\n4. **Higher Secondary Education** (2017 – 2019)\n   PKSHSS Kanjiramkulam.`,
      };
    }

    // 9. State Management (BLoC vs Provider)
    if (
      q.includes('bloc') ||
      q.includes('provider') ||
      q.includes('state')
    ) {
      return {
        text: `**State Management Philosophy:**\n\nPullingal Soorath uses **BLoC (Business Logic Component)** and **Cubit** for enterprise, scalable apps to maintain strict separation of concerns, deterministic event flows, and easy testability.\n\nFor scoped UI state or lightweight dependency injection, he uses **Provider** and **ChangeNotifier**. He also has experience with Riverpod and local reactive streams.`,
      };
    }

    // 10. Firebase & Backend
    if (
      q.includes('firebase') ||
      q.includes('firestore') ||
      q.includes('auth') ||
      q.includes('database') ||
      q.includes('api')
    ) {
      return {
        text: `**Backend & Cloud Capabilities:**\n\n• **Cloud Firestore**: Real-time listeners, composite indexing, and offline caching.\n• **Firebase Auth**: Google Sign-In, Email/Password, and token management.\n• **Firebase Storage**: User avatars, media uploads, and secure asset URLs.\n• **REST APIs**: Secure HTTP client requests, bearer token headers, retry interceptors, and JSON data modeling.\n• **Local Cache**: Hive NoSQL & SQFlite SQLite databases for offline-first resilience.`,
      };
    }

    // 11. UI/UX & Design
    if (
      q.includes('design') ||
      q.includes('figma') ||
      q.includes('ui') ||
      q.includes('ux') ||
      q.includes('photoshop')
    ) {
      return {
        text: `**Design & UI/UX Standards:**\n\nPullingal Soorath believes great software starts with exceptional design. He crafts interactive wireframes, design systems, and responsive components in **Figma** and **Adobe XD**, and translates them 1:1 into Flutter widgets with custom animations, glassmorphism, and responsive breakpoints.`,
      };
    }

    // Default intelligent fallback
    return {
      text: `Pullingal Soorath is a dedicated Flutter developer and UI/UX designer with 2+ years of production experience in mobile app development, state management, and real-time cloud integrations.\n\nFeel free to ask more specific questions about his **Flutter skills**, **featured projects**, **work experience**, **contact details**, or **resume**!`,
      actions: [
        {
          label: '📄 Download Resume',
          icon: Download,
          action: () => onOpenCVModal?.(),
        },
        {
          label: '✉️ Send Message',
          icon: Mail,
          action: () => {
            window.location.href = 'mailto:pullingalsoorath@gmail.com';
          },
        },
      ],
    };
  };

  // Handle user sending a question
  const handleSendMessage = (textToSend?: string) => {
    const raw = textToSend !== undefined ? textToSend : inputValue;
    const query = raw.trim();
    if (!query) return;

    sound.playTerminalBeep(850);

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate realistic AI thought process & reply
    setTimeout(() => {
      sound.playTerminalBeep(1100);
      const reply = generateAIResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        actions: reply.actions,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 650);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    sound.playClick();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'ai',
        text: `👋 **Chat reset!**\n\nI am Pullingal Soorath's AI Assistant. **Ask anything you need to know about me** — skills, projects, resume, or contact coordinates!`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        actions: [
          {
            label: '📄 Download CV',
            icon: Download,
            action: () => onOpenCVModal?.(),
          },
        ],
      },
    ]);
  };

  return (
    <div
      className="flex flex-col h-full bg-[#050811] text-white select-none overscroll-contain relative font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ===================================================================== */}
      {/* TOP HEADER: AI Bot Identity, Status, Home & Reset Buttons             */}
      {/* ===================================================================== */}
      <div className="shrink-0 px-3.5 py-2.5 bg-[#090d1a]/95 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-2.5">
          {onGoHome && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onGoHome();
              }}
              className="p-1.5 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-cyan-400 transition-all flex items-center gap-0.5 text-xs font-mono"
              title="Return to Home Screen"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          {/* AI Avatar with Neural Glow */}
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
              <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#050811] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-xs text-white tracking-wide">Soorath AI</h2>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold">
                Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-none">
              Ask anything you need to know about me
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white transition-all"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BANNER PROMPT: "Ask anything you need to know about me"                */}
      {/* ===================================================================== */}
      <div className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-950/60 via-indigo-950/40 to-slate-900 border-b border-white/5 flex items-center justify-between text-[11px] text-cyan-300/90 font-mono shrink-0">
        <span className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask anything you need to know about me</span>
        </span>
        <span className="text-[10px] text-slate-400">Pullingal Soorath</span>
      </div>

      {/* ===================================================================== */}
      {/* CHAT MESSAGES STREAM                                                  */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div className="flex items-end gap-1.5 max-w-[90%]">
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-400/40 flex items-center justify-center shrink-0 mb-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-sm backdrop-blur-md'
                  }`}
                >
                  {/* Markdown formatted text output */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text.split('\n').map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1.5" />;

                      // Render bold text
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <div key={i} className="leading-relaxed">
                          {parts.map((p, idx) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return (
                                <strong key={idx} className={isUser ? 'text-white' : 'text-cyan-300 font-bold'}>
                                  {p.slice(2, -2)}
                                </strong>
                              );
                            }
                            return <span key={idx}>{p}</span>;
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, aIdx) => {
                        const Icon = act.icon || ExternalLink;
                        return (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              act.action();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            <Icon className="w-3 h-3" />
                            <span>{act.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 mb-1">
                    <User className="w-3 h-3 text-cyan-300" />
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse pl-8">
            <Bot className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono text-[11px]">Soorath AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===================================================================== */}
      {/* QUICK SUGGESTION PILLS                                                */}
      {/* ===================================================================== */}
      <div className="shrink-0 px-3 py-2 border-t border-white/5 bg-[#070b16]/95 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {SUGGESTED_QUESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSendMessage(sug.text);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[11px] font-medium text-slate-300 hover:text-cyan-200 whitespace-nowrap active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {sug.text}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BOTTOM INPUT BAR                                                      */}
      {/* ===================================================================== */}
      <div className="shrink-0 p-3 bg-[#080d1d] border-t border-white/10 z-20">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about me..."
            onFocus={(e) => e.target.focus({ preventScroll: true })}
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none shadow-inner"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSendMessage();
            }}
            disabled={!inputValue.trim()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 active:scale-95 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-lg flex items-center justify-center cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatBotApp;
