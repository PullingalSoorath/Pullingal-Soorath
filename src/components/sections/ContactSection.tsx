import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/audioEngine';
import {
  Send,
  Mail,
  Phone,
  CheckCircle2,
  Copy,
  Check,
  CornerDownLeft,
  RefreshCw,
  Database,
} from 'lucide-react';
import { saveMessageToFirestore } from '../../lib/firebase';

interface ContactSectionProps {
  onOpenCVModal: () => void;
}

interface CommandHistory {
  cmd: string;
  res: React.ReactNode;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenCVModal }) => {
  // Form State
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{
    name: string;
    email: string;
    message: string;
    docId?: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Terminal CLI State
  const [cliInput, setCliInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<CommandHistory[]>([
    {
      cmd: 'init-session',
      res: (
        <span className="text-slate-400">
          Connected to Pullingal Soorath Neural Node [v3.8]. Type{' '}
          <strong className="text-[#00F5FF]">help</strong> for commands.
        </span>
      ),
    },
  ]);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only scroll the terminal inner container (never the browser window), and only after user commands
    if (terminalContainerRef.current && terminalHistory.length > 1) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    sound.playTerminalBeep(920);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    sound.playClick();
    setIsSubmitting(true);

    const submissionName = form.name.trim();
    const submissionEmail = form.email.trim();
    const submissionMsg = form.message.trim();

    try {
      const result = await saveMessageToFirestore({
        name: submissionName,
        emailOrPhone: submissionEmail,
        message: submissionMsg,
        subject: 'Connect Section Direct Transmission',
        source: 'Connect Section',
      });

      setSubmittedInfo({
        name: submissionName,
        email: submissionEmail,
        message: submissionMsg,
        docId: result.docId,
      });

      setIsSubmitted(true);
      sound.playSuccess();

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#00F5FF', '#3D5AFE', '#7C4DFF', '#FF2A85'],
      });

      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to submit message to Firestore:', err);
      setIsSubmitted(true);
      sound.playSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    if (!cmd) return;

    sound.playTerminalBeep(750);
    let output: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-slate-300">
            <div>Available Commands:</div>
            <div>
              <span className="text-[#00F5FF]">bio</span> - Summary of Pullingal Soorath
            </div>
            <div>
              <span className="text-[#00F5FF]">skills</span> - Print core Flutter & UI/UX capabilities
            </div>
            <div>
              <span className="text-[#00F5FF]">projects</span> - List flagship engineered systems
            </div>
            <div>
              <span className="text-[#00F5FF]">contact</span> - Direct phone, email, and location
            </div>
            <div>
              <span className="text-[#00F5FF]">download-cv</span> - Trigger interactive CV download
            </div>
            <div>
              <span className="text-[#00F5FF]">ping</span> - Check telemetry latency
            </div>
            <div>
              <span className="text-[#00F5FF]">sudo hire</span> - Special easter egg interaction
            </div>
            <div>
              <span className="text-[#00F5FF]">clear</span> - Reset terminal output buffer
            </div>
          </div>
        );
        break;

      case 'bio':
        output = (
          <div className="text-slate-300">
            Pullingal Soorath: Senior Flutter Developer & UI/UX Architect with 3+ years engineering
            scalable mobile applications, state engines (BLoC), and modern digital experiences.
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="text-slate-300">
            • Flutter (Production Grade, AOT, Clean Arch)
            <br />• Dart, BLoC, Provider, RxDart, GetIt
            <br />• WebSockets, WebRTC, Firebase, REST/Dio
            <br />• UI/UX, Figma Prototyping, Design Systems
            <br />• JavaScript, HTML5/CSS3, Video Post-Production
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="text-slate-300">
            1. NexusDate // Real-Time Dating Engine (WebRTC, Geolocation)
            <br />2. Apex Mobile Suite // Enterprise Clean Architecture & Offline Sync
            <br />3. Aetheria UI // Responsive Web & Full-Stack Portals
            <br />4. NovaVault // FinTech & Web3 Core
            <br />5. PulseAI // Cross-Platform Neural Interface
          </div>
        );
        break;

      case 'contact':
        output = (
          <div className="text-slate-300">
            Email: pullingalsoorath@gmail.com
            <br />Phone: +91 7025 2435 79
            <br />Location: Thirupuram, Trivandrum, Kerala, India
            <br />Status: Available for Full-Time & High-Impact Contracts
          </div>
        );
        break;

      case 'download-cv':
      case 'cv':
        onOpenCVModal();
        output = <div className="text-[#7C4DFF]">Launching Terminal CV Compiler modal...</div>;
        break;

      case 'ping':
        output = (
          <div className="text-emerald-400">
            PONG! Reply from Thirupuram Node [127.0.0.1]: bytes=32 time=11ms TTL=64 (60 FPS Locked)
          </div>
        );
        break;

      case 'sudo hire':
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00F5FF', '#3D5AFE', '#7C4DFF'],
        });
        sound.playSuccess();
        output = (
          <div className="text-[#00F5FF] font-bold">
            ACCESS GRANTED: Candidate Pullingal Soorath is ready to architect your next high-impact mobile product!
          </div>
        );
        break;

      case 'clear':
        setTerminalHistory([]);
        setCliInput('');
        return;

      default:
        output = (
          <div className="text-rose-400">
            Command not recognized: &quot;{cmd}&quot;. Type <strong className="text-[#00F5FF]">help</strong> for command manifest.
          </div>
        );
    }

    setTerminalHistory((prev) => [...prev, { cmd, res: output }]);
    setCliInput('');
  };

  return (
    <section id="connect" className="relative py-24 sm:py-32 overflow-hidden border-t border-white/5 scroll-mt-20">
      {/* Anchor alias so both #contact and #connect work seamlessly */}
      <div id="contact" className="absolute top-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]" />
            <span>05 // COMMAND & CONTACT HUB</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-orbitron text-white tracking-tight">
            INITIATE <span className="text-[#00F5FF]">CONNECTION</span>
          </h2>
          <p className="text-sm sm:text-base font-space text-slate-400 mt-2 max-w-2xl">
            Deploy an interactive transmission, inspect through CLI console, or connect directly via global coordinates.
          </p>
        </div>

        {/* Two Column Command Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Cyber Terminal CLI */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[520px] shadow-2xl">
              {/* Terminal Window Chrome */}
              <div className="bg-[#05060A]/90 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    ps-interactive-shell // zsh
                  </span>
                </div>
                <button
                  onClick={() => setTerminalHistory([])}
                  className="text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  title="Clear Console"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Terminal Scroll Output */}
              <div
                ref={terminalContainerRef}
                className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-4"
              >
                {terminalHistory.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2 text-[#00F5FF]">
                      <span className="text-slate-500">guest@soorath-os:~$</span>
                      <span className="font-bold">{item.cmd}</span>
                    </div>
                    <div className="pl-4">{item.res}</div>
                  </div>
                ))}
              </div>

              {/* Terminal Prompt Form */}
              <form
                onSubmit={handleTerminalSubmit}
                className="p-3 bg-[#05060A]/90 border-t border-white/10 flex items-center gap-2"
              >
                <span className="text-xs font-mono text-emerald-400 pl-2">❯</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type a command (try 'help' or 'sudo hire')..."
                  className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 hover:bg-[#00F5FF]/20 text-xs font-mono flex items-center gap-1"
                >
                  <span>EXEC</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Quick Command Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">Shortcuts:</span>
              {['help', 'skills', 'projects', 'contact', 'download-cv', 'sudo hire'].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setCliInput(cmd);
                    sound.playHover();
                  }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#00F5FF]/10 hover:text-[#00F5FF] text-slate-400 border border-white/5 transition-all"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Direct High-Tech Contact Form & Global Coordinates */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Contact Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
              <h3 className="text-xl font-bold font-space text-white mb-2">
                Send Direct Transmission
              </h3>
              <p className="text-xs font-mono text-slate-400 mb-6">
                Deliver an inquiry directly into Pullingal Soorath&apos;s communication queue.
              </p>

              {isSubmitted ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-space text-white">Transmission Delivered</h4>
                    <p className="text-xs font-mono text-slate-300 mt-1">
                      Your transmission has been recorded into the Firestore database communication queue.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF]">
                    <Database className="w-3.5 h-3.5" />
                    <span>Firestore Database: collection &apos;messages&apos;</span>
                  </div>

                  {submittedInfo && (
                    <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-slate-300 text-left space-y-1.5">
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-white">Firestore Collection:</strong> messages
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-[#00F5FF]">Field [{submittedInfo.name}]:</strong>
                      </div>
                      <div className="pl-3 border-l-2 border-[#00F5FF]/40 text-[11px] space-y-1">
                        <div>&bull; <span className="text-slate-400">name:</span> <span className="text-white font-bold">{submittedInfo.name}</span></div>
                        <div>&bull; <span className="text-slate-400">email / phone:</span> <span className="text-[#00F5FF]">{submittedInfo.email}</span></div>
                        <div>&bull; <span className="text-slate-400">message:</span> <span className="text-slate-200">{submittedInfo.message}</span></div>
                      </div>
                      {submittedInfo.docId && (
                        <div className="text-[10px] text-slate-500 pt-1">
                          Document ID: {submittedInfo.docId}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsSubmitted(false);
                      setSubmittedInfo(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>DISPATCH ANOTHER TRANSMISSION</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Your Identity / Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Sarah Chen or Apex Systems"
                      className="w-full glass-panel px-4 py-3 rounded-xl text-xs font-mono text-white placeholder-slate-600 border border-white/10 focus:border-[#00F5FF]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Return Frequency / Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full glass-panel px-4 py-3 rounded-xl text-xs font-mono text-white placeholder-slate-600 border border-white/10 focus:border-[#00F5FF]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                      Transmission Payload / Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Detail your mobile architecture needs, full-time engineering role, or contract scope..."
                      className="w-full glass-panel px-4 py-3 rounded-xl text-xs font-mono text-white placeholder-slate-600 border border-white/10 focus:border-[#00F5FF]/50 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onMouseEnter={() => sound.playHover()}
                    className="w-full py-3.5 px-6 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,255,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>ENCRYPTING & TRANSMITTING...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-black" />
                        <span>DISPATCH TRANSMISSION</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Direct Coordinates Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">EMAIL</div>
                    <div className="text-xs font-mono text-white truncate max-w-[150px]">
                      pullingalsoorath@gmail.com
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('pullingalsoorath@gmail.com', 'email')}
                  className="p-2 text-slate-400 hover:text-white"
                  title="Copy email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Phone */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#7C4DFF]/10 text-[#7C4DFF]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">PHONE</div>
                    <div className="text-xs font-mono text-white">+91 7025 2435 79</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('+917025243579', 'phone')}
                  className="p-2 text-slate-400 hover:text-white"
                  title="Copy phone"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
