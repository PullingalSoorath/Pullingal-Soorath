import React from 'react';
import { HeroViewport3D } from '../3d/HeroViewport3D';
import { sound } from '../audio/audioEngine';
import {
  ArrowDown,
  Terminal,
  Activity,
  Code2,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenCVModal: () => void;
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenCVModal, onNavigate }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 flex flex-col justify-center overflow-hidden"
    >
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F5FF]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#7C4DFF]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        {/* Top Header Banner: Spans Full Container Width, NEVER Overlapped by Phone/Tablet */}
        <div className="mb-6 lg:mb-8 text-left z-20 relative">
          {/* Super-Title Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#00F5FF]/30 w-fit mb-4 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#00F5FF] animate-ping" />
            <span className="text-xs font-mono font-medium tracking-widest text-[#00F5FF] uppercase">
              FLUTTER DEVELOPER &bull; UI/UX DESIGNER &bull; WEB DESIGNER
            </span>
          </div>

          {/* Headline: PULLINGAL SOORATH in a Single Line at the Top */}
          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold font-orbitron tracking-tight text-white mb-3 leading-tight sm:whitespace-nowrap">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 mr-2 sm:mr-4">
              PULLINGAL
            </span>
            <span className="text-[#00F5FF] text-glow-cyan">
              SOORATH
            </span>
          </h1>

          {/* Subhead with Rich Detail */}
          <p className="text-base sm:text-lg md:text-xl font-space font-medium text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="text-[#00F5FF]">Flutter Developer</span>
            <span className="text-slate-600">•</span>
            <span className="text-[#7C4DFF]">UI/UX Designer</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">Web Designer</span>
          </p>
        </div>

        {/* 2-Column Grid: Left for Bio + CTAs, Right for Interactive Smartphone & 3D View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
          {/* Left Column: Bio Paragraph & Action Hub */}
          <div className="lg:col-span-5 flex flex-col justify-start z-20">
            <p className="text-sm sm:text-base text-slate-400 font-sans max-w-xl mb-8 leading-relaxed">
              Passionate software engineer skilled in Flutter framework design, reactive state pipelines (BLoC / Provider),
              Firebase, and high-fidelity interface design. Successfully transitioned from a non-IT background to high-performance
              mobile development through strong adaptability, rapid problem solving, and relentless self-learning.
            </p>

            {/* Action Hub */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('projects');
                }}
                onMouseEnter={() => sound.playHover()}
                className="group relative px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider text-black overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,245,255,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] group-hover:brightness-110" />
                <span className="relative z-10 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-black" />
                  <span>EXPLORE FLUTTER APPS</span>
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCVModal();
                }}
                onMouseEnter={() => sound.playHover()}
                className="px-6 py-3.5 rounded-xl glass-panel font-mono text-xs font-bold tracking-wider text-slate-200 border border-white/15 hover:border-[#7C4DFF]/60 hover:text-[#7C4DFF] transition-all flex items-center gap-2 group shadow-lg"
              >
                <Terminal className="w-4 h-4 text-[#7C4DFF] group-hover:animate-pulse" />
                <span>DOWNLOAD RESUME CV</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('about');
                }}
                onMouseEnter={() => sound.playHover()}
                className="p-3.5 rounded-xl glass-panel text-slate-400 hover:text-[#00F5FF] border border-white/10 hover:border-[#00F5FF]/40 transition-all"
                title="Scroll Down to Core Identity"
              >
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Hologram Monolith & Smart Phone View */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <HeroViewport3D onOpenCVModal={onOpenCVModal} />
          </div>
        </div>
      </div>

      {/* Floating System Coordinates Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span>GEO-NODE: Thirupuram, Trivandrum, Kerala, India</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Code2 className="w-3.5 h-3.5 text-[#7C4DFF]" />
            <span>STACK: Flutter &bull; Dart &bull; Firebase &bull; BLoC &bull; SQFlite</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">SMART PHONE VIEW &bull; LIVE SIMULATION</span>
        </div>
      </div>
    </section>
  );
};
