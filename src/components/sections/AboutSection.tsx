import React, { useState } from 'react';
import { sound } from '../audio/audioEngine';
import { NeonPortrait } from '../profile/NeonPortrait';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Terminal,
  Layers,
  Check,
  Copy,
  Zap,
  Award,
  BookOpen,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'experience' | 'architecture' | 'journey' | 'skills'>(
    'experience'
  );

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    sound.playTerminalBeep(880);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden border-t border-white/5">
      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]" />
            <span>01 // IDENTITY & ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-orbitron text-white tracking-tight">
            HUMAN ARCHITECTURE <span className="text-[#00F5FF]">BEHIND THE CODE</span>
          </h2>
          <p className="text-sm sm:text-base font-space text-slate-400 mt-2 max-w-2xl">
            Self-learned Flutter developer transitioning from non-IT foundations to crafting exceptional, engaging mobile applications and sleek UI/UX systems.
          </p>
        </div>

        {/* Top Row: Left Image (Neon Portrait) + Right Card with Name & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Left Column: High-Contrast Neon Portrait */}
          <div className="lg:col-span-5">
            <NeonPortrait />
          </div>

          {/* Right Column: Card with Pullingal Soorath Details & Logo */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Bio Card with Personal Logo */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00F5FF]/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] p-0.5 shadow-[0_0_20px_rgba(0,245,255,0.3)] shrink-0">
                    <div className="w-full h-full bg-[#070A12] rounded-2xl flex items-center justify-center p-1">
                      <img
                        src="./ps-logo.png"
                        alt="Pullingal Soorath Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-space text-white">Pullingal Soorath</h3>
                    <p className="text-xs font-mono text-[#00F5FF]">
                      Flutter Developer &bull; UI/UX Designer &bull; Web Designer
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      Still Achieving New Technologies and Skills
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 font-sans leading-relaxed mb-6">
                  Self-learned Flutter developer with a passion for designing exceptional user interfaces and
                  crafting engaging mobile applications. Skilled in Flutter framework design, UI development, and
                  Clean Architecture. Successfully transitioned from a non-IT background to software development,
                  demonstrating strong self-learning, high adaptability, and rapid growth.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3 font-mono text-xs">
                {/* Location */}
                <div className="flex items-start sm:items-center justify-between gap-3 text-slate-300">
                  <span className="flex items-center gap-2 text-slate-400 shrink-0">
                    <MapPin className="w-4 h-4 text-[#00F5FF]" />
                    <span>Location:</span>
                  </span>
                  <span className="text-white font-medium text-right">Thirupuram, Trivandrum, Kerala, India</span>
                </div>

                {/* Email with copy */}
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4 text-[#7C4DFF]" />
                    <span>Email:</span>
                  </span>
                  <button
                    onClick={() => handleCopy('pullingalsoorath@gmail.com', 'email')}
                    className="flex items-center gap-1.5 text-[#00F5FF] hover:underline"
                    title="Click to copy email"
                  >
                    <span>pullingalsoorath@gmail.com</span>
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </button>
                </div>

                {/* Phone with copy */}
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4 text-[#3D5AFE]" />
                    <span>Phone:</span>
                  </span>
                  <button
                    onClick={() => handleCopy('+917025243579', 'phone')}
                    className="flex items-center gap-1.5 text-[#00F5FF] hover:underline"
                    title="Click to copy phone number"
                  >
                    <span>+91 7025 2435 79</span>
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Status:</span>
                  </span>
                  <span className="text-emerald-400 font-medium">
                    Continuous Learning &bull; Open for Roles
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Telemetry Widget */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00F5FF]" />
                <span>FLUTTER ENGINE:</span>
                <span className="text-white font-bold">RELEASE MODE [AOT]</span>
              </div>
              <span className="text-[#00F5FF]">SMART PHONE VIEW VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Professional Experience, Architecture, Journey, Toolset (Moved under image & details) */}
        <div className="w-full flex flex-col gap-4">
          {/* Tab Selectors */}
          <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 overflow-x-auto">
            {[
              { id: 'experience', label: 'Professional Experience', icon: Award },
              { id: 'architecture', label: 'Flutter Architecture', icon: Layers },
              { id: 'journey', label: 'Non-IT to IT Journey', icon: BookOpen },
              { id: 'skills', label: 'Technical Toolset', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Tab Terminal Content */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 min-h-[380px] flex flex-col justify-between">
            {activeTab === 'experience' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono text-[#00F5FF]">PROFESSIONAL FLUTTER DEVELOPER</span>
                  <span className="text-xs font-mono text-emerald-400">2023 - PRESENT (ACTIVE PRODUCTION)</span>
                </div>

                <h4 className="text-xl font-bold font-space text-white">
                  Flutter App Development & Framework Specialization
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Completed intensive self-directed Flutter engineering and architecture sprints. Designed and
                  built high-performance mobile applications including a real-time Chat Application with Firebase,
                  Gemini AI Chat Bot, Instagram UI Clone, YouTube UI Clone, interactive Snake Game, and To-Do task management.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="bg-[#05060A]/80 p-3.5 rounded-xl border border-white/5">
                    <div className="text-xs font-mono text-[#00F5FF] mb-1">REAL-TIME APPS</div>
                    <p className="text-xs text-slate-400">Firebase Auth, Firestore, Cloud messaging, group chat.</p>
                  </div>
                  <div className="bg-[#05060A]/80 p-3.5 rounded-xl border border-white/5">
                    <div className="text-xs font-mono text-[#3D5AFE] mb-1">STATE CONTROL</div>
                    <p className="text-xs text-slate-400">BLoC, Provider, Shared Preferences, SQFlite & Hive.</p>
                  </div>
                  <div className="bg-[#05060A]/80 p-3.5 rounded-xl border border-white/5">
                    <div className="text-xs font-mono text-[#7C4DFF] mb-1">HIGH-FIDELITY UI</div>
                    <p className="text-xs text-slate-400">Figma & Adobe XD to pixel-perfect Flutter widget trees.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono text-[#3D5AFE]">FRAMEWORK DESIGN</span>
                  <span className="text-xs font-mono text-slate-500">BLOC &bull; PROVIDER &bull; REST API</span>
                </div>

                <h4 className="text-xl font-bold font-space text-white">
                  Separation of Concerns & Reactive State Pipelines
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Proficient in crafting clean, scalable Flutter codebases. Decoupling presentation widgets
                  from business logic using BLoC and Provider patterns. Managing local databases via SQFlite and Hive,
                  and persisting user preferences seamlessly.
                </p>

                <div className="bg-[#05060A] p-4 rounded-xl border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto">
                  <div className="text-slate-500 mb-1">// Flutter Framework Architecture</div>
                  <div className="text-[#00F5FF]">class TaskBloc extends Bloc&lt;TaskEvent, TaskState&gt; &#123;</div>
                  <div className="pl-4 text-slate-300">final RestApiRepository repository;</div>
                  <div className="pl-4 text-slate-300">final LocalStorageService storage; // SQFlite / Hive</div>
                  <div className="pl-4 text-[#7C4DFF]">on&lt;LoadTasks&gt;((event, emit) async =&gt; emit(LoadedState()));</div>
                  <div className="text-[#00F5FF]">&#125;</div>
                </div>
              </div>
            )}

            {activeTab === 'journey' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono text-[#7C4DFF]">CAREER TRANSITION</span>
                  <span className="text-xs font-mono text-emerald-400">NON-IT TO SOFTWARE DEV</span>
                </div>

                <h4 className="text-xl font-bold font-space text-white">
                  Adaptability, Tenacity, & Continuous Self-Learning
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Successfully transitioned from a non-IT background into professional software engineering.
                  Through rigorous self-directed development, Pearl Computer Institution (C-DIT) diploma foundations,
                  and professional intensive production sprints, mastered mobile application lifecycles from architecture to deployment.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#05060A]/60 rounded-xl border border-white/5">
                    <div className="font-mono text-xs text-[#00F5FF] mb-1">Self-Directed Learning</div>
                    <p className="text-xs text-slate-400">Proven ability to rapidly absorb new technologies and frameworks.</p>
                  </div>
                  <div className="p-3 bg-[#05060A]/60 rounded-xl border border-white/5">
                    <div className="font-mono text-xs text-[#7C4DFF] mb-1">Effective Communication</div>
                    <p className="text-xs text-slate-400">Collaborating in team sprints, code reviews, and stakeholder syncs.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono text-emerald-400">VERIFIED SKILLSET</span>
                  <span className="text-xs font-mono text-slate-500">RESUME DECLARATION</span>
                </div>

                <h4 className="text-xl font-bold font-space text-white">
                  End-to-End Mobile, Web & Design Stack
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {[
                    'Flutter App Dev',
                    'Dart Language',
                    'REST API Integration',
                    'Firebase Ecosystem',
                    'BLoC & Provider',
                    'SQFlite & Hive',
                    'Shared Preferences',
                    'UI/UX Design',
                    'Figma & Adobe XD',
                    'Adobe Photoshop',
                    'HTML & CSS',
                    'Git & GitHub',
                  ].map((s) => (
                    <div
                      key={s}
                      className="px-3 py-2 rounded-xl bg-[#05060A] border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#00F5FF]" />
                      <span className="truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal Bottom Status */}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>VERIFIED RESUME ACCREDITATION</span>
              <span className="text-[#00F5FF]">PS // FLUTTER DEV</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
