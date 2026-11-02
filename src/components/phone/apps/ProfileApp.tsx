import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Download,
  Copy,
  Check,
  Globe,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';

interface ProfileAppProps {
  onOpenCVModal?: () => void;
  onOpenMessages?: () => void;
}

export const ProfileApp: React.FC<ProfileAppProps> = ({ onOpenCVModal, onOpenMessages }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    sound.playTerminalBeep(920);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="h-full bg-[#06080e] text-white animate-fadeIn overflow-y-auto p-3 space-y-3.5 font-sans select-none">
      {/* Top Profile Card */}
      <div className="relative p-4 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-violet-950/80 border border-white/15 shadow-xl text-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F5FF]/10 rounded-full blur-xl pointer-events-none" />

        {/* Profile Avatar with Neon Glow */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <img
            src="./profile-neon.jpg"
            alt="Pullingal Soorath"
            className="w-full h-full rounded-2xl object-cover object-top border-2 border-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.45),0_0_10px_rgba(255,42,133,0.35)]"
          />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black" />
          </span>
        </div>

        <h3 className="font-space font-bold text-lg text-white">Pullingal Soorath</h3>
        <p className="text-xs font-mono text-[#00F5FF] mt-0.5">Flutter Developer &bull; UI/UX Designer &bull; Web Designer</p>
        <p className="text-[11px] font-mono text-emerald-400 mt-1">Still Achieving New Technologies and Skills</p>

        {/* About Me Synopsis */}
        <p className="text-xs text-slate-300 leading-relaxed mt-3 text-left bg-black/40 p-3 rounded-xl border border-white/5">
          Self-Learned Flutter developer with a passion for designing exceptional user interfaces and crafting engaging mobile applications. Skilled in Flutter framework design and UI development, I have completed various projects to showcase my proficiency. My ability to self-learn and adapt has been instrumental in my journey to a career in software development. Successfully transitioned from a non-IT background to software development, demonstrating high adaptability and continuous self-learning.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3.5">
          {onOpenCVModal && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCVModal();
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#3D5AFE] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resume CV</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              if (onOpenMessages) {
                onOpenMessages();
              } else {
                window.location.href = 'mailto:pullingalsoorath@gmail.com';
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span>Message Me</span>
          </button>
        </div>
      </div>

      {/* Direct Contact Coordinates */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2 font-mono text-xs">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Direct Coordinates</div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Mail className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span>Email:</span>
          </span>
          <button
            onClick={() => handleCopy('pullingalsoorath@gmail.com', 'email')}
            className="flex items-center gap-1 text-[#00F5FF] hover:underline"
          >
            <span className="truncate max-w-[140px]">pullingalsoorath@gmail.com</span>
            {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Phone className="w-3.5 h-3.5 text-[#7C4DFF]" />
            <span>Phone:</span>
          </span>
          <button
            onClick={() => handleCopy('+917025243579', 'phone')}
            className="flex items-center gap-1 text-[#00F5FF] hover:underline"
          >
            <span>+91 7025 2435 79</span>
            {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#3D5AFE]" />
            <span>Location:</span>
          </span>
          <span className="text-white">Thirupuram, Trivandrum, Kerala, India</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Status:</span>
          </span>
          <span className="text-emerald-400 font-bold">Open for Roles</span>
        </div>
      </div>

      {/* Education Milestones */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2 text-xs">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Academic & Training History</div>

        <div className="border-l-2 border-[#00F5FF] pl-2.5 space-y-1">
          <div className="font-bold text-white">Professional Flutter App Development</div>
          <div className="text-[11px] text-[#00F5FF] font-mono">Professional Flutter Developer &bull; 2023 - Present</div>
          <div className="text-[10px] text-slate-400">Engineering reactive state engines and production mobile applications</div>
        </div>

        <div className="border-l-2 border-[#3D5AFE] pl-2.5 space-y-1">
          <div className="font-bold text-white">Industrial Training Institution (ITI)</div>
          <div className="text-[11px] text-slate-400 font-mono">Govt. ITI Dhanuvachapuram &bull; 2019 - 2022</div>
        </div>

        <div className="border-l-2 border-[#7C4DFF] pl-2.5 space-y-1">
          <div className="font-bold text-white">Diploma In Computer Application (DCA)</div>
          <div className="text-[11px] text-slate-400 font-mono">Pearl Computer Institution (C-DIT) &bull; 2017 - 2018</div>
        </div>

        <div className="border-l-2 border-[#EC4899] pl-2.5 space-y-1">
          <div className="font-bold text-white">Higher Secondary Education</div>
          <div className="text-[11px] text-slate-400 font-mono">P K S H S S Kanjiramkulam &bull; 2017 - 2019</div>
        </div>
      </div>

      {/* Transition Story Highlight */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-950/60 to-slate-900 border border-violet-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-[#00F5FF] font-mono font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Non-IT to Software Transition</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Transitioning into tech required strong self-discipline and persistence. Pullingal Soorath continuously acquires cutting-edge knowledge to stay ahead of technology trends and craft world-class software.
        </p>
      </div>
    </div>
  );
};
