import React, { useState, useEffect } from 'react';
import { X, Terminal, Download, Printer, ShieldCheck, FileText } from 'lucide-react';
import { sound } from '../audio/audioEngine';
import confetti from 'canvas-confetti';

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CVDownloadModal: React.FC<CVDownloadModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const logs = [
    'Establishing secure TLS handshake with Thirupuram, Trivandrum data vault...',
    'Authenticating Professional Flutter Developer credentials & production logs...',
    'Compiling Real-Time Chat, Gemini AI, Instagram Clone, RallyGame 3D, and To-Do case studies...',
    'Rendering PDF asset: Pullingal_Soorath_Flutter_Developer_Resume.pdf...',
    'Verified resume accreditation complete [STATUS: 200 OK].',
  ];

  useEffect(() => {
    if (isOpen) {
      setIsCompiling(true);
      setIsDone(false);
      setStep(0);
      setProgress(15);

      const t1 = setTimeout(() => {
        setStep(1);
        setProgress(38);
        sound.playTerminalBeep(520);
      }, 400);

      const t2 = setTimeout(() => {
        setStep(2);
        setProgress(65);
        sound.playTerminalBeep(640);
      }, 800);

      const t3 = setTimeout(() => {
        setStep(3);
        setProgress(88);
        sound.playTerminalBeep(780);
      }, 1200);

      const t4 = setTimeout(() => {
        setStep(4);
        setProgress(100);
        setIsCompiling(false);
        setIsDone(true);
        sound.playSuccess();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F5FF', '#7C4DFF', '#3D5AFE'],
        });
      }, 1600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleDownloadFile = () => {
    sound.playSuccess();
    const cvContent = `PULLINGAL SOORATH
Flutter Developer • UI/UX Architect
Thirupuram, Trivandrum, Kerala, India | pullingalsoorath@gmail.com | +91 7025 2435 79

==================================================
ABOUT ME:
==================================================
Self-Learned Flutter developer with a passion for designing exceptional user interfaces and crafting engaging mobile applications. Skilled in Flutter framework design and UI development, I have completed various projects to showcase my proficiency. My ability to self-learn and adapt has been instrumental in my journey to a career in software development. Successfully transitioned from a non-IT background to software development, highlighting adaptability and a strong desire for personal growth.

==================================================
WORK EXPERIENCE:
==================================================
Professional Flutter Developer — Mobile App Architecture
2023 - Present (Active Production & Engineering)
- Architected and delivered production-grade Flutter mobile apps adhering to Clean Architecture and SOLID principles.
- Engineered real-time chat with Firebase, Google Gemini AI Chat Bot, and animative interactive UI clones.
- Managed end-to-end development lifecycle from Figma prototyping to state management with BLoC and Provider.

==================================================
EDUCATION:
==================================================
1. Industrial Training Institution (ITI) | 2019 - 2022
   Govt. ITI Dhanuvachapuram
2. Diploma In Computer Application (DCA) | 2017 - 2018
   Pearl Computer Institution (C-DIT)
3. Higher Secondary | 2017 - 2019
   P K S H S S Kanjiramkulam

==================================================
FEATURED PROJECTS:
==================================================
1. Chat Application (Flutter, Firebase, REST API)
   Developed a real-time chat application using Flutter, Firebase, and REST APIs. Demonstrated experience in Flutter framework design, including user authentication, group chat, multimedia sharing, and real-time notifications. Managed the entire project lifecycle from design to deployment.

2. AI Chat Bot (Flutter, Gemini, Firebase)
   An AI chat bot application made by Flutter and Gemini, featuring intelligent conversational streaming and persistent history.

3. Instagram UI Clone (Flutter, Shared Preferences)
   Designed and developed a high-fidelity Instagram UI replica. Demonstrated expertise in Flutter framework design and UI/UX principles. Implemented navigation, state management, and interactive elements.

4. YouTube UI Clone (Flutter)
   Created a YouTube app UI clone, showcasing advanced Flutter skills. Proficient in handling video content, custom animations, and search functionalities. Achieved a visually appealing user interface, enhancing user experience.

5. RallyGame 3D (Three.js, Ray Physics, & Firebase)
   3D Rally racing application inspired by RallyGame featuring 6 unique cars (Rally 4WD, Muscle V8, Rocket, White Beast), 1v1 AI duels, nitro boost, stunt jumps, and Cloud Firestore CRUD high scores leaderboard.

6. To-Do App (Flutter, REST API)
   Designed and implemented a feature-rich to-do list application. Expertise in managing tasks, reminders, and sorting features. Prioritized a user-friendly design for efficient task management.

==================================================
TECHNICAL SKILLS:
==================================================
- Flutter App Development & Dart Programming
- REST API Integration & Firebase Integration
- State Management: BLoC, Provider
- Databases & Storage: SQFlite, Hive, Shared Preferences
- Web Technologies: HTML, CSS
- Design & Prototyping: Figma, Adobe XD, Photoshop, UI/UX Design
- Professional: Self-Learner, Effective Communication, Git & GitHub

==================================================
DECLARATION:
==================================================
I hereby declare that all the information provided in this resume is true and accurate to the best of my knowledge and belief.
`;

    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Pullingal_Soorath_Flutter_Resume.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pt-16 sm:p-6 overflow-y-auto overscroll-contain bg-black/90 backdrop-blur-2xl animate-fadeIn">
      <div
        className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/20 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF]" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#00F5FF]/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Personal Logo */}
        <div className="flex items-center gap-3 mb-4">
          <img src="./ps-logo.png" alt="PS Logo" className="h-9 w-auto object-contain" />
          <div>
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#00F5FF]" />
              <span className="text-xs font-mono text-[#00F5FF] uppercase tracking-wider font-bold">
                OFFICIAL RESUME COMPILER // v8.5
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Pullingal Soorath &bull; Professional Flutter Developer
            </p>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white mb-2">
          Curriculum Vitae Access
        </h3>

        {/* Terminal Compilation Console */}
        <div className="bg-[#05060A] p-4 rounded-2xl border border-white/10 font-mono text-xs mb-6 space-y-2">
          {logs.slice(0, step + 1).map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-300">
              <span className="text-[#00F5FF]">{'>'}</span>
              <span>{log}</span>
            </div>
          ))}

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00F5FF] to-[#7C4DFF] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{isCompiling ? 'COMPILING VERIFIED ASSETS...' : 'COMPILATION COMPLETE'}</span>
              <span className="text-[#00F5FF]">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Dossier Preview Card */}
        {isDone && (
          <div className="glass-panel p-5 rounded-2xl border border-white/10 mb-6 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-space font-bold text-sm text-white">
                    Pullingal_Soorath_Flutter_Resume.pdf
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Professional Flutter Developer &bull; Real-Time Chat &bull; Gemini AI &bull; Clones
                  </div>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownloadFile}
            disabled={!isDone}
            onMouseEnter={() => sound.playHover()}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,255,0.3)] disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD VERIFIED RESUME</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!isDone}
            onMouseEnter={() => sound.playHover()}
            className="w-full sm:w-auto py-3 px-5 rounded-xl font-mono text-xs font-bold text-slate-300 glass-panel border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT RESUME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
