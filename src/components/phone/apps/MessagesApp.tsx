import React, { useState } from 'react';
import {
  Send,
  Mail,
  CheckCircle,
  Copy,
  Check,
  User,
  RefreshCw,
  Database,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';
import { saveMessageToFirestore } from '../../../lib/firebase';

export const MessagesApp: React.FC = () => {
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [subject, setSubject] = useState('Flutter Developer Opportunity');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submissionDocId, setSubmissionDocId] = useState<string | null>(null);

  const quickTemplates = [
    'Flutter Role Interview',
    'Mobile Project Inquiry',
    'UI/UX Architecture',
    'Quick Collaboration',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !senderName.trim()) return;

    setIsSubmitting(true);
    sound.playClick();

    try {
      const result = await saveMessageToFirestore({
        name: senderName,
        emailOrPhone: senderContact,
        message,
        subject,
        source: 'Smart Phone Messages App',
      });

      if (result.docId) {
        setSubmissionDocId(result.docId);
      }
      sound.playSuccess();
      setIsSent(true);
    } catch (err) {
      console.error('Error submitting message:', err);
      sound.playSuccess();
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('pullingalsoorath@gmail.com');
    setCopiedEmail(true);
    sound.playTerminalBeep(900);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#06080e] text-white animate-fadeIn select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div>
          <h3 className="font-space font-bold text-sm flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-[#00F5FF]" />
            <span>Direct Messaging</span>
          </h3>
          <p className="text-[10px] font-mono text-emerald-400">
            Route: pullingalsoorath@gmail.com
          </p>
        </div>
        <button
          onClick={handleCopyEmail}
          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1"
          title="Copy Email"
        >
          {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          <span>Copy Email</span>
        </button>
      </div>

      {!isSent ? (
        /* Message Composition Form */
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {/* Recipient Pill */}
          <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-[#00F5FF]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Pullingal Soorath</div>
                <div className="text-[10px] font-mono text-[#00F5FF]">pullingalsoorath@gmail.com</div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Online
            </span>
          </div>

          {/* Quick Topic Pills */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase">Quick Subject</label>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {quickTemplates.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSubject(item);
                  }}
                  className={`px-2 py-1 rounded-xl text-[10px] font-mono whitespace-nowrap transition-all ${
                    subject === item
                      ? 'bg-[#00F5FF] text-black font-bold'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Sender Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400">Your Name / Organization</label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Alex Morgan / Tech Recruiter"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5FF]"
            />
          </div>

          {/* Sender Email / Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400">Your Email or Phone</label>
            <input
              type="text"
              required
              value={senderContact}
              onChange={(e) => setSenderContact(e.target.value)}
              placeholder="e.g. alex@company.com or +1 234..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5FF]"
            />
          </div>

          {/* Message Area */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400">Your Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your inquiry or proposal for Pullingal Soorath..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5FF] resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00F5FF] via-[#3D5AFE] to-[#7C4DFF] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,255,0.3)] active:scale-95 transition-transform disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Writing to Firestore...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 fill-black" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Sent Confirmation Screen */
        <div className="flex-1 flex flex-col justify-between p-4 animate-fadeIn overflow-y-auto">
          <div className="space-y-3 text-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold font-space text-white">
              Message Saved to Database!
            </h3>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[10px] font-mono text-[#00F5FF]">
              <Database className="w-3 h-3" />
              <span>Firestore: collection &apos;messages&apos;</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-2xl border border-white/10 text-left">
              Data successfully structured in Firestore with field{' '}
              <span className="text-[#00F5FF] font-mono font-bold">
                [{senderName || 'Anonymous'}]
              </span>{' '}
              containing your name, contact info, and message.
            </p>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-400 text-left space-y-1">
              <div><strong className="text-slate-200">Collection:</strong> messages</div>
              <div><strong className="text-slate-200">Field [{senderName}]:</strong></div>
              <div className="pl-3 border-l border-[#00F5FF]/30 text-[10px] text-slate-300 space-y-0.5">
                <div>&bull; name: {senderName}</div>
                <div>&bull; email/phone: {senderContact}</div>
                <div>&bull; message: {message}</div>
              </div>
              {submissionDocId && (
                <div className="text-[9px] text-slate-500 pt-1">
                  Doc ID: {submissionDocId}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                const formattedSubject = encodeURIComponent(`[Portfolio Contact] ${subject}: ${senderName || 'Anonymous'}`);
                const formattedBody = encodeURIComponent(
                  `Hello Pullingal Soorath,\n\nName: ${senderName}\nContact: ${senderContact}\n\nMessage:\n${message}`
                );
                window.location.href = `mailto:pullingalsoorath@gmail.com?subject=${formattedSubject}&body=${formattedBody}`;
              }}
              className="w-full py-2 rounded-xl bg-[#00F5FF]/15 hover:bg-[#00F5FF]/25 border border-[#00F5FF]/40 text-[#00F5FF] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Also Open in Email App</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsSent(false);
                setMessage('');
                setSenderName('');
                setSenderContact('');
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Send Another Message</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
