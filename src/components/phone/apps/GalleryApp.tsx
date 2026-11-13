import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Gamepad2,
  CheckSquare,
  MessageSquare,
  X,
  Flame,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';
import { InstagramIcon, YoutubeIcon } from '../../icons/SocialIcons';

export interface ProjectItem {
  id: string;
  title: string;
  category: 'flutter' | 'clone' | 'game' | 'system';
  categoryLabel: string;
  gradient: string;
  tech: string[];
  description: string;
  keyFeatures: string[];
  launchTarget?: string;
  icon: React.ElementType;
}

interface GalleryAppProps {
  onLaunchApp?: (appId: string) => void;
}

export const GalleryApp: React.FC<GalleryAppProps> = ({ onLaunchApp }) => {
  const [filter, setFilter] = useState<'all' | 'flutter' | 'clone' | 'game'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const projects: ProjectItem[] = [
    {
      id: 'chat',
      title: 'Real-Time Chat Application',
      category: 'flutter',
      categoryLabel: 'Flutter & Firebase',
      gradient: 'from-cyan-900 via-blue-950 to-slate-900',
      tech: ['Flutter', 'Firebase Auth', 'Firestore', 'REST API', 'Cloud Messaging'],
      description:
        'A full-fledged real-time messaging application with instant sync, authentication, group channels, and multimedia messaging support.',
      keyFeatures: [
        'Secure user authentication and token refresh',
        'Real-time Firestore chat channels and presence',
        'Multimedia sharing (images, files, emojis)',
        'Push notifications & low latency state handling',
      ],
      launchTarget: 'chat',
      icon: MessageSquare,
    },
    {
      id: 'ai',
      title: 'Gemini AI Neural Chatbot',
      category: 'flutter',
      categoryLabel: 'Generative AI',
      gradient: 'from-violet-950 via-purple-900 to-black',
      tech: ['Flutter', 'Gemini 3.8 Flash', 'REST API', 'BLoC Pattern'],
      description:
        'Streaming generative AI assistant integrated into Flutter, streaming tokens with zero UI stuttering and Markdown code block rendering.',
      keyFeatures: [
        'Real-time streaming LLM responses',
        'Contextual memory and persona toggles',
        'Custom Flutter widget syntax highlighters',
        'Optimized reactive BLoC state stream',
      ],
      launchTarget: 'ai',
      icon: Sparkles,
    },
    {
      id: 'insta',
      title: 'Instagram UI Replica',
      category: 'clone',
      categoryLabel: 'High-Fidelity Clone',
      gradient: 'from-fuchsia-950 via-rose-950 to-slate-900',
      tech: ['Flutter', 'Shared Preferences', 'Custom Animations', 'UI/UX'],
      description:
        'Pixel-accurate replica of the Instagram mobile interface. Demonstrates mastery of Flutter widget hierarchy, responsive layout, and physics animations.',
      keyFeatures: [
        'Double-tap heart micro-interaction animation',
        'Stories tray with gradient ring animations',
        'Shared Preferences for local state persistence',
        'Smooth 60 FPS scrolling feed',
      ],
      launchTarget: 'insta',
      icon: InstagramIcon,
    },
    {
      id: 'youtube',
      title: 'YouTube App UI Clone',
      category: 'clone',
      categoryLabel: 'High-Fidelity Clone',
      gradient: 'from-red-950 via-rose-950 to-black',
      tech: ['Flutter', 'Video Player UI', 'Custom Painter', 'Search Filter'],
      description:
        'Comprehensive YouTube UI replica showcasing custom video thumbnail carousels, responsive video player controls, and animated bottom sheets.',
      keyFeatures: [
        'Custom video player layout and gesture triggers',
        'Search functionalities with live filtering',
        'Dynamic channel subscribe and engagement widgets',
        'Dark mode optimized theme system',
      ],
      launchTarget: 'youtube',
      icon: YoutubeIcon,
    },
    {
      id: 'snake',
      title: 'Interactive Snake Game',
      category: 'game',
      categoryLabel: 'Interactive Game',
      gradient: 'from-emerald-950 via-teal-900 to-black',
      tech: ['Flutter', 'CustomPainter', 'Swipe Gestures', 'Game Loop'],
      description:
        'Classic Snake game engine reimagined in Flutter with fluid swipe gesture controls, animated rendering, high score tracking, and haptic feedback.',
      keyFeatures: [
        'Pure Flutter deterministic 60 FPS game loop',
        'Multi-directional swipe gesture detection',
        'Dynamic food spawning & score progression',
        'Animated collision detection & audio chimes',
      ],
      launchTarget: 'snake',
      icon: Gamepad2,
    },
    {
      id: 'todo',
      title: 'Feature-Rich To-Do App',
      category: 'flutter',
      categoryLabel: 'Productivity Tool',
      gradient: 'from-sky-950 via-blue-950 to-slate-900',
      tech: ['Flutter', 'REST API', 'SQFlite', 'State Management'],
      description:
        'Task management system equipped with categorized task lists, reminder scheduling, sorting filters, and REST API synchronization.',
      keyFeatures: [
        'REST API integration with local SQFlite cache',
        'Multi-tier task filtering and priority sorting',
        'Smooth checkmark strikethrough micro-interactions',
        'Persistent offline task state',
      ],
      launchTarget: 'todo',
      icon: CheckSquare,
    },
    {
      id: 'architecture',
      title: 'Clean Architecture BLoC Map',
      category: 'flutter',
      categoryLabel: 'Software Architecture',
      gradient: 'from-indigo-950 via-slate-900 to-cyan-950',
      tech: ['Flutter', 'BLoC Pattern', 'Provider', 'SOLID Principles'],
      description:
        'Enterprise-grade Flutter architecture pattern isolating presentation, domain business rules, and data access layers for scalable codebases.',
      keyFeatures: [
        'Strict separation of concerns (Presentation / Domain / Data)',
        'Reactive BLoC state streams',
        'Repository pattern for seamless data swapping',
        'Unit-testable decoupled modules',
      ],
      icon: Layers,
    },
  ];

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  return (
    <div className="flex flex-col h-full bg-[#06080e] text-white animate-fadeIn select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div>
          <h3 className="font-space font-bold text-sm flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#00F5FF]" />
            <span>Projects Gallery</span>
          </h3>
          <p className="text-[10px] font-mono text-slate-400">
            Flutter Apps &bull; UI Clones &bull; Interactive Systems
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30">
          {filteredProjects.length} Projects
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 border-b border-white/5 flex items-center gap-1 overflow-x-auto bg-[#07090f]">
        {[
          { id: 'all', label: 'All Projects' },
          { id: 'flutter', label: 'Flutter Apps' },
          { id: 'clone', label: 'UI Clones' },
          { id: 'game', label: 'Games' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setFilter(tab.id as typeof filter);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-[#00F5FF] text-black font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2.5">
        {filteredProjects.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sound.playClick();
                setSelectedProject(item);
              }}
              className={`rounded-2xl bg-gradient-to-br ${item.gradient} p-3 border border-white/10 hover:border-[#00F5FF]/50 cursor-pointer hover:scale-[1.01] transition-all shadow-md group relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center text-[#00F5FF]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00F5FF] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400">
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                {item.launchTarget && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-emerald-400" />
                    <span>Run Demo</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
                {item.description}
              </p>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tech.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/60 text-slate-300 border border-white/5"
                  >
                    {t}
                  </span>
                ))}
                {item.tech.length > 3 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-400">
                    +{item.tech.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Details Modal */}
      {selectedProject && (
        <div className="absolute inset-0 z-50 bg-[#06080e]/95 backdrop-blur-md p-4 flex flex-col justify-between animate-fadeIn overflow-y-auto overscroll-contain">
          <div className="space-y-3">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono text-[#00F5FF] uppercase">
                {selectedProject.categoryLabel}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProject(null);
                }}
                className="p-1 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Icon */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F5FF]/20 to-[#7C4DFF]/20 border border-[#00F5FF]/40 flex items-center justify-center text-[#00F5FF]">
                <selectedProject.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white">
                  {selectedProject.title}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">
                  Verified Flutter Project &bull; Pullingal Soorath
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-300 leading-relaxed">
              {selectedProject.description}
            </div>

            {/* Key Features */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Engineering Highlights
              </div>
              {selectedProject.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[11px] text-slate-300 bg-black/40 p-2 rounded-xl border border-white/5"
                >
                  <span className="text-[#00F5FF] font-mono font-bold mt-0.5">&bull;</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Tech Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-[#00F5FF]/30 text-[#00F5FF]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/10 flex gap-2">
            {selectedProject.launchTarget && onLaunchApp ? (
              <button
                onClick={() => {
                  sound.playSuccess();
                  const target = selectedProject.launchTarget!;
                  setSelectedProject(null);
                  onLaunchApp(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Launch App in Smart Phone</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedProject(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center"
              >
                Close Project
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
