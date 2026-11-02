import React, { useState } from 'react';
import { sound } from '../audio/audioEngine';
import { MapPin, ChevronRight, Award } from 'lucide-react';

interface Milestone {
  id: string;
  year: string;
  role: string;
  institution: string;
  category: 'engineering' | 'academic' | 'transition';
  location: string;
  summary: string;
  achievements: string[];
  techTags: string[];
  color: string;
}

export const TimelineSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('flutter-dev');

  const milestones: Milestone[] = [
    {
      id: 'flutter-dev',
      year: '2023 - Present',
      role: 'Professional Flutter Developer',
      institution: 'Professional Mobile Engineering',
      category: 'engineering',
      location: 'Kerala, India',
      summary:
        'Intensive professional engineering focused on end-to-end Flutter mobile app development. Built real-time chat engines, Google Gemini AI assistant, high-fidelity Instagram and YouTube clones, retro Snake game, and REST API to-do systems.',
      achievements: [
        'Developed real-time Chat Application with Firebase Auth, Cloud Firestore streams, group chat, and FCM notifications.',
        'Engineered an AI Chat Bot leveraging Google Gemini API and Firebase persistence.',
        'Created high-fidelity Instagram and YouTube UI clones adhering to clean architecture and smooth 60FPS animations.',
        'Mastered state management (BLoC, Provider) and persistent storage (SQFlite, Hive, Shared Preferences).',
      ],
      techTags: ['Flutter', 'Dart', 'Firebase', 'REST API', 'BLoC', 'Provider', 'Hive', 'SQFlite', 'Git Hub'],
      color: '#00F5FF',
    },
    {
      id: 'iti-dhanuvachapuram',
      year: '2019 - 2022',
      role: 'Industrial Training Institution (ITI)',
      institution: 'Govt. ITI Dhanuvachapuram',
      category: 'academic',
      location: 'Dhanuvachapuram, Kerala',
      summary:
        'Rigorous industrial engineering training at Government ITI Dhanuvachapuram. Built strong analytical logic, discipline, technical troubleshooting, and structured problem-solving foundations.',
      achievements: [
        'Completed comprehensive technical curriculum with practical laboratory honors.',
        'Fostered extreme diagnostic precision, work ethic, and adaptability under demanding production standards.',
      ],
      techTags: ['Govt. ITI', 'Industrial Training', 'Technical Diagnostics', 'Problem Solving'],
      color: '#3D5AFE',
    },
    {
      id: 'dca-pearl',
      year: '2017 - 2018',
      role: 'Diploma In Computer Application (DCA)',
      institution: 'Pearl Computer Institution (C-DIT)',
      category: 'academic',
      location: 'Kerala, India',
      summary:
        'Foundational computing diploma accredited through C-DIT. Introduced computer software foundations, database structures, operating systems, and digital workflows.',
      achievements: [
        'Acquired foundational computer software literacy, database concepts, and operating systems fundamentals.',
        'Earned official state accreditation from C-DIT credentialing authority.',
      ],
      techTags: ['DCA Diploma', 'C-DIT Accredited', 'Computer Applications', 'Software Fundamentals'],
      color: '#7C4DFF',
    },
    {
      id: 'pkshss',
      year: '2017 - 2019',
      role: 'Higher Secondary Education',
      institution: 'P K S H S S Kanjiramkulam',
      category: 'academic',
      location: 'Kanjiramkulam, Kerala',
      summary:
        'Completed Higher Secondary academic foundations at P K S H S S Kanjiramkulam, building quantitative, scientific, and communication disciplines.',
      achievements: [
        'Completed higher secondary curriculum with active participation in academic and creative extracurriculars.',
        'Developed foundational discipline and desire for continuous technical growth.',
      ],
      techTags: ['Higher Secondary', 'Academic Discipline', 'Kanjiramkulam'],
      color: '#EC4899',
    },
  ];

  return (
    <section id="timeline" className="relative py-24 sm:py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7C4DFF]/10 border border-[#7C4DFF]/30 text-xs font-mono text-[#7C4DFF] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF]" />
            <span>04 // SYSTEM TRAJECTORY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-orbitron text-white tracking-tight">
            JOURNEY & <span className="text-[#00F5FF]">EDUCATION</span>
          </h2>
          <p className="text-sm sm:text-base font-space text-slate-400 mt-2 max-w-2xl">
            Verified academic milestones and professional software development sprints of Pullingal Soorath.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Chronological Nodes list */}
          <div className="lg:col-span-5 relative">
            {/* Glowing Wireframe Spine Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] opacity-30" />

            <div className="space-y-4 relative z-10">
              {milestones.map((m, idx) => {
                const isSelected = selectedId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedId(m.id);
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'glass-panel border border-[#00F5FF]/50 bg-[#00F5FF]/5 shadow-[0_0_20px_rgba(0,245,255,0.15)] translate-x-2'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {/* Node Dot */}
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#00F5FF] shadow-[0_0_12px_#00F5FF]'
                          : 'bg-slate-800 border border-white/20'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span
                          className="font-bold uppercase tracking-wider"
                          style={{ color: m.color }}
                        >
                          {m.year}
                        </span>
                        <span className="text-slate-500">PHASE 0{idx + 1}</span>
                      </div>
                      <h4 className="text-base font-bold font-space text-white">{m.role}</h4>
                      <p className="text-xs font-mono text-slate-400">{m.institution}</p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-[#00F5FF] translate-x-1' : 'text-slate-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Milestone Detail HUD */}
          <div className="lg:col-span-7">
            {(() => {
              const active = milestones.find((m) => m.id === selectedId) || milestones[0];
              return (
                <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden animate-fadeIn">
                  {/* Glowing header banner */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${active.color}, transparent)` }}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                    <div>
                      <span
                        className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${active.color}15`,
                          color: active.color,
                          border: `1px solid ${active.color}40`,
                        }}
                      >
                        {active.year}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#00F5FF]" />
                      <span>{active.location}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold font-space text-white mb-2">
                    {active.role}
                  </h3>
                  <div className="text-sm font-mono text-[#00F5FF] mb-6 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{active.institution}</span>
                  </div>

                  <p className="text-sm text-slate-300 font-sans leading-relaxed mb-8">
                    {active.summary}
                  </p>

                  {/* Key highlights */}
                  <div className="space-y-3 mb-8">
                    <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      EXECUTION HIGHLIGHTS & OUTCOMES
                    </h5>
                    {active.achievements.map((ach, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] mt-2 shrink-0" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Tags */}
                  <div className="pt-6 border-t border-white/10">
                    <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                      ACQUIRED CAPABILITIES & SKILLS
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {active.techTags.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-mono px-3 py-1 rounded-lg bg-[#05060A] text-slate-200 border border-white/10"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};
