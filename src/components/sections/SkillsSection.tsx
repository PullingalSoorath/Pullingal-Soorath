import React, { useState } from 'react';
import { SkillsConstellation3D } from '../3d/SkillsConstellation3D';
import { sound } from '../audio/audioEngine';
import {
  Smartphone,
  Palette,
  Database,
  Cpu,
  Search,
  Sliders,
} from 'lucide-react';

interface SkillItem {
  name: string;
  level: number;
  tags: string[];
  description: string;
}

interface SkillCategory {
  id: string;
  title: string;
  code: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  skills: SkillItem[];
}

export const SkillsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'constellation'>('cards');

  const categories: SkillCategory[] = [
    {
      id: 'flutter-core',
      title: 'Flutter Framework & State',
      code: 'CATEGORY // 01',
      icon: Smartphone,
      color: '#00F5FF',
      borderColor: 'border-[#00F5FF]/30',
      skills: [
        {
          name: 'Flutter App Development',
          level: 96,
          tags: ['Mobile UI', 'Clean Architecture', 'Widget Tree', 'Cross-Platform'],
          description: 'Skilled in Flutter framework design and UI development, architecting high-performance iOS and Android mobile apps.',
        },
        {
          name: 'Dart Programming Language',
          level: 95,
          tags: ['OOP', 'Async/Await', 'Streams', 'Sound Null Safety'],
          description: 'Strong proficiency in Dart OOP, asynchronous streams, functional programming, and clean modular code structures.',
        },
        {
          name: 'BLoC & Provider State Management',
          level: 94,
          tags: ['State Machine', 'Cubit', 'Reactive Streams', 'Provider'],
          description: 'Managing complex asynchronous state with predictable, decoupled unidirectional data flows using BLoC and Provider.',
        },
        {
          name: 'REST API Integration',
          level: 94,
          tags: ['Dio', 'HTTP Client', 'JSON Serialization', 'Error Handling'],
          description: 'Connecting Flutter frontends to REST APIs with token interceptors, CRUD operations, and error handling.',
        },
        {
          name: 'Firebase Ecosystem',
          level: 92,
          tags: ['Firebase Auth', 'Cloud Firestore', 'Cloud Storage', 'FCM Push'],
          description: 'User authentication, real-time message streams, cloud database synchronization, and background push notifications.',
        },
      ],
    },
    {
      id: 'storage',
      title: 'Databases & Local Storage',
      code: 'CATEGORY // 02',
      icon: Database,
      color: '#3D5AFE',
      borderColor: 'border-[#3D5AFE]/30',
      skills: [
        {
          name: 'SQFlite Database',
          level: 90,
          tags: ['Relational SQL', 'Offline Caching', 'CRUD Tables', 'Indexing'],
          description: 'Relational SQLite storage in Flutter for robust offline-first caching and structured data models.',
        },
        {
          name: 'Hive Local NoSQL Storage',
          level: 92,
          tags: ['Key-Value', 'Lightweight', 'High Speed', 'Type Adapters'],
          description: 'Blazing-fast lightweight NoSQL key-value database for instant state hydration and offline queues.',
        },
        {
          name: 'Shared Preferences',
          level: 95,
          tags: ['Key-Value', 'User Settings', 'Theme Flags', 'Tokens'],
          description: 'Persisting user authentication tokens, theme preferences, and app configurations across app lifecycles.',
        },
      ],
    },
    {
      id: 'design',
      title: 'UI/UX Design & Creative Tools',
      code: 'CATEGORY // 03',
      icon: Palette,
      color: '#7C4DFF',
      borderColor: 'border-[#7C4DFF]/30',
      skills: [
        {
          name: 'UI/UX Design & Spatial Ergonomics',
          level: 95,
          tags: ['Intuitive Flow', 'Mobile Ergonomics', 'Micro-Interactions'],
          description: 'Passion for designing exceptional user interfaces and crafting engaging, frictionless user experiences.',
        },
        {
          name: 'Figma & Adobe XD',
          level: 94,
          tags: ['Wireframes', 'Prototypes', 'Design Systems', 'Auto-Layout'],
          description: 'High-fidelity interactive prototyping, responsive auto-layout systems, and design tokens translated to Flutter code.',
        },
        {
          name: 'Adobe Photoshop',
          level: 88,
          tags: ['Asset Synthesis', 'Graphics Polish', 'Visual Aesthetics'],
          description: 'Crafting UI visual assets, banner graphics, textures, and digital creative media synthesis.',
        },
        {
          name: 'HTML5 & Modern CSS3',
          level: 90,
          tags: ['Semantic Web', 'Flexbox', 'CSS Grid', 'Responsive'],
          description: 'Web markup, responsive layouts, style cascades, and cross-browser responsive interfaces.',
        },
      ],
    },
    {
      id: 'professional',
      title: 'Core Professional & Engineering',
      code: 'CATEGORY // 04',
      icon: Cpu,
      color: '#10B981',
      borderColor: 'border-[#10B981]/30',
      skills: [
        {
          name: 'Self-Learner & Rapid Adaptation',
          level: 98,
          tags: ['Continuous Growth', 'Non-IT to IT', 'Tenacity', 'Curiosity'],
          description: 'Strong self-learner with a passion for continuously acquiring new skills to stay at the forefront of technology trends.',
        },
        {
          name: 'Effective Communication',
          level: 94,
          tags: ['Team Collaboration', 'Sprint Syncs', 'Documentation'],
          description: 'Clear, concise technical and interpersonal communication in agile development sprints and code reviews.',
        },
        {
          name: 'Git & GitHub Version Control',
          level: 92,
          tags: ['Feature Branching', 'Pull Requests', 'Version Tagging', 'CI/CD'],
          description: 'Branching strategies, collaborative workflows, commit hygiene, and code repository management.',
        },
      ],
    },
  ];

  const filteredCategories = categories
    .map((cat) => {
      if (activeCategory !== 'all' && cat.id !== activeCategory) return null;
      const matchingSkills = cat.skills.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingSkills.length === 0 && searchQuery) return null;
      return { ...cat, skills: matchingSkills };
    })
    .filter(Boolean) as SkillCategory[];

  return (
    <section id="skills" className="relative py-24 sm:py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3D5AFE]/10 border border-[#3D5AFE]/30 text-xs font-mono text-[#3D5AFE] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3D5AFE]" />
              <span>02 // CAPABILITY TELEMETRY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-orbitron text-white tracking-tight">
              VERIFIED <span className="text-[#00F5FF]">SKILL MATRIX</span>
            </h2>
            <p className="text-sm sm:text-base font-space text-slate-400 mt-2 max-w-2xl">
              From Flutter & Dart framework architecture to BLoC state, SQFlite/Hive storage, and Figma UI/UX design.
            </p>
          </div>

          {/* Toggle between 3D Constellation and Grid view */}
          <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('cards');
              }}
              onMouseEnter={() => sound.playHover()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Matrix Cards</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('constellation');
              }}
              onMouseEnter={() => sound.playHover()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                viewMode === 'constellation'
                  ? 'bg-[#7C4DFF]/20 text-[#7C4DFF] border border-[#7C4DFF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>3D Constellation</span>
            </button>
          </div>
        </div>

        {/* View 1: 3D Constellation */}
        {viewMode === 'constellation' ? (
          <div className="mb-12">
            <SkillsConstellation3D />
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory('all');
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                    activeCategory === 'all'
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'glass-panel text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  ALL CAPABILITIES
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveCategory(cat.id);
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/50 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                        : 'glass-panel text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter skills (e.g. BLoC, Hive, Figma)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-panel pl-10 pr-4 py-2 rounded-xl text-xs font-mono text-white placeholder-slate-500 border border-white/10 focus:border-[#00F5FF]/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Categorized Skill Matrices */}
            <div className="space-y-12">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className="space-y-6">
                    {/* Category Title Banner */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                            {cat.code}
                          </span>
                          <h3 className="text-xl font-bold font-space text-white">{cat.title}</h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {cat.skills.length} Modules Verified
                      </span>
                    </div>

                    {/* Skill Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {cat.skills.map((skill) => (
                        <div
                          key={skill.name}
                          onMouseEnter={() => sound.playHover()}
                          className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 flex flex-col justify-between group relative overflow-hidden"
                        >
                          {/* Accent corner glow */}
                          <div
                            className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-60 transition-opacity"
                            style={{ backgroundColor: cat.color }}
                          />

                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h4 className="font-space font-bold text-base text-white group-hover:text-[#00F5FF] transition-colors">
                                {skill.name}
                              </h4>
                              <span
                                className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${cat.color}15`,
                                  color: cat.color,
                                  border: `1px solid ${cat.color}35`,
                                }}
                              >
                                {skill.level}%
                              </span>
                            </div>

                            {/* Progress Meter */}
                            <div className="w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden mb-4 border border-white/5">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${skill.level}%`,
                                  background: `linear-gradient(90deg, ${cat.color} 0%, #00F5FF 100%)`,
                                  boxShadow: `0 0 10px ${cat.color}80`,
                                }}
                              />
                            </div>

                            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                              {skill.description}
                            </p>
                          </div>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                            {skill.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#05060A]/90 text-slate-300 border border-white/5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
