import React, { useState, useRef } from 'react';
import { ProjectModal, type ProjectData } from '../modals/ProjectModal';
import { sound } from '../audio/audioEngine';
import { ArrowUpRight } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [filter, setFilter] = useState<'all' | 'realtime' | 'clone' | 'game'>('all');

  const projects: ProjectData[] = [
    {
      id: 'chat-app',
      title: 'Real-Time Chat Application',
      subtitle: 'Flutter • Firebase Ecosystem • REST APIs',
      category: 'Mobile Engine',
      badge: 'CORE RESUME PROJECT',
      description:
        'Developed a full-lifecycle real-time chat application using Flutter, Firebase, and REST APIs. Features secure user authentication, multi-user group chat, multimedia file sharing, and real-time push notifications.',
      fullOverview:
        'Managed the entire product lifecycle from UI/UX design to production deployment. Integrated Firebase Authentication, Firestore real-time stream listeners, Firebase Cloud Storage for images/audio, and REST API endpoints. Engineered resilient state handling and background notification payloads.',
      architecturePoints: [
        'End-to-End User Authentication & Profile Management via Firebase Auth',
        'Real-Time Group Chat & 1-on-1 Messaging powered by Firestore Streams',
        'Multimedia Asset Compression & Secure Upload to Cloud Storage',
        'Real-time FCM Push Notifications with foreground/background payload handlers',
        'Offline message cache with SQLite / Shared Preferences sync',
      ],
      metrics: [
        { label: 'Sync Latency', value: '< 30ms' },
        { label: 'Frame Rate', value: '60 FPS' },
        { label: 'Stack', value: 'Firebase + REST' },
        { label: 'Deployment', value: 'Production' },
      ],
      tags: ['Flutter', 'Firebase', 'REST API', 'Auth', 'Group Chat', 'FCM'],
      techStack: ['Flutter', 'Dart', 'Firebase Auth', 'Cloud Firestore', 'Cloud Storage', 'REST API', 'FCM'],
      color: '#00F5FF',
      githubUrl: 'https://github.com/pullingalsoorath',
      liveUrl: 'https://github.com/pullingalsoorath',
      screenType: 'dating',
    },
    {
      id: 'ai-chat-bot',
      title: 'AI Chat Bot (Gemini & Firebase)',
      subtitle: 'Flutter • Google Gemini LLM • Firebase Core',
      category: 'AI Application',
      badge: 'GENERATIVE AI',
      description:
        'An artificial intelligence chatbot application made with Flutter, Google Gemini API, and Firebase. Delivers responsive conversational assistance, code generation parsing, and chat history persistence.',
      fullOverview:
        'Built with Flutter to provide a smooth, animated conversational interface that interacts with Google Gemini models. Utilizes background isolates to parse markdown and code snippets seamlessly without causing jank on the main UI thread.',
      architecturePoints: [
        'Integration with Google Gemini API for real-time text intelligence',
        'Firebase session management and encrypted conversational history storage',
        'Markdown and code block syntax rendering with copy-to-clipboard actions',
        'Animative UI state transitions with responsive typing indicators',
      ],
      metrics: [
        { label: 'Model', value: 'Gemini 3.8' },
        { label: 'Latency', value: 'Sub-second' },
        { label: 'UI Frame', value: '60 FPS' },
        { label: 'Platform', value: 'Cross-Platform' },
      ],
      tags: ['Flutter', 'Gemini AI', 'Firebase', 'LLM', 'AI Bot'],
      techStack: ['Flutter', 'Dart', 'Google Gemini API', 'Firebase', 'BLoC', 'Markdown AST'],
      color: '#7C4DFF',
      githubUrl: 'https://github.com/pullingalsoorath',
      liveUrl: 'https://github.com/pullingalsoorath',
      screenType: 'ai',
    },
    {
      id: 'insta-clone',
      title: 'Instagram UI Clone',
      subtitle: 'Flutter • Shared Preferences • High-Fidelity UI/UX',
      category: 'UI/UX Engineering',
      badge: 'HIGH-FIDELITY CLONE',
      description:
        'Designed and developed a high-fidelity Instagram UI replica. Demonstrated expertise in Flutter framework design, UI/UX principles, navigation routes, state persistence, and interactive feeds.',
      fullOverview:
        'A pixel-perfect recreation of Instagram featuring home feeds, story trays with animated gradient rings, double-tap like heart micro-interactions, profile grid views, and local state persistence using Shared Preferences.',
      architecturePoints: [
        'Pixel-accurate Flutter framework translation of Instagram Material & Cupertino styles',
        'Persistent like counts and user preferences using Shared Preferences',
        'Fluid story carousel tray with animated Instagram gradient rings',
        'Custom spring physics animations for double-tap heart reactions',
      ],
      metrics: [
        { label: 'UI Accuracy', value: 'Pixel-Perfect' },
        { label: 'Interaction FPS', value: '60 FPS' },
        { label: 'Persistence', value: 'Shared Prefs' },
        { label: 'State', value: 'Provider/BLoC' },
      ],
      tags: ['Flutter', 'UI Clone', 'Shared Preferences', 'Animations', 'UI/UX'],
      techStack: ['Flutter', 'Dart', 'Shared Preferences', 'Provider', 'CustomPainter'],
      color: '#EC4899',
      githubUrl: 'https://github.com/pullingalsoorath',
      liveUrl: 'https://github.com/pullingalsoorath',
      screenType: 'mobile',
    },
    {
      id: 'youtube-clone',
      title: 'YouTube App UI Clone',
      subtitle: 'Flutter • Video Content Handling • Custom Animations',
      category: 'Media Engineering',
      badge: 'MULTIMEDIA CLONE',
      description:
        'Created a YouTube app UI clone showcasing advanced Flutter skills in video content handling, responsive layout hierarchies, custom animations, and search functionalities.',
      fullOverview:
        'Showcases deep mastery over Flutter custom animations and media interfaces. Includes custom video feed cards, responsive video detail view transitions, bottom navigation switching, and search query filters.',
      architecturePoints: [
        'Advanced layout composition for video cards with duration badge overlays',
        'Custom animation transitions between video feed and detail view',
        'Search screen with live filtering and auto-complete chips',
        'Responsive viewport ergonomics adapting gracefully across screen sizes',
      ],
      metrics: [
        { label: 'Video UI', value: 'Custom Native' },
        { label: 'Search Speed', value: 'Instant' },
        { label: 'Animations', value: 'Smooth Curves' },
        { label: 'Code Quality', value: 'Modular' },
      ],
      tags: ['Flutter', 'Video UI', 'YouTube Clone', 'Animations', 'Search UI'],
      techStack: ['Flutter', 'Dart', 'Custom Animations', 'State Management', 'REST API'],
      color: '#EF4444',
      githubUrl: 'https://github.com/pullingalsoorath',
      liveUrl: 'https://github.com/pullingalsoorath',
      screenType: 'web',
    },
    {
      id: 'snake-game',
      title: 'Interactive Snake Game',
      subtitle: 'Flutter • Swipe Gestures • Animative Game Loop',
      category: 'Interactive Game',
      badge: 'INTERACTIVE GAME',
      description:
        'Created an interactive retro Snake game using Flutter with intuitive swipe gesture controls, animated game loop physics, and fully animative user-friendly designs.',
      fullOverview:
        'Engineered a deterministic game loop in Flutter using Ticker providers. Implemented custom swipe detection, collision boundaries, randomized food spawning, and animated score progression.',
      architecturePoints: [
        'Smooth 60FPS Flutter game loop rendering without third-party game engines',
        'Directional swipe gesture recognition with velocity validation',
        'Real-time collision detection logic with self-hit and wall-hit safeguards',
        'Dynamic score tracking and high-score storage with animated HUD',
      ],
      metrics: [
        { label: 'Game Loop', value: '60 FPS Ticker' },
        { label: 'Controls', value: 'Swipe Gestures' },
        { label: 'Physics', value: 'Deterministic' },
        { label: 'Design', value: 'Animative UI' },
      ],
      tags: ['Flutter', 'Game Dev', 'Swipe Gestures', 'Animations', 'Interactive'],
      techStack: ['Flutter', 'Dart', 'CustomPainter', 'GestureDetector', 'Game Loop'],
      color: '#10B981',
      githubUrl: 'https://github.com/pullingalsoorath',
      liveUrl: 'https://github.com/pullingalsoorath',
      screenType: 'mobile',
    },
    {
      id: 'todo-app',
      title: 'Feature-Rich To-Do Application',
      subtitle: 'Flutter • REST API • Task & Reminder Sorting',
      category: 'Productivity',
      badge: 'REST API PROJECT',
      description:
        'Designed and implemented a feature-rich task management application in Flutter. Expertise in managing tasks, reminders, sorting features, and prioritizing user-friendly design.',
      fullOverview:
        'Built to streamline productivity. Integrates RESTful APIs for remote synchronizations, categorizes tasks with custom color codes, provides deadline sorting, and persists status offline.',
      architecturePoints: [
        'REST API integration with Dio for CRUD synchronization',
        'Task sorting, priority tags, and automated reminder scheduling',
        'Clean modular state separation using Provider / BLoC',
        'Accessible, high-contrast dark/cyber interface with smooth check-off animations',
      ],
      metrics: [
        { label: 'Architecture', value: 'REST + CRUD' },
        { label: 'Response', value: '< 20ms' },
        { label: 'Storage', value: 'Local + Cloud' },
        { label: 'UX', value: 'Intuitive' },
      ],
      tags: ['Flutter', 'REST API', 'To-Do App', 'Task Management', 'CRUD'],
      techStack: ['Flutter', 'Dart', 'REST API', 'Dio', 'Shared Preferences', 'Provider'],
      color: '#3B82F6',
      githubUrl: 'https://github.com/pullingalsoorath',
      liveUrl: 'https://github.com/pullingalsoorath',
      screenType: 'mobile',
    },
  ];

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'realtime') return p.id === 'chat-app' || p.id === 'ai-chat-bot';
    if (filter === 'clone') return p.id === 'insta-clone' || p.id === 'youtube-clone';
    if (filter === 'game') return p.id === 'snake-game' || p.id === 'todo-app';
    return true;
  });

  return (
    <section id="projects" className="relative py-24 sm:py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]" />
              <span>03 // PRODUCTION SHOWCASE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-orbitron text-white tracking-tight">
              FEATURED <span className="text-[#00F5FF]">FLUTTER PROJECTS</span>
            </h2>
            <p className="text-sm sm:text-base font-space text-slate-400 mt-2 max-w-2xl">
              Authentic applications engineered by Pullingal Soorath during professional development and self-directed sprints.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'ALL PROJECTS' },
              { id: 'realtime', label: 'REAL-TIME & AI' },
              { id: 'clone', label: 'HIGH-FIDELITY CLONES' },
              { id: 'game', label: 'GAMES & UTILITIES' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setFilter(tab.id as typeof filter);
                }}
                onMouseEnter={() => sound.playHover()}
                className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                    : 'glass-panel text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Tilt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              onSelect={() => {
                sound.playClick();
                setSelectedProject(project);
              }}
            />
          ))}
        </div>
      </div>

      {/* Deep-Dive Project Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
};

// 3D Tilt Card Component
const ProjectCard: React.FC<{
  project: ProjectData;
  index: number;
  onSelect: () => void;
}> = ({ project, index, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="cursor-pointer group select-none"
    >
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${
            isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'
          }`,
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-[#00F5FF]/40 relative overflow-hidden flex flex-col justify-between min-h-[400px] shadow-2xl transition-colors duration-300"
      >
        {/* Dynamic Light Sheen on hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at 50% 50%, ${project.color}15, transparent 70%)`,
          }}
        />

        {/* Card Header & Badges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${project.color}15`,
                color: project.color,
                border: `1px solid ${project.color}35`,
              }}
            >
              {project.badge}
            </span>
            <span className="text-xs font-mono text-slate-500">0{index + 1} // SYS</span>
          </div>

          <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-[#00F5FF] transition-colors mb-1.5">
            {project.title}
          </h3>
          <p className="text-xs font-space font-medium text-[#7C4DFF] mb-3">
            {project.subtitle}
          </p>

          <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4 line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 gap-2 my-2">
          {project.metrics.slice(0, 2).map((m) => (
            <div
              key={m.label}
              className="bg-[#05060A]/80 p-2 rounded-xl border border-white/5 text-center"
            >
              <div className="font-orbitron font-bold text-xs text-white">{m.value}</div>
              <div className="text-[9px] font-mono text-slate-400">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Card Footer: Tags & Explore Prompt */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/60 text-slate-300 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-[#00F5FF] group-hover:translate-x-1 transition-transform">
            <span>INSPECT</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
