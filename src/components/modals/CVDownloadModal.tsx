import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  FileText,
  ExternalLink,
  Eye,
  Database,
  Sparkles,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Code2,
} from 'lucide-react';
import { sound } from '../audio/audioEngine';
import confetti from 'canvas-confetti';
import { downloadResumePdf, fetchResumeMetadata, type ResumeMetadata, DEFAULT_RESUME_INFO } from '../../lib/resumeService';

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CVDownloadModal: React.FC<CVDownloadModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'pdf' | 'dossier'>('pdf');
  const [metadata, setMetadata] = useState<ResumeMetadata>(DEFAULT_RESUME_INFO);

  const pdfUrl = './Pullingal_Soorath_Resume.pdf';

  const logs = [
    'Connecting to Cloud Firestore database vault (resumes/latest)...',
    'Retrieved 2-page verified PDF payload [133.9 KB]...',
    'Authenticating Flutter Developer & UI/UX Designer credentials...',
    'Rendering interactive document viewer...',
    'Verified resume accreditation complete [STATUS: 200 OK].',
  ];

  useEffect(() => {
    if (isOpen) {
      setIsCompiling(true);
      setIsDone(false);
      setStep(0);
      setProgress(20);

      fetchResumeMetadata().then((data) => {
        if (data) setMetadata(data);
      });

      const t1 = setTimeout(() => {
        setStep(1);
        setProgress(45);
        sound.playTerminalBeep(520);
      }, 350);

      const t2 = setTimeout(() => {
        setStep(2);
        setProgress(70);
        sound.playTerminalBeep(640);
      }, 700);

      const t3 = setTimeout(() => {
        setStep(3);
        setProgress(90);
        sound.playTerminalBeep(780);
      }, 1050);

      const t4 = setTimeout(() => {
        setStep(4);
        setProgress(100);
        setIsCompiling(false);
        setIsDone(true);
        sound.playSuccess();
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#00F5FF', '#7C4DFF', '#3D5AFE'],
        });
      }, 1400);

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
    window.open(pdfUrl, '_blank')?.print();
  };

  const handleDownload = () => {
    sound.playSuccess();
    downloadResumePdf(metadata.fileName || 'Pullingal_Soorath_Resume.pdf');
  };

  const handleOpenNewTab = () => {
    sound.playClick();
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain bg-black/90 backdrop-blur-2xl animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/20 p-4 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="./ps-logo.png" alt="PS Logo" className="h-10 w-auto object-contain" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-black" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white">
                  Pullingal Soorath
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                  <Database className="w-3 h-3" />
                  Cloud Database Synced
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Flutter Developer + UI / UX Designer &bull; 2-Page Official Resume
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#00F5FF]/50 transition-all shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Loading Bar when opening */}
        {isCompiling && (
          <div className="bg-[#05060A] p-3.5 rounded-2xl border border-white/10 font-mono text-xs my-3 space-y-2 shrink-0">
            {logs.slice(0, step + 1).map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-[#00F5FF]">{'>'}</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="pt-1.5">
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F5FF] to-[#7C4DFF] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>AUTHENTICATING CLOUD RESUME...</span>
                <span className="text-[#00F5FF]">{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* View Navigation Tabs */}
        {isDone && (
          <div className="flex items-center justify-between gap-2 pt-3 pb-2 shrink-0 border-b border-white/5">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('pdf');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === 'pdf'
                    ? 'bg-[#00F5FF] text-black font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live PDF Document</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('dossier');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === 'dossier'
                    ? 'bg-[#7C4DFF] text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Structured Dossier</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#00F5FF] animate-pulse" />
              <span>Format: PDF (A4) &bull; 133.9 KB &bull; 2 Pages</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {isDone && (
          <div className="flex-1 overflow-y-auto overscroll-contain py-3 space-y-4">
            {activeTab === 'pdf' ? (
              /* TAB 1: Live Interactive PDF Viewer */
              <div className="relative w-full h-[52vh] min-h-[380px] max-h-[640px] rounded-2xl border border-white/10 overflow-hidden bg-slate-950 flex flex-col shadow-inner">
                {/* Fallback / Native PDF Object */}
                <object
                  data={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                  type="application/pdf"
                  className="w-full h-full rounded-2xl"
                >
                  {/* Fallback for devices without native PDF plugin */}
                  <div className="p-6 text-center flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#00F5FF]/10 border border-[#00F5FF]/30 flex items-center justify-center text-[#00F5FF]">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-space text-base">
                        Pullingal Soorath Resume.pdf
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                        Your browser can view or download the verified 2-page PDF directly using the buttons below.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleOpenNewTab}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open PDF in New Tab</span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-xl bg-[#00F5FF] text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </object>
              </div>
            ) : (
              /* TAB 2: Structured Dossier & Bio Details */
              <div className="space-y-4 font-mono text-xs">
                {/* Header Summary */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-[#00F5FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>About Candidate</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-sm">
                    {metadata.summary}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                    <span>📍 {metadata.location}</span>
                    <span>✉️ {metadata.email}</span>
                    <span>📞 {metadata.phone}</span>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="text-[11px] font-bold text-[#7C4DFF] uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Work & Professional Experience</span>
                  </div>
                  <div className="space-y-3 font-sans text-xs">
                    <div className="border-l-2 border-[#00F5FF] pl-3 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-sm">UI/UX Designer + Flutter Developer</span>
                        <span className="font-mono text-xs text-[#00F5FF]">2025 - 2026 (Freelancing)</span>
                      </div>
                      <p className="text-slate-300">
                        Design user-friendly UI/UX in Figma and bring it to life with Flutter. End-to-end mobile app development for iOS and Android.
                      </p>
                    </div>

                    <div className="border-l-2 border-[#7C4DFF] pl-3 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-sm">Junior Flutter Developer</span>
                        <span className="font-mono text-xs text-[#7C4DFF]">2024 (Clovion Solutions Pvt Ltd)</span>
                      </div>
                      <p className="text-slate-300">
                        E-Commerce Application with Razorpay Payment Integration, Push Notifications, and Geolocation Integration using Geolocator.
                      </p>
                    </div>

                    <div className="border-l-2 border-[#3D5AFE] pl-3 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-sm">Flutter Development Internship</span>
                        <span className="font-mono text-xs text-[#3D5AFE]">2023 (Brototype &bull; 8 Months)</span>
                      </div>
                      <p className="text-slate-300">
                        Intensive Flutter development internship focused on self-directed learning, complex state management, and high-stakes code reviews.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Education & Training</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="font-bold text-white">BSc Computer Science</div>
                      <div className="text-slate-400 text-[11px]">M S University &bull; 2024 - 2027</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="font-bold text-white">Flutter App Development</div>
                      <div className="text-slate-400 text-[11px]">Brototype Internship &bull; 2023 - 2024</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="font-bold text-white">Industrial Training Institution (ITI)</div>
                      <div className="text-slate-400 text-[11px]">Govt. ITI Dhanuvachapuram &bull; 2019 - 2022</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="font-bold text-white">Diploma In Computer Application</div>
                      <div className="text-slate-400 text-[11px]">Pearl Computer Institution (C-DIT) &bull; 2017 - 2018</div>
                    </div>
                  </div>
                </div>

                {/* Technical Skills Grid */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-[#00F5FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Core Technical Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {metadata.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-slate-200 text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Cloud Document &bull; {metadata.fileName}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenNewTab}
              disabled={!isDone}
              onMouseEnter={() => sound.playHover()}
              className="py-2.5 px-4 rounded-xl font-mono text-xs font-semibold text-slate-300 glass-panel border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              title="Open full PDF in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!isDone}
              onMouseEnter={() => sound.playHover()}
              className="py-2.5 px-4 rounded-xl font-mono text-xs font-semibold text-slate-300 glass-panel border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              title="Print official PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!isDone}
              onMouseEnter={() => sound.playHover()}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,255,0.35)] disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PDF (133.9 KB)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
