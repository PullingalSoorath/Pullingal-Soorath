import React, { useState } from 'react';
import {
  Sun,
  Smartphone,
  Palette,
  Check,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';

interface SettingsAppProps {
  currentWallpaper: string;
  onSelectWallpaper: (wp: string) => void;
  is120Hz: boolean;
  onToggle120Hz: () => void;
  navStyle: 'buttons' | 'gestures';
  onToggleNavStyle: () => void;
  onOpenCVModal?: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  is120Hz,
  onToggle120Hz,
  navStyle,
  onToggleNavStyle,
  onOpenCVModal,
}) => {
  const [activeSection, setActiveSection] = useState<'main' | 'about' | 'display' | 'wallpaper'>('main');

  const wallpapers = [
    { id: 'cyber', name: 'Cyber Obsidian', color: 'from-cyan-900 via-slate-900 to-black' },
    { id: 'neon', name: 'Neon Nebula', color: 'from-violet-950 via-purple-900 to-black' },
    { id: 'aurora', name: 'Aurora Borealis', color: 'from-emerald-950 via-teal-900 to-slate-950' },
    { id: 'titanium', name: 'Titanium Gray', color: 'from-slate-800 via-slate-900 to-black' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#07090f] text-white animate-fadeIn select-none">
      {/* Settings Top Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        {activeSection !== 'main' ? (
          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('main');
            }}
            className="text-xs font-mono text-[#00F5FF] hover:underline"
          >
            &larr; Back to Settings
          </button>
        ) : (
          <h3 className="font-space font-bold text-sm">Smart Phone Settings</h3>
        )}
        <span className="text-[10px] font-mono text-slate-400">SM-PRO-PS</span>
      </div>

      {activeSection === 'main' && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2 text-xs">
          {/* User profile card */}
          <div
            onClick={() => setActiveSection('about')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-violet-950/60 border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#00F5FF]/50 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-white/20 p-1 flex items-center justify-center">
                <img src="./ps-logo.png" alt="PS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Pullingal Soorath</h4>
                <p className="text-[10px] text-[#00F5FF] font-mono">Senior Flutter Engineer</p>
                <p className="text-[9px] text-slate-400">Smart Phone [PS Edition]</p>
              </div>
            </div>
          </div>

          {onOpenCVModal && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCVModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00F5FF] border border-cyan-500/40 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Download Verified Resume CV (PDF)</span>
            </button>
          )}

          {/* Settings Menu Items */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setActiveSection('display');
              }}
              className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-[#00F5FF]">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Display & Motion</div>
                  <div className="text-[10px] text-slate-400">
                    {is120Hz ? '120Hz Adaptive LTPO' : '60Hz Standard'} &bull; {navStyle}
                  </div>
                </div>
              </div>
              <span className="text-slate-500">&rsaquo;</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveSection('wallpaper');
              }}
              className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Wallpaper & Style</div>
                  <div className="text-[10px] text-slate-400">Particle fluid neon wallpapers</div>
                </div>
              </div>
              <span className="text-slate-500">&rsaquo;</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveSection('about');
              }}
              className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">About Smart Phone</div>
                  <div className="text-[10px] text-slate-400">Mobile Device &bull; Hardware specs</div>
                </div>
              </div>
              <span className="text-slate-500">&rsaquo;</span>
            </button>
          </div>
        </div>
      )}

      {activeSection === 'display' && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase text-[#00F5FF]">Motion Smoothness</h4>
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-white block">Adaptive 120Hz LTPO</strong>
                <span className="text-[10px] text-slate-400">Fluid physics-based spring transitions</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggle120Hz();
                }}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  is120Hz ? 'bg-[#00F5FF]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    is120Hz ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase text-[#00F5FF]">System Navigation</h4>
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-white block">
                  {navStyle === 'gestures' ? 'Modern Swipe Gestures' : 'Classic 3-Button Bar'}
                </strong>
                <span className="text-[10px] text-slate-400">Recents, Home, Back interaction mode</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleNavStyle();
                }}
                className="px-3 py-1 rounded-xl bg-cyan-500/20 text-[#00F5FF] border border-cyan-500/40 text-[11px] font-mono"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'wallpaper' && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 text-xs">
          <h4 className="font-bold text-white text-xs uppercase text-[#00F5FF]">Dynamic Live Wallpapers</h4>
          <div className="grid grid-cols-2 gap-3">
            {wallpapers.map((wp) => (
              <div
                key={wp.id}
                onClick={() => {
                  sound.playClick();
                  onSelectWallpaper(wp.id);
                }}
                className={`h-28 rounded-2xl bg-gradient-to-br ${wp.color} p-3 flex flex-col justify-between border cursor-pointer transition-all ${
                  currentWallpaper === wp.id
                    ? 'border-[#00F5FF] ring-2 ring-[#00F5FF]/50 scale-105'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-white">{wp.name}</span>
                {currentWallpaper === wp.id && (
                  <div className="self-end p-1 rounded-full bg-[#00F5FF] text-black">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'about' && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
            <div className="text-[10px] text-slate-500 uppercase">Hardware & Casing Specs</div>
            <div className="flex justify-between text-slate-200">
              <span>Device Name</span>
              <strong className="text-white">Smart Phone [PS Pro]</strong>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Model Number</span>
              <span className="text-[#00F5FF]">PS-SMART-ULTRA</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Display Aspect</span>
              <span>19.3:9 Dynamic AMOLED 2X</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Chassis Material</span>
              <span>Armor Aluminum & Titanium</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Stylus</span>
              <span className="text-emerald-400">Integrated Virtual S-Pen</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
            <div className="text-[10px] text-slate-500 uppercase">Software Information</div>
            <div className="flex justify-between text-slate-200">
              <span>Mobile OS Version</span>
              <strong className="text-[#00F5FF]">PS Mobile v8.5</strong>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Android Version</span>
              <span>16 (Baklava)</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Security Patch</span>
              <span className="text-emerald-400">Hardware Security Vault</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
            <div className="text-[10px] text-slate-500 uppercase">Architect</div>
            <div className="flex justify-between text-slate-200">
              <span>Engineer</span>
              <strong className="text-white">Pullingal Soorath</strong>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Location</span>
              <span>Thirupuram, Trivandrum, Kerala, India</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Specialization</span>
              <span className="text-[#7C4DFF]">Professional Flutter Developer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
