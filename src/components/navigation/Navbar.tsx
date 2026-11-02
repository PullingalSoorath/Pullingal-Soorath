import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, Terminal, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { sound } from '../audio/audioEngine';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenCVModal: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCVModal, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ['hero', 'about', 'skills', 'projects', 'timeline', 'connect'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const navLinks = [
    { id: 'hero', label: 'Core' },
    { id: 'about', label: 'Identity' },
    { id: 'skills', label: 'Matrix' },
    { id: 'projects', label: 'Showcase' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'connect', label: 'Connect' },
  ];

  return (
    <>
      <header
        className={`fixed top-4 left-0 right-0 z-40 px-4 transition-all duration-300 flex justify-center ${
          isScrolled ? 'translate-y-0' : 'translate-y-1'
        }`}
      >
        <nav className="w-full max-w-6xl glass-panel px-4 sm:px-6 py-3 rounded-full flex items-center justify-between border border-[#00F5FF]/20 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Brand & User's Custom Logo Icon */}
          <div
            onClick={() => onNavigate('hero')}
            onMouseEnter={() => sound.playHover()}
          >
            <BrandLogo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-[#05060A]/60 px-3 py-1.5 rounded-full border border-white/5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    sound.playClick();
                    onNavigate(link.id);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/40 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Synthesizer Toggle */}
            <button
              onClick={toggleSound}
              onMouseEnter={() => sound.playHover()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full glass-panel border border-white/10 hover:border-[#00F5FF]/40 text-slate-300 hover:text-[#00F5FF] transition-all flex items-center gap-2 text-xs font-mono"
              title={isMuted ? 'Activate Procedural Cyber Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline text-[11px] text-slate-400">AUDIO OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#00F5FF] animate-pulse" />
                  <div className="hidden sm:flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-[#00F5FF] h-2 animate-bounce" />
                    <span className="w-0.5 bg-[#00F5FF] h-3 animate-pulse" />
                    <span className="w-0.5 bg-[#00F5FF] h-1.5 animate-bounce" />
                  </div>
                </>
              )}
            </button>

            {/* Quick CV Download Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenCVModal();
              }}
              onMouseEnter={() => sound.playHover()}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border border-white/10 hover:border-[#7C4DFF]/50 text-slate-300 hover:text-[#7C4DFF] text-xs font-mono transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-[#7C4DFF]" />
              <span>CV.sh</span>
            </button>

            {/* Glowing CTA "Deploy Interaction" / "Hire Me" */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('connect');
              }}
              onMouseEnter={() => sound.playHover()}
              className="relative group px-4 py-1.5 sm:px-5 sm:py-2 rounded-full overflow-hidden text-xs font-mono font-semibold tracking-wider text-black transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] group-hover:brightness-110 transition-all" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-1.5">
                <span>HIRE ME</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-black" />
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-full glass-panel border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/95 backdrop-blur-3xl md:hidden pt-24 px-6 flex flex-col justify-between pb-12 animate-fadeIn">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-mono text-slate-500 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>SYSTEM NAVIGATION</span>
              <span className="text-[#00F5FF]">PS // FLUTTER ARCHITECT</span>
            </div>

            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between py-3 px-4 rounded-xl text-left font-space text-lg font-bold text-slate-200 hover:text-[#00F5FF] hover:bg-white/5 border border-transparent hover:border-[#00F5FF]/20 transition-all"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}

            <button
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
                onOpenCVModal();
              }}
              className="flex items-center justify-between py-3 px-4 rounded-xl text-left font-mono text-sm text-[#7C4DFF] bg-[#7C4DFF]/10 border border-[#7C4DFF]/30 mt-2"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>TERMINAL CV DOWNLOAD</span>
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00F5FF]" />
              <span>Pullingal Soorath &bull; Flutter Developer</span>
            </div>
            <span>Professional Flutter Developer &bull; Thirupuram, Trivandrum, Kerala</span>
          </div>
        </div>
      )}
    </>
  );
};
