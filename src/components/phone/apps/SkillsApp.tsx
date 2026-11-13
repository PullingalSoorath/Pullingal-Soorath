import React, { useState } from 'react';
import {
  Code,
  Layers,
  Database,
  Palette,
  GitBranch,
  Sparkles,
  Search,
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';

interface SkillItem {
  name: string;
  category: 'flutter' | 'backend' | 'design' | 'tools';
  categoryLabel: string;
  level: number; // percentage
  status: string;
  description: string;
  icon: React.ElementType;
}

export const SkillsApp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'flutter' | 'backend' | 'design' | 'tools'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const skills: SkillItem[] = [
    {
      name: 'Flutter Framework',
      category: 'flutter',
      categoryLabel: 'Core Mobile',
      level: 95,
      status: 'Core Expertise',
      description: 'Building responsive cross-platform UIs, custom widgets, physics-based animations, and 60FPS fluid screen workflows.',
      icon: Code,
    },
    {
      name: 'Dart Language',
      category: 'flutter',
      categoryLabel: 'Core Language',
      level: 95,
      status: 'Advanced',
      description: 'Strong OOP foundations, asynchronous Futures & Streams pipelines, null safety, and clean code principles.',
      icon: Zap,
    },
    {
      name: 'BLoC Pattern',
      category: 'flutter',
      categoryLabel: 'State Management',
      level: 92,
      status: 'Architectural',
      description: 'Decoupling UI layers from business logic using event-driven reactive BLoC and Cubit state management.',
      icon: Layers,
    },
    {
      name: 'Provider Pattern',
      category: 'flutter',
      categoryLabel: 'State Management',
      level: 90,
      status: 'Advanced',
      description: 'Scoped widget tree state injection, ChangeNotifier architectures, and reactive UI rebuild optimizations.',
      icon: Layers,
    },
    {
      name: 'Firebase Ecosystem',
      category: 'backend',
      categoryLabel: 'Cloud & Auth',
      level: 92,
      status: 'Production',
      description: 'Firebase Authentication, Cloud Firestore real-time sync, Cloud Messaging (FCM) notifications, and storage.',
      icon: Database,
    },
    {
      name: 'REST API Integration',
      category: 'backend',
      categoryLabel: 'Networking',
      level: 94,
      status: 'Production',
      description: 'Consuming HTTP endpoints, JSON serialization/deserialization, pagination, bearer token security, and error handling.',
      icon: Database,
    },
    {
      name: 'SQFlite & Hive DB',
      category: 'backend',
      categoryLabel: 'Local Storage',
      level: 88,
      status: 'Advanced',
      description: 'Local relational SQLite querying via SQFlite and blazing fast NoSQL key-value cache storage using Hive.',
      icon: Database,
    },
    {
      name: 'Shared Preferences',
      category: 'backend',
      categoryLabel: 'Persistence',
      level: 96,
      status: 'Mastered',
      description: 'User session tokens, application settings, dark/light theme persistence, and offline cached flags.',
      icon: Database,
    },
    {
      name: 'Figma UI/UX Design',
      category: 'design',
      categoryLabel: 'UI/UX Design',
      level: 92,
      status: 'Specialist',
      description: 'Creating high-fidelity wireframes, interactive mobile prototypes, component libraries, and translating designs to Flutter.',
      icon: Palette,
    },
    {
      name: 'Adobe XD',
      category: 'design',
      categoryLabel: 'UI/UX Design',
      level: 88,
      status: 'Proficient',
      description: 'User experience flow mapping, artboard layouts, and vector asset exporting for mobile applications.',
      icon: Palette,
    },
    {
      name: 'Adobe Photoshop',
      category: 'design',
      categoryLabel: 'Graphic Design',
      level: 85,
      status: 'Proficient',
      description: 'Asset optimization, raster mask editing, neon lighting touchups, and banner generation.',
      icon: Palette,
    },
    {
      name: 'HTML & CSS',
      category: 'design',
      categoryLabel: 'Web Foundations',
      level: 85,
      status: 'Proficient',
      description: 'Semantic markup, modern flexbox/grid layout design, and responsive styling principles.',
      icon: Code,
    },
    {
      name: 'Git & GitHub',
      category: 'tools',
      categoryLabel: 'DevOps & VCS',
      level: 90,
      status: 'Advanced',
      description: 'Branch management, pull requests, merge conflict resolution, and collaborative GitHub repository maintenance.',
      icon: GitBranch,
    },
    {
      name: 'Self-Learning & Adaptability',
      category: 'tools',
      categoryLabel: 'Core Strength',
      level: 100,
      status: 'Proven Track Record',
      description: 'Successfully self-transitioned from a non-IT background into professional Flutter development through intensive discipline.',
      icon: Sparkles,
    },
  ];

  const filteredSkills = skills.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#06080e] text-white animate-fadeIn select-none font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div>
          <h3 className="font-space font-bold text-sm flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#7C4DFF]" />
            <span>Technical Skills</span>
          </h3>
          <p className="text-[10px] font-mono text-slate-400">
            Flutter &bull; State Architecture &bull; UI/UX
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C4DFF]/15 text-[#7C4DFF] border border-[#7C4DFF]/30">
          Verified
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2.5 pb-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => e.target.focus({ preventScroll: true })}
            placeholder="Search skills (e.g. Flutter, BLoC, Figma)..."
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C4DFF]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-2.5 pb-2 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'All (14)' },
          { id: 'flutter', label: 'Flutter Core' },
          { id: 'backend', label: 'Backend & DB' },
          { id: 'design', label: 'UI/UX Design' },
          { id: 'tools', label: 'Tools' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sound.playClick();
              setActiveCategory(cat.id as typeof activeCategory);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#7C4DFF] text-white font-bold shadow-[0_0_10px_rgba(124,77,255,0.4)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-2.5 pb-3 space-y-2">
        {filteredSkills.map((skill) => {
          const Icon = skill.icon;
          return (
            <div
              key={skill.name}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sound.playClick();
                setSelectedSkill(skill);
              }}
              className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-[#7C4DFF]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 flex items-center justify-center text-[#7C4DFF] group-hover:scale-110 transition-transform">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00F5FF] transition-colors">
                      {skill.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400">
                      {skill.categoryLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#00F5FF]">
                    {skill.level}%
                  </span>
                  <div className="text-[9px] font-mono text-emerald-400">
                    {skill.status}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden mb-1.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] rounded-full transition-all duration-700"
                  style={{ width: `${skill.level}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-300 leading-tight">
                {skill.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detail Popover Modal */}
      {selectedSkill && (
        <div className="absolute inset-0 z-50 bg-[#06080e]/95 backdrop-blur-md p-4 flex flex-col justify-between animate-fadeIn">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono text-[#7C4DFF] uppercase">
                {selectedSkill.categoryLabel}
              </span>
              <button
                onClick={() => setSelectedSkill(null)}
                className="px-2 py-0.5 rounded-lg bg-white/10 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7C4DFF]/20 border border-[#7C4DFF]/40 flex items-center justify-center text-[#7C4DFF]">
                <selectedSkill.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-space">
                  {selectedSkill.name}
                </h3>
                <span className="text-xs font-mono text-[#00F5FF]">
                  Proficiency Rating: {selectedSkill.level}% &bull; {selectedSkill.status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-300 leading-relaxed">
              {selectedSkill.description}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Production Application
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  Implemented across production Flutter apps and professional architectural sprints with clean separation of concerns and high responsiveness.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSkill(null)}
            className="w-full py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#6b3fe3] text-white font-bold text-xs"
          >
            Back to All Skills
          </button>
        </div>
      )}
    </div>
  );
};
