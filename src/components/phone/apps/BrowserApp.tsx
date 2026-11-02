import React, { useState } from 'react';
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Bookmark,
  Share2,
  Layers,
  Globe,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';

export const BrowserApp: React.FC = () => {
  const [url, setUrl] = useState('https://flutter.dev/docs');
  const [activeSite, setActiveSite] = useState<'flutter' | 'github' | 'wiki' | 'dart' | 'custom'>('flutter');
  const [isLoading, setIsLoading] = useState(false);

  const bookmarks = [
    { label: 'Flutter Docs', url: 'https://flutter.dev/docs', site: 'flutter' as const },
    { label: 'GitHub // PS', url: 'https://github.com/pullingalsoorath', site: 'github' as const },
    { label: 'Dart Lang', url: 'https://dart.dev', site: 'dart' as const },
    { label: 'Wikipedia', url: 'https://wikipedia.org/wiki/Flutter', site: 'wiki' as const },
  ];

  const handleNavigate = (targetUrl: string, siteType: typeof activeSite = 'custom') => {
    sound.playClick();
    setIsLoading(true);
    setUrl(targetUrl);
    setActiveSite(siteType);

    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    handleNavigate(target, 'custom');
  };

  return (
    <div className="flex flex-col h-full bg-[#05070c] text-white animate-fadeIn select-none">
      {/* Browser URL Chrome Bar */}
      <div className="p-2 border-b border-white/10 space-y-2 bg-[#090d16]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => sound.playClick()}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sound.playClick()}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleNavigate(url, activeSite)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00F5FF]' : ''}`} />
          </button>

          {/* Address input */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1 border border-white/10 text-xs">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 focus:outline-none truncate"
            />
          </form>
        </div>

        {/* Quick Bookmark Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
          {bookmarks.map((b) => (
            <button
              key={b.label}
              onClick={() => handleNavigate(b.url, b.site)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all ${
                activeSite === b.site
                  ? 'bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Web Content Render Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-slate-950 font-sans text-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-500">
            <RotateCw className="w-6 h-6 animate-spin text-[#00F5FF]" />
            <span className="font-mono text-xs">Connecting via 5G Ultra-Wideband...</span>
          </div>
        ) : (
          <>
            {activeSite === 'flutter' && (
              <div className="space-y-4 text-slate-300 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/20">
                  <div className="flex items-center gap-2 text-[#00F5FF] font-bold text-sm mb-1">
                    <Globe className="w-4 h-4" />
                    <span>Flutter Official Architectural Portal</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Flutter transforms the app development process. Build, test, and deploy beautiful mobile, web, desktop, and embedded apps from a single codebase.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide text-[#00F5FF]">
                    Core Engineering Highlights
                  </h4>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <strong className="text-white block text-xs">Clean BLoC State Management</strong>
                    <p className="text-[11px] text-slate-400">
                      Predictable reactive state machine decoupling UI widgets from data layers.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <strong className="text-white block text-xs">60FPS Impeller & Skia Pipelines</strong>
                    <p className="text-[11px] text-slate-400">
                      Eliminates early shader compilation stutter with ahead-of-time (AOT) binary compilation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSite === 'github' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00F5FF]/20 text-[#00F5FF] flex items-center justify-center font-bold">
                    PS
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Pullingal Soorath</h3>
                    <p className="text-[11px] font-mono text-slate-400">github.com/pullingalsoorath</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400">Public Repositories</div>
                  {[
                    { name: 'flutter-realtime-chat', lang: 'Dart', stars: '48' },
                    { name: 'gemini-ai-assistant', lang: 'Dart / Flutter', stars: '62' },
                    { name: 'instagram-ui-clone', lang: 'Dart', stars: '35' },
                    { name: 'snake-game-flutter', lang: 'Dart', stars: '29' },
                  ].map((r) => (
                    <div key={r.name} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#00F5FF]">{r.name}</div>
                        <div className="text-[10px] text-slate-400">{r.lang}</div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">&star; {r.stars}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSite === 'dart' && (
              <div className="space-y-3 text-slate-300 animate-fadeIn">
                <h3 className="font-bold text-white text-sm">Dart: Client-Optimized Language</h3>
                <p className="text-[11px] leading-relaxed">
                  Fast on all platforms with ahead-of-time (AOT) machine code compilation for ARM64 and x64 architectures.
                </p>
                <div className="p-3 bg-black rounded-xl border border-white/10 font-mono text-[10px] text-[#00F5FF]">
                  <code>void main() =&gt; runApp(const SoorathApp());</code>
                </div>
              </div>
            )}

            {activeSite === 'wiki' && (
              <div className="space-y-3 text-slate-300 animate-fadeIn">
                <h3 className="font-bold text-white text-sm">Flutter (Software Framework)</h3>
                <p className="text-[11px] leading-relaxed">
                  Flutter is an open-source UI software development kit created by Google. Used to develop cross platform applications for Android, iOS, Linux, macOS, Windows, and the web.
                </p>
              </div>
            )}

            {activeSite === 'custom' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
                <Globe className="w-10 h-10 text-[#00F5FF]" />
                <h4 className="font-bold text-white text-sm">Browsing External Domain</h4>
                <p className="text-xs font-mono text-slate-400 max-w-[240px] truncate">{url}</p>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Secure Web Protection Active
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Smart Phone Internet Bottom Action Bar */}
      <div className="px-4 py-2 border-t border-white/10 bg-[#090d16] flex items-center justify-between text-slate-400 text-xs">
        <button
          onClick={() => handleNavigate('https://flutter.dev/docs', 'flutter')}
          className="p-1 hover:text-[#00F5FF]"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>
        <button onClick={() => sound.playClick()} className="p-1 hover:text-[#00F5FF]" title="Bookmarks">
          <Bookmark className="w-4 h-4" />
        </button>
        <button onClick={() => sound.playClick()} className="p-1 hover:text-[#00F5FF]" title="Tabs">
          <Layers className="w-4 h-4" />
        </button>
        <button onClick={() => sound.playClick()} className="p-1 hover:text-[#00F5FF]" title="Share">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
