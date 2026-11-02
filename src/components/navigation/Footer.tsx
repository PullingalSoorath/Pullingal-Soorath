import React from 'react';
import { sound } from '../audio/audioEngine';
import {
  ArrowUp,
  Mail,
  Phone,
  MapPin,
  Cpu,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../icons/SocialIcons';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    sound.playChirp(900, 0.1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#030407] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Background glow line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F5FF]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand & Manifesto with User's Logo */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-slate-900 border border-[#00F5FF]/30 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
                <img src="./ps-logo.png" alt="PS Logo" className="h-8 w-auto object-contain" />
              </div>
              <span className="font-orbitron font-extrabold text-sm text-white tracking-wider">
                PULLINGAL SOORATH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
              Flutter Developer &bull; UI/UX Designer &bull; Web Designer. Building high-performance mobile applications,
              real-time Firebase chat engines, Gemini AI integrations, and interactive mobile simulation experiences.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Flutter Developer & Mobile Engineering Roles</span>
            </div>
          </div>

          {/* Quick Navigation Coordinates */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h4 className="text-white font-bold tracking-wider text-xs uppercase mb-3">
              SYSTEM SECTORS
            </h4>
            <ul className="space-y-2">
              {[
                { id: 'hero', label: 'Core Overview' },
                { id: 'about', label: 'Human Architecture' },
                { id: 'skills', label: 'Skill Matrix' },
                { id: 'projects', label: 'Featured Projects' },
                { id: 'timeline', label: 'Journey & Education' },
                { id: 'connect', label: 'Command Connect' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigate(link.id);
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className="text-slate-400 hover:text-[#00F5FF] transition-colors"
                  >
                    &gt; {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Coordinates & Social Anchors */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <h4 className="text-white font-bold tracking-wider text-xs uppercase mb-3">
              DIRECT COORDINATES
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00F5FF]" />
                <a href="mailto:pullingalsoorath@gmail.com" className="hover:text-white">
                  pullingalsoorath@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#7C4DFF]" />
                <a href="tel:+917025243579" className="hover:text-white">
                  +91 7025 2435 79
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#3D5AFE]" />
                <span>Thirupuram, Trivandrum, Kerala, India</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <a
                href="https://github.com/pullingalsoorath"
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => sound.playHover()}
                className="p-2.5 rounded-xl glass-panel border border-white/10 hover:border-[#00F5FF]/50 text-slate-300 hover:text-[#00F5FF] transition-all"
                title="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/pullingalsoorath"
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => sound.playHover()}
                className="p-2.5 rounded-xl glass-panel border border-white/10 hover:border-[#3D5AFE]/50 text-slate-300 hover:text-[#3D5AFE] transition-all"
                title="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* System Stamp & Back to Top */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span>&copy; {CURRENT_YEAR} Pullingal Soorath &bull; Powered by AntiGravity 3D Engine &bull; Smart Phone View</span>
          </div>

          <button
            onClick={scrollToTop}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#00F5FF]/40 transition-all"
          >
            <span>WARP TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#00F5FF]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
