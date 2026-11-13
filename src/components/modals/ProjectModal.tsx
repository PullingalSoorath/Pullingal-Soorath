import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Check, Cpu } from 'lucide-react';
import { GithubIcon } from '../icons/SocialIcons';
import { sound } from '../audio/audioEngine';

export interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  description: string;
  fullOverview: string;
  architecturePoints: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  techStack: string[];
  color: string;
  githubUrl: string;
  liveUrl: string;
  screenType: 'dating' | 'mobile' | 'web' | 'fintech' | 'ai';
}

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    if (project) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [project, onClose]);

  if (!project) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pt-20 sm:p-6 md:p-8 overflow-y-auto overscroll-contain bg-black/90 backdrop-blur-2xl animate-fadeIn"
      onClick={() => {
        sound.playClick();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/20 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] my-auto max-h-[90vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent Header */}
        <div
          className="sticky -top-6 sm:-top-10 -mx-6 sm:-mx-10 h-1.5 rounded-t-3xl z-10"
          style={{ background: `linear-gradient(90deg, ${project.color}, #00F5FF, #7C4DFF)` }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#00F5FF]/50 hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Close project modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header telemetry */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-mono font-bold px-3 py-1 rounded-full uppercase"
            style={{
              backgroundColor: `${project.color}15`,
              color: project.color,
              border: `1px solid ${project.color}40`,
            }}
          >
            {project.badge}
          </span>
          <span className="text-xs font-mono text-slate-500">• {project.category}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold font-orbitron text-white mb-2">
          {project.title}
        </h2>
        <p className="text-sm sm:text-base font-space text-[#00F5FF] mb-6">
          {project.subtitle}
        </p>

        {/* Two Column Layout: Architecture & Live Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
          {/* Left Column: Full overview & Architecture */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#00F5FF]" />
                <span>SYSTEM ARCHITECTURE & OVERVIEW</span>
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {project.fullOverview}
              </p>
            </div>

            {/* Architecture key highlights */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                KEY TECHNICAL HIGHLIGHTS
              </h4>
              <ul className="space-y-2.5">
                {project.architecturePoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-[#00F5FF] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack Pills */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                INTEGRATED STACK MODULES
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
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

          {/* Right Column: Performance Telemetry & Action Anchors */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Telemetry Metrics */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="text-xs font-mono text-[#00F5FF] flex items-center justify-between">
                <span>BENCHMARK TELEMETRY</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {project.metrics.map((m) => (
                  <div key={m.label} className="bg-black/50 p-3 rounded-xl border border-white/5">
                    <div className="text-lg font-orbitron font-bold text-white">{m.value}</div>
                    <div className="text-[10px] font-mono text-slate-400">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Links CTA Hub */}
            <div className="flex flex-col gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              >
                <span>LAUNCH LIVE DEMO / PREVIEW</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playClick()}
                onMouseEnter={() => sound.playHover()}
                className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-slate-300 glass-panel border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <GithubIcon className="w-4 h-4" />
                <span>INSPECT SOURCE CODE [GITHUB]</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
