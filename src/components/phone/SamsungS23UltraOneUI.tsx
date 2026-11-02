import React, { useState, useEffect, useRef } from 'react';
import { getISTTime, fetchLiveWeather, type LiveWeatherData } from '../../lib/realtimeService';
import {
  Wifi,
  BatteryCharging,
  Signal,
  MessageSquare,
  Gamepad2,
  Settings,
  ChevronLeft,
  Sliders,
  Sun,
  Volume2,
  Bluetooth,
  Menu as MenuIcon,
  Image as ImageIcon,
  RotateCw,
  Fingerprint,
  PenTool,
  X,
  User,
  Mail,
  Award,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { sound } from '../audio/audioEngine';
import { PhoneApp } from './apps/PhoneApp';
import { NotesApp } from './apps/NotesApp';
import { BrowserApp } from './apps/BrowserApp';
import { GalleryApp } from './apps/GalleryApp';
import { SettingsApp } from './apps/SettingsApp';
import { ProfileApp } from './apps/ProfileApp';
import { SkillsApp } from './apps/SkillsApp';
import { MessagesApp } from './apps/MessagesApp';
import { RealtimeChatApp } from './apps/RealtimeChatApp';
import { InteractiveWallpaper } from './InteractiveWallpaper';

// Desktop apps catalog for fluid layout morphing (Filtered to core apps + 1-on-1 Realtime Chat)
const HOME_APPS = [
  { id: 'profile', name: 'Profile', iconImage: './app-icons/profile.png', icon: User, bgGradient: 'from-cyan-500 to-blue-600', badge: 'PS' },
  { id: 'gallery', name: 'Gallery', iconImage: './app-icons/gallery.png', icon: ImageIcon, bgGradient: 'from-rose-500 to-pink-600', badge: 'Projects' },
  { id: 'skills', name: 'Skills', icon: Award, bgGradient: 'from-violet-500 to-indigo-600', badge: 'Flutter' },
  { id: 'messages', name: 'Mail', iconImage: './app-icons/mail.png', icon: Mail, bgGradient: 'from-emerald-500 to-teal-600', badge: 'Email' },
  { id: 'chat', name: 'Chat', iconImage: './app-icons/chat.png', icon: MessageSquare, bgGradient: 'from-cyan-600 to-blue-700', badge: '1-on-1' },
  { id: 'snake', name: 'Snake Game', icon: Gamepad2, bgGradient: 'from-emerald-600 to-teal-700', badge: 'Play' },
  { id: 'settings', name: 'Settings', iconImage: './app-icons/settings.png', icon: Settings, bgGradient: 'from-slate-600 to-slate-800' },
];

interface SmartPhoneViewProps {
  onOpenCVModal?: () => void;
  initialApp?: string | null;
  onSwitchTo3D?: () => void;
}

export const SmartPhoneView: React.FC<SmartPhoneViewProps> = ({
  onOpenCVModal,
  initialApp = null,
  onSwitchTo3D,
}) => {
  // Screen state machine: 'off' | 'aod' | 'lock' | 'home'
  const [screenState, setScreenState] = useState<'off' | 'aod' | 'lock' | 'home'>('home');
  const [activeApp, setActiveApp] = useState<string | null>(initialApp);
  const [currentTime, setCurrentTime] = useState('12:45');
  const [currentDate, setCurrentDate] = useState('Mon, Oct 26');

  // Quick settings and overlays
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [showVolumeHud, setShowVolumeHud] = useState(false);
  const [brightness, setBrightness] = useState(90);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [soundMode, setSoundMode] = useState<'sound' | 'vibrate' | 'mute'>('sound');

  // S-Pen & Air Command state
  const [isSPenEjected, setIsSPenEjected] = useState(false);
  const [airCommandOpen, setAirCommandOpen] = useState(false);

  // Hardware transformation controls (Galaxy Z Fold 6 Mechanical Kinematics)
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFoldingTransition, setIsFoldingTransition] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(0.85);
  const isAutoFoldingOnScroll = useRef(false);
  const phoneChassisRef = useRef<HTMLDivElement>(null);
  const [scrollPrompt, setScrollPrompt] = useState<string | null>(null);
  const scrollAttemptsRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const scrollResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFold = () => {
    sound.playClick();
    setIsFoldingTransition(true);
    setIsLandscape((prev) => {
      const next = !prev;
      if (!next) {
        document.body.style.overflow = '';
      }
      return next;
    });
    setTimeout(() => {
      setIsFoldingTransition(false);
    }, 2000);
  };

  // In tablet mode: lock webpage scrolling completely so contents NEVER overlap the tablet!
  // Only on the 3rd scroll down does the tablet fold back to smartphone view and scroll down to the next section
  // Scrolling inside the phone chassis / chat app will NEVER fold or scroll the webpage
  useEffect(() => {
    if (!isLandscape) {
      document.body.style.overflow = '';
      scrollAttemptsRef.current = 0;
      setScrollPrompt(null);
      if (scrollResetTimerRef.current) clearTimeout(scrollResetTimerRef.current);
      return;
    }

    // Lock page scroll while tablet is open so webpage content cannot scroll behind or overlap the tablet
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'instant' });

    let touchStartY = 0;

    // Check if an event target is located inside the phone frame / active app
    const isInsideDeviceOrApp = (target: EventTarget | null): boolean => {
      if (!target) return false;
      const node = target as Node;
      if (phoneChassisRef.current && phoneChassisRef.current.contains(node)) {
        return true;
      }
      return false;
    };

    const triggerFoldAndScrollDown = () => {
      if (isAutoFoldingOnScroll.current) return;
      isAutoFoldingOnScroll.current = true;
      scrollAttemptsRef.current = 0;
      setScrollPrompt(null);
      if (scrollResetTimerRef.current) clearTimeout(scrollResetTimerRef.current);

      sound.playClick();
      setIsFoldingTransition(true);
      setIsLandscape(false);
      document.body.style.overflow = ''; // Unlock scroll for smooth sequential transition

      // Give mechanical fold transition time to fluidly morph before scrolling down
      setTimeout(() => {
        setIsFoldingTransition(false);
        isAutoFoldingOnScroll.current = false;
        const target = document.getElementById('about');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollBy({ top: 400, behavior: 'smooth' });
        }
      }, 700);
    };

    const registerScrollDownAttempt = (e: Event) => {
      e.preventDefault();
      const now = Date.now();
      // Debounce rapid continuous wheel/touch momentum ticks so distinct user scroll strokes are counted
      if (now - lastScrollTimeRef.current < 280) {
        return;
      }
      lastScrollTimeRef.current = now;

      scrollAttemptsRef.current += 1;

      if (scrollResetTimerRef.current) {
        clearTimeout(scrollResetTimerRef.current);
      }
      // If user stops scrolling for 2.2s, reset counter back to 0 (stays in tablet mode)
      scrollResetTimerRef.current = setTimeout(() => {
        scrollAttemptsRef.current = 0;
        setScrollPrompt(null);
      }, 2200);

      if (scrollAttemptsRef.current === 1) {
        sound.playHover();
        setScrollPrompt('Scroll down twice more to fold into phone (1/3)');
      } else if (scrollAttemptsRef.current === 2) {
        sound.playHover();
        setScrollPrompt('Scroll once more to fold & explore page (2/3)');
      } else if (scrollAttemptsRef.current >= 3) {
        triggerFoldAndScrollDown();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // NEVER intercept scrolls inside the phone chassis or active chat app!
      if (isInsideDeviceOrApp(e.target)) {
        return;
      }

      // Outside the phone chassis, prevent ANY window scrolling while in tablet mode!
      e.preventDefault();

      if (e.deltaY > 12) {
        registerScrollDownAttempt(e);
      } else if (e.deltaY < -15) {
        // Scrolled upwards, reset scroll count
        scrollAttemptsRef.current = 0;
        setScrollPrompt(null);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isInsideDeviceOrApp(e.target)) {
        return;
      }
      e.preventDefault();

      if (e.touches.length === 1) {
        const deltaY = touchStartY - e.touches[0].clientY;
        if (deltaY > 35) {
          touchStartY = e.touches[0].clientY;
          registerScrollDownAttempt(e);
        } else if (deltaY < -35) {
          scrollAttemptsRef.current = 0;
          setScrollPrompt(null);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInsideDeviceOrApp(e.target)) return;
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        registerScrollDownAttempt(e);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        scrollAttemptsRef.current = 0;
        setScrollPrompt(null);
      }
    };

    const handleScrollLock = () => {
      if (!isAutoFoldingOnScroll.current && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollLock);

    return () => {
      document.body.style.overflow = '';
      if (scrollResetTimerRef.current) clearTimeout(scrollResetTimerRef.current);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollLock);
    };
  }, [isLandscape]);

  // System Customization
  const [wallpaperTheme, setWallpaperTheme] = useState('cyber');
  const [is120Hz, setIs120Hz] = useState(true);
  const [navStyle, setNavStyle] = useState<'buttons' | 'gestures'>('buttons');

  // Real-time Weather for Thirupuram, Trivandrum, Kerala
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData>({
    temp: 29,
    condition: 'Sunny',
    location: 'Thirupuram, Trivandrum',
    isDay: true,
    weatherCode: 0,
  });

  // Real-time IST Clock (12-hour AM/PM) & Weather Ticker
  useEffect(() => {
    const updateTime = () => {
      const ist = getISTTime();
      setCurrentTime(ist.time12);
      setCurrentDate(ist.dateShort);
    };
    updateTime();
    const timerInterval = setInterval(updateTime, 1000);

    // Fetch live weather from Open-Meteo
    fetchLiveWeather().then((w) => setLiveWeather(w));
    const weatherInterval = setInterval(() => {
      fetchLiveWeather().then((w) => setLiveWeather(w));
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  // Hardware button handlers
  const handlePowerButton = () => {
    sound.playClick();
    if (screenState === 'off') {
      setScreenState('lock');
    } else if (screenState === 'aod') {
      setScreenState('lock');
    } else {
      setScreenState('aod');
      setActiveApp(null);
      setQuickSettingsOpen(false);
    }
  };

  const handleVolumeUp = () => {
    sound.playClick();
    setVolumeLevel((v) => Math.min(100, v + 10));
    setShowVolumeHud(true);
    setTimeout(() => setShowVolumeHud(false), 2000);
  };

  const handleVolumeDown = () => {
    sound.playClick();
    setVolumeLevel((v) => Math.max(0, v - 10));
    setShowVolumeHud(true);
    setTimeout(() => setShowVolumeHud(false), 2000);
  };

  // S-Pen Eject / Insert toggle
  const toggleSPen = () => {
    sound.playSPen();
    const nextState = !isSPenEjected;
    setIsSPenEjected(nextState);
    if (nextState) {
      setAirCommandOpen(true);
    } else {
      setAirCommandOpen(false);
    }
  };

  // Unlock sequence
  const handleUnlock = () => {
    sound.playUnlock();
    setScreenState('home');
  };

  const goHome = () => {
    sound.playClick();
    setActiveApp(null);
    setQuickSettingsOpen(false);
  };

  const openApp = (appId: string) => {
    sound.playClick();
    setActiveApp(appId);
    setQuickSettingsOpen(false);
  };

  const isCoveringScreen = isLandscape;
  const effectiveScale = isLandscape ? 1.0 : scaleFactor;

  return (
    <div
      className={`perspective-2000 w-full transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col items-center justify-start sm:justify-center select-none ${
        isCoveringScreen
          ? 'fixed inset-0 z-50 bg-[#020408]/95 backdrop-blur-2xl p-2 sm:p-4 pt-4 sm:pt-6 overflow-y-auto sm:overflow-hidden'
          : 'relative p-1 sm:p-2'
      }`}
    >
      {/* FLOATING ACCESSIBLE HUD TOGGLE: FOLD / UNFOLD DEVICE (Galaxy Z Fold 6 Kinematics) */}
      <div className="z-50 mb-2 sm:mb-3 flex items-center justify-center animate-fluid-scale shrink-0">
        <button
          onClick={toggleFold}
          className="group relative flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl glass-panel border border-[#00F5FF]/50 bg-[#060a14]/90 hover:bg-[#00F5FF]/20 hover:border-[#00F5FF] shadow-[0_0_25px_rgba(0,245,255,0.25)] hover:shadow-[0_0_35px_rgba(0,245,255,0.45)] transition-all duration-300 active:scale-95 cursor-pointer font-mono"
          title="Fold / Unfold Device (Samsung Galaxy Z Fold 6 Mechanical Kinematics)"
          aria-label="Fold or Unfold Device"
        >
          <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-[#00F5FF]/20 border border-[#00F5FF]/60 text-[#00F5FF] group-hover:scale-110 transition-transform">
            {isLandscape ? (
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00F5FF]" />
            ) : (
              <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00F5FF]" />
            )}
          </div>

          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white group-hover:text-[#00F5FF] transition-colors">
                Fold / Unfold Device
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40">
                {isLandscape ? 'UNFOLDED' : 'FOLDED'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {isLandscape ? 'Inner 7.6" Display • Click to Fold' : 'Cover Display • Click to Unfold'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-white/10 text-[10px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>2000ms Fluid Spring</span>
          </div>
        </button>
      </div>

      {/* DEVICE WORKSPACE CONTAINER: Phone with Right-Side Tools, or Wide Tablet */}
      <div
        className={
          !isLandscape
            ? 'relative flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 lg:gap-6 transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)]'
            : 'relative flex flex-col xl:flex-row items-center xl:items-start justify-center gap-4 lg:gap-6 w-full max-w-[1260px] transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)]'
        }
      >
        {/* PHYSICAL 3D STAGE FOR DEVICE CHASSIS & AMBIENT SHADOW */}
        <div
          style={{
            width: isLandscape ? 'min(980px, 94vw)' : 'min(350px, 92vw)',
            transition: 'width 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
          className="relative preserve-3d flex items-center justify-center shrink-0"
        >
          {/* Dynamic Ambient Floor Shadow Underneath */}
          <div
            className="pointer-events-none absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] rounded-full bg-cyan-500/20"
            style={{
              width: isLandscape ? 'min(940px, 90vw)' : 'min(310px, 86vw)',
              height: isLandscape ? '44px' : '26px',
              filter: isLandscape ? 'blur(36px)' : 'blur(16px)',
              opacity: isLandscape ? 0.35 : 0.75,
            }}
          />

          {/* Physical Device Chassis (Samsung Galaxy Z Fold 6 Kinematics) */}
          <div
            ref={phoneChassisRef}
            style={{
              width: isLandscape ? 'min(980px, 94vw)' : 'min(350px, 92vw)',
              height: isLandscape ? 'min(620px, 82vh)' : '690px',
              transform: !isLandscape ? `scale(${effectiveScale})` : 'scale(1)',
              marginTop: !isLandscape ? `${(effectiveScale - 1) * 340}px` : '0px',
              marginBottom: !isLandscape ? `${(effectiveScale - 1) * 340}px` : '0px',
              marginRight: !isLandscape ? `${(effectiveScale - 1) * 160}px` : '0px',
              transition:
                'width 2000ms cubic-bezier(0.32, 0.72, 0, 1), height 2000ms cubic-bezier(0.32, 0.72, 0, 1), transform 2000ms cubic-bezier(0.32, 0.72, 0, 1), margin 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            className={`relative select-none preserve-3d will-change-transform bg-gradient-to-b from-[#181c26] via-[#0d1017] to-[#121620] p-2.5 border-[3px] border-[#2a3040] flex flex-col justify-between overflow-hidden ${
              isFoldingTransition ? 'animate-fold-lift' : ''
            } ${
              isLandscape
                ? 'rounded-[28px] shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(0,245,255,0.25)]'
                : 'rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(0,245,255,0.2)]'
            }`}
          >
            {/* Armor Aluminum Spine Hinge (Prominent on Left Edge in Phone Mode) */}
            <div
              className={`absolute -left-2 top-10 bottom-10 w-2.5 rounded-l-md bg-gradient-to-r from-[#1c2230] via-[#3d475d] to-[#141924] border-l border-y border-white/20 shadow-lg pointer-events-none transition-opacity duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isLandscape ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              title="Armor Aluminum Spine Hinge"
            >
              <div className="w-full h-full flex flex-col justify-between py-6 items-center opacity-40">
                <div className="w-1 h-3 rounded-full bg-white/40" />
                <div className="w-1 h-3 rounded-full bg-white/40" />
              </div>
            </div>
        {/* TACTILE HARDWARE BUTTONS */}
        {!isLandscape ? (
          <div className="absolute -right-2.5 top-28 z-20 flex flex-col gap-3">
            {/* Volume Rocker (Volume Up & Down) */}
            <div className="w-2.5 h-20 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-r-md border-r border-y border-white/20 shadow-md flex flex-col justify-between py-1 cursor-pointer">
              <button
                onClick={handleVolumeUp}
                className="h-9 w-full hover:bg-white/30 transition-colors"
                title="Hardware Volume Up"
              />
              <button
                onClick={handleVolumeDown}
                className="h-9 w-full hover:bg-white/30 transition-colors"
                title="Hardware Volume Down"
              />
            </div>

            {/* Power Button */}
            <button
              onClick={handlePowerButton}
              className="w-2.5 h-12 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-r-md border-r border-y border-white/20 shadow-md hover:bg-white/30 transition-colors cursor-pointer"
              title="Hardware Power Button (Sleep/Wake)"
            />
          </div>
        ) : (
          /* Tablet Hardware Buttons on Top Bezel */
          <div className="absolute -top-2 right-16 z-20 flex items-center gap-3">
            <button
              onClick={handlePowerButton}
              className="w-12 h-2 bg-gradient-to-t from-slate-700 via-slate-600 to-slate-800 rounded-t-md border-t border-x border-white/20 shadow-md hover:bg-white/30 transition-colors cursor-pointer"
              title="Tablet Power Button"
            />
            <div className="w-20 h-2 bg-gradient-to-t from-slate-700 via-slate-600 to-slate-800 rounded-t-md border-t border-x border-white/20 shadow-md flex justify-between px-1 cursor-pointer">
              <button
                onClick={handleVolumeDown}
                className="w-9 h-full hover:bg-white/30 transition-colors"
                title="Volume Down"
              />
              <button
                onClick={handleVolumeUp}
                className="w-9 h-full hover:bg-white/30 transition-colors"
                title="Volume Up"
              />
            </div>
          </div>
        )}

        {/* PHYSICAL S-PEN SLOT (BOTTOM LEFT OR TOP TABLET STRIP) */}
        {!isLandscape ? (
          <div
            onClick={toggleSPen}
            className="absolute -bottom-1.5 left-6 z-30 w-7 h-2 bg-slate-800 border-x border-b border-white/20 rounded-b cursor-pointer hover:bg-amber-500/40 transition-colors flex items-center justify-center"
            title="Click to eject/insert S-Pen stylus"
          >
            <div className={`w-3 h-1 rounded-full ${isSPenEjected ? 'bg-amber-400' : 'bg-slate-500'}`} />
          </div>
        ) : (
          <div
            onClick={toggleSPen}
            className="absolute -top-1.5 left-24 z-30 w-28 h-2 bg-slate-800 border-x border-t border-white/20 rounded-t cursor-pointer hover:bg-amber-500/40 transition-colors flex items-center justify-center gap-1.5"
            title="Magnetic Tablet S-Pen Dock"
          >
            <div className={`w-14 h-1 rounded-full ${isSPenEjected ? 'bg-amber-400' : 'bg-slate-500'}`} />
            <span className="text-[8px] font-mono text-amber-400 font-bold">S-PEN</span>
          </div>
        )}

        {/* Ejected Physical S-Pen Floating Stylus Graphic */}
        {isSPenEjected && (
          <div className={`absolute z-40 flex flex-col items-center animate-bounce pointer-events-none ${
            isLandscape ? '-right-10 top-12' : '-left-12 bottom-0'
          }`}>
            <div className="w-2.5 h-36 rounded-full bg-gradient-to-b from-slate-800 via-slate-700 to-amber-500 border border-white/30 shadow-2xl flex flex-col items-center justify-between p-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="w-1 h-3 rounded bg-white/40" />
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-400 mt-1">S-PEN</span>
          </div>
        )}

        {/* Outer Titanium Casing (Sharp rectangular corners of smartphone/tablet) */}
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Metallic rim reflection highlight */}
          <div className={`absolute inset-0 border border-white/10 pointer-events-none transition-all duration-[2000ms] ease-[cubic-bezier(0.25,1,0.35,1)] ${
            isLandscape ? 'rounded-[25px]' : 'rounded-[21px]'
          }`} />

          {/* Foldable AMOLED Display */}
          <div
            style={{ filter: `brightness(${brightness}%)` }}
            className={`relative w-full h-full bg-[#05060A] overflow-hidden flex flex-col justify-between border border-black shadow-inner transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isLandscape ? 'rounded-[22px]' : 'rounded-[18px]'
            }`}
          >
            {/* Top Camera (Punch-Hole on Cover, Under-Display Position on Inner Foldable) */}
            <div
              style={{
                transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
                left: isLandscape ? '75%' : '50%',
                top: isLandscape ? '10px' : '8px',
              }}
              className="absolute -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0c1c2e]" />
              </div>
            </div>

            {/* SCREEN VIEWPORT CONTAINER */}
            <div className="relative w-full h-full z-20 flex flex-col justify-between overflow-hidden select-none">

            {/* VERTICAL VOLUME SLIDER HUD OVERLAY */}
            {showVolumeHud && (
              <div className="absolute top-24 right-3 z-50 bg-[#0d121e]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2 animate-fluid-scale">
                <Volume2 className="w-4 h-4 text-[#00F5FF]" />
                <div className="w-2 h-24 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#00F5FF] to-[#3D5AFE] rounded-full transition-all duration-300 ease-out"
                    style={{ height: `${volumeLevel}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-white">{volumeLevel}%</span>
              </div>
            )}

            {/* S-PEN AIR COMMAND FLOATING RADIAL MENU */}
            {airCommandOpen && (
              <div className="absolute right-4 bottom-24 z-50 bg-[#0e1424]/95 backdrop-blur-2xl p-3 rounded-3xl border border-amber-400/40 shadow-[0_0_30px_rgba(245,158,11,0.3)] space-y-2 animate-fluid-scale w-48">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-space">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Air Command</span>
                  </div>
                  <button onClick={() => setAirCommandOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs font-sans">
                  <button
                    onClick={() => {
                      sound.playClick();
                      openApp('notes');
                      setAirCommandOpen(false);
                    }}
                    className="w-full p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-left text-white flex items-center gap-2 transition-colors"
                  >
                    <span>📝 Create Note</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playShutter();
                      setAirCommandOpen(false);
                    }}
                    className="w-full p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-left text-white flex items-center gap-2 transition-colors"
                  >
                    <span>📸 Screen Capture</span>
                  </button>
                  <button
                    onClick={() => toggleSPen()}
                    className="w-full p-2 rounded-xl bg-amber-500/10 text-amber-300 text-left flex items-center gap-2"
                  >
                    <span>↩️ Insert S-Pen</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN STATE 1: POWER OFF (Screen completely black) */}
            {screenState === 'off' && (
              <div
                onClick={() => setScreenState('lock')}
                className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center cursor-pointer text-slate-700 text-xs font-mono"
              >
                <span>Tap to wake</span>
              </div>
            )}

            {/* SCREEN STATE 2: ALWAYS ON DISPLAY (AOD) */}
            {screenState === 'aod' && (
              <div
                onClick={() => setScreenState('lock')}
                className={`absolute inset-0 bg-black z-40 flex p-6 cursor-pointer text-white animate-fadeIn ${
                  isLandscape
                    ? 'flex-row items-center justify-around'
                    : 'flex-col items-center justify-center'
                }`}
              >
                <div className="text-center space-y-1">
                  <div className="text-4xl font-extrabold font-orbitron text-slate-200 tracking-tight">
                    {currentTime}
                  </div>
                  <div className="text-xs font-mono text-slate-400">{currentDate}</div>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#00F5FF] pt-2">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>98% &bull; Smart Phone AOD</span>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-center gap-2 text-slate-500 text-[10px] font-mono ${
                    isLandscape ? 'relative' : 'absolute bottom-16'
                  }`}
                >
                  <Fingerprint className="w-8 h-8 text-[#00F5FF] animate-pulse" />
                  <span>Tap or swipe to unlock</span>
                </div>
              </div>
            )}

            {/* SCREEN STATE 3: LOCK SCREEN */}
            {screenState === 'lock' && (
              <div
                className={`relative flex-1 z-40 text-white animate-fadeIn overflow-hidden ${
                  isLandscape
                    ? 'p-4 grid grid-cols-2 gap-4 items-center'
                    : 'flex flex-col justify-between p-6'
                }`}
              >
                <InteractiveWallpaper theme={wallpaperTheme} isLandscape={isLandscape} />

                {/* Lock Screen Clock & Information */}
                <div
                  className={`relative z-10 space-y-1 ${
                    isLandscape ? 'text-left pl-3' : 'text-center pt-8'
                  }`}
                >
                  <div
                    className={`${
                      isLandscape ? 'text-4xl' : 'text-5xl'
                    } font-extrabold font-orbitron tracking-tight text-white drop-shadow-lg`}
                  >
                    {currentTime}
                  </div>
                  <div className="text-xs font-space font-medium text-slate-200">{currentDate}</div>
                  <div className="text-xs font-mono text-[#00F5FF]">
                    {liveWeather.location} &bull; {liveWeather.temp}&deg;C {liveWeather.condition}
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => {
                        handleUnlock();
                        openApp('profile');
                      }}
                      className="p-2.5 rounded-full bg-black/50 border border-white/10 text-[#00F5FF] hover:scale-110 transition-transform"
                      title="Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        handleUnlock();
                        openApp('messages');
                      }}
                      className="p-2.5 rounded-full bg-black/50 border border-white/10 text-emerald-400 hover:scale-110 transition-transform"
                      title="Messages"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    {isLandscape && (
                      <span className="text-[10px] font-mono text-slate-400">Quick Launch</span>
                    )}
                  </div>
                </div>

                {/* Notifications & Fingerprint in Landscape */}
                <div
                  className={`relative z-10 flex flex-col items-center gap-3 ${
                    isLandscape ? 'pr-3' : 'space-y-2'
                  }`}
                >
                  <div className="w-full glass-panel p-2.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-[#00F5FF] flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-[11px]">Professional Flutter Sprint</div>
                        <div className="text-[9px] text-slate-300">Firebase real-time sync verified</div>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono">Just now</span>
                  </div>

                  {/* Fingerprint Scanner with Ultrasonic Ripple */}
                  <div className="flex flex-col items-center gap-1.5 pb-1">
                    <button
                      onClick={handleUnlock}
                      className="relative w-12 h-12 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-[#00F5FF]/50 flex items-center justify-center group active:scale-95 transition-all shadow-[0_0_20px_rgba(0,245,255,0.4)]"
                    >
                      <Fingerprint className="w-7 h-7 text-[#00F5FF] group-hover:scale-110 transition-transform" />
                      <span className="absolute inset-0 rounded-full bg-[#00F5FF]/30 animate-ping pointer-events-none" />
                    </button>
                    <span className="text-[9px] font-mono text-slate-300">Swipe up or touch sensor to unlock</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN STATE 4: HOME SCREEN & RUNNING APPS */}
            {screenState === 'home' && (
              <>
                {/* SMART PHONE TOP STATUS BAR */}
                <div
                  onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
                  className={`relative z-40 px-5 pt-2 pb-1 flex items-center justify-between font-mono text-slate-300 cursor-pointer hover:bg-white/5 transition-colors ${
                    isLandscape ? 'text-[10px] px-6 pt-1 pb-0.5' : 'text-[11px]'
                  }`}
                  title="Click to toggle Quick Settings shade"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white tracking-tight">{currentTime}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      5G
                    </span>
                    {isLandscape && (
                      <span className="text-[9px] text-slate-400 hidden sm:inline">
                        &bull; {liveWeather.location} &bull; {liveWeather.temp}&deg;C
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Signal className="w-3 h-3 text-slate-300" />
                    <Wifi className={`w-3 h-3 ${wifiEnabled ? 'text-[#00F5FF]' : 'text-slate-500'}`} />
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] text-slate-200">98%</span>
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* QUICK SETTINGS PULL-DOWN NOTIFICATION SHADE */}
                {quickSettingsOpen && (
                  <div className="absolute inset-x-2 top-8 z-50 bg-[#0b0f1a]/95 backdrop-blur-3xl p-4 rounded-3xl border border-white/15 shadow-2xl space-y-4 animate-fluid-shade">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="text-xs font-space font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#00F5FF]" />
                        <span>{isLandscape ? 'Tablet View' : 'Smart Phone'} &bull; Control Center</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{currentDate}</span>
                    </div>

                    {/* Quick Toggle Tiles */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setWifiEnabled(!wifiEnabled);
                        }}
                        className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                          wifiEnabled ? 'bg-[#00F5FF] text-black shadow-md' : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        <Wifi className="w-4 h-4" />
                        <span className="text-[9px] font-mono font-bold">Wi-Fi</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setSoundMode((s) => (s === 'sound' ? 'vibrate' : s === 'vibrate' ? 'mute' : 'sound'));
                        }}
                        className="p-2.5 rounded-2xl bg-[#3D5AFE] text-white shadow-md flex flex-col items-center gap-1 transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-[9px] font-mono font-bold capitalize">{soundMode}</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setBluetoothEnabled(!bluetoothEnabled);
                        }}
                        className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                          bluetoothEnabled ? 'bg-[#7C4DFF] text-white shadow-md' : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        <Bluetooth className="w-4 h-4" />
                        <span className="text-[9px] font-mono font-bold">Bluetooth</span>
                      </button>

                      {/* Mode Toggle: Switch to Tablet / Switch to Smartphone */}
                      <button
                        onClick={() => {
                          toggleFold();
                          setQuickSettingsOpen(false);
                        }}
                        className="p-2.5 rounded-2xl bg-gradient-to-br from-[#00F5FF]/20 to-[#7C4DFF]/20 border border-[#00F5FF]/60 text-white shadow-md flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
                        title={isLandscape ? 'Switch to Smartphone Portrait View' : 'Switch to Tablet Landscape View'}
                      >
                        {isLandscape ? (
                          <Smartphone className="w-4 h-4 text-[#00F5FF]" />
                        ) : (
                          <Tablet className="w-4 h-4 text-[#7C4DFF]" />
                        )}
                        <span className="text-[9px] font-mono font-bold text-[#00F5FF] truncate max-w-full">
                          {isLandscape ? 'Switch Phone' : 'Switch Tab'}
                        </span>
                      </button>
                    </div>

                    {/* Screen Brightness Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Display Brightness</span>
                        <span className="text-[#00F5FF]">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#00F5FF]"
                      />
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span>{isLandscape ? 'Tablet Workstation [Fold 6 Kinematics]' : 'Smart Phone [PS Edition]'}</span>
                      <button onClick={() => setQuickSettingsOpen(false)} className="text-[#00F5FF] hover:underline">
                        Close Shade
                      </button>
                    </div>
                  </div>
                )}

                {/* DISPLAY AREA: FLUID MORPHING HOME SCREEN OR IN-APP FRAME */}
                <div className="relative flex-1 overflow-hidden z-10 flex flex-col">
                  {activeApp === null ? (
                    /* UNIFIED FLUID HOME SCREEN (Fluid 2D Layout Morphing) */
                    <div className="relative flex-1 w-full h-full overflow-hidden select-none">
                      {/* Constellation Particle Canvas (Continuously expands without resetting particles) */}
                      <InteractiveWallpaper theme={wallpaperTheme} isLandscape={isLandscape} />

                      {/* TOP WEATHER CAPSULE (FLUID HORIZONTAL MORPH) */}
                      <div
                        style={{
                          transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
                          ...(isLandscape
                            ? {
                                top: '12px',
                                left: '20px',
                                right: '20px',
                                height: '76px',
                              }
                            : {
                                top: '8px',
                                left: '10px',
                                right: '10px',
                                height: '80px',
                              }),
                        }}
                        className="absolute z-10 glass-panel rounded-2xl sm:rounded-3xl border border-white/10 text-white shadow-lg backdrop-blur-2xl overflow-hidden"
                      >
                        {!isLandscape ? (
                          /* SMARTPHONE COVER SCREEN WIDGET (Image 3 Clean 3-Row Layout) */
                          <div className="w-full h-full px-3.5 py-2.5 flex items-center justify-between select-none">
                            {/* Left Column: 3 Clean Rows */}
                            <div className="flex flex-col justify-between h-full min-w-0 pr-2">
                              {/* Row 1: Weather Icon & Location */}
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                                <span className="font-space font-bold text-xs text-white tracking-wide truncate">
                                  {liveWeather.location.split(',')[0]}
                                </span>
                              </div>
                              {/* Row 2: Date */}
                              <div className="text-[11px] font-mono text-slate-300 truncate">
                                {currentDate}
                              </div>
                              {/* Row 3: 120Hz LTPO Indicator */}
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <span>{is120Hz ? '120Hz LTPO' : '60Hz Engine'}</span>
                              </div>
                            </div>

                            {/* Right Column: 3 Clean Rows */}
                            <div className="flex flex-col justify-between items-end h-full shrink-0 pl-2">
                              {/* Row 1: Temp & Condition */}
                              <div className="text-xs font-mono font-bold text-[#00F5FF] tracking-tight">
                                {liveWeather.temp}&deg;C {liveWeather.condition}
                              </div>
                              {/* Row 2: Time */}
                              <div className="text-sm font-orbitron font-extrabold text-[#00F5FF] tracking-wider drop-shadow-[0_0_8px_rgba(0,245,255,0.4)] leading-tight">
                                {currentTime}
                              </div>
                              {/* Row 3: Screen Mode Tag */}
                              <div className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest">
                                Cover 22:9
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* TABLET WIDESCREEN BANNER WIDGET (Image 8 Spacious Layout) */
                          <div className="w-full h-full px-5 py-2 flex items-center justify-between select-none">
                            {/* Left Side: Squircle Icon & Weather Info */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Sun className="w-6 h-6 animate-pulse" />
                              </div>
                              <div className="flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-space font-bold text-sm text-white tracking-wide truncate">
                                    {liveWeather.location}
                                  </span>
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00F5FF]/15 text-[#00F5FF] font-mono border border-[#00F5FF]/30 font-bold shrink-0">
                                    {liveWeather.temp}&deg;C {liveWeather.condition}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                                  <span>{currentDate} (IST)</span>
                                  <span>&bull;</span>
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {is120Hz ? '120Hz LTPO' : '60Hz Engine'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Big Digital Clock & Widescreen Tag */}
                            <div className="flex flex-col items-end shrink-0 pl-4">
                              <div className="text-2xl lg:text-3xl font-extrabold font-orbitron text-[#00F5FF] tracking-tight drop-shadow-[0_0_12px_rgba(0,245,255,0.4)]">
                                {currentTime}
                              </div>
                              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest mt-0.5">
                                FOLD 6 INNER &bull; WIDESCREEN
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* DESKTOP APP SQUIRCLE GRID (Smartphone 4x6 / Tablet 7x5 - Bottom-Aligned Grid) */}
                      <div
                        style={{
                          transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
                          ...(isLandscape
                            ? { top: '96px', bottom: '76px', left: '16px', right: '16px' }
                            : { top: '94px', bottom: '70px', left: '10px', right: '10px' }),
                        }}
                        className="absolute z-10 overflow-hidden"
                      >
                        {HOME_APPS.map((app, i) => {
                          // 1. Smartphone View: 4 columns x 6 rows (all icons aligned at bottom: rows 4 & 5)
                          let phoneLeft: string;
                          let phoneTop: string;
                          const phoneWidth = '25%'; // 4 columns
                          const phoneHeight = `${100 / 6}%`; // 6 rows = 16.666%

                          if (i < 4) {
                            // Row index 4 (second row from bottom): Profile, Gallery, Skills, Messages
                            phoneLeft = `${i * 25}%`;
                            phoneTop = `${(4 / 6) * 100}%`; // 66.666%
                          } else {
                            // Row index 5 (bottom-most row): Chat, Snake Game, Settings (centered across 4 columns)
                            const col = i - 4;
                            phoneLeft = `${12.5 + col * 25}%`;
                            phoneTop = `${(5 / 6) * 100}%`; // 83.333%
                          }

                          // 2. Tablet View: 7 columns x 5 rows (all 7 icons aligned in bottom row 4)
                          const tabWidth = `${100 / 7}%`; // 7 columns = 14.2857%
                          const tabHeight = '20%'; // 5 rows = 20%
                          const tabLeft = `${i * (100 / 7)}%`;
                          const tabTop = '80%'; // Row index 4 (bottom row of 5)

                          return (
                            <div
                              key={app.id}
                              style={{
                                position: 'absolute',
                                left: isLandscape ? tabLeft : phoneLeft,
                                top: isLandscape ? tabTop : phoneTop,
                                width: isLandscape ? tabWidth : phoneWidth,
                                height: isLandscape ? tabHeight : phoneHeight,
                                transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
                              }}
                              className="flex items-center justify-center p-1"
                            >
                              <AppIcon
                                name={app.name}
                                icon={app.icon}
                                iconImage={app.iconImage}
                                bgGradient={app.bgGradient}
                                badge={app.badge}
                                compact={isLandscape}
                                onClick={() => openApp(app.id)}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* PERSISTENT DOCK (UNDER THE ICONS AT BOTTOM CENTER) */}
                      <div
                        style={{
                          transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)',
                          ...(isLandscape
                            ? {
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 'min(520px, calc(100% - 32px))',
                                height: '56px',
                                flexDirection: 'row',
                              }
                            : {
                                bottom: '8px',
                                left: '10px',
                                right: '10px',
                                transform: 'none',
                                height: '54px',
                                width: 'calc(100% - 20px)',
                                flexDirection: 'row',
                              }),
                        }}
                        className="absolute z-10 glass-panel p-2 rounded-2xl sm:rounded-3xl border border-white/10 flex items-center justify-around shadow-2xl backdrop-blur-2xl"
                      >
                        <button
                          onClick={() => openApp('profile')}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-cyan-500/20 text-white hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 hover:border-cyan-500/30 cursor-pointer"
                          title="Profile (Pullingal Soorath)"
                        >
                          <img src="./app-icons/profile.png" alt="Profile" className="w-4 h-4 object-contain rounded" />
                          {isLandscape && <span className="text-xs font-sans font-medium text-white">Profile</span>}
                        </button>
                        <button
                          onClick={() => openApp('gallery')}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-white hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 hover:border-rose-500/30 cursor-pointer"
                          title="Gallery (Projects)"
                        >
                          <img src="./app-icons/gallery.png" alt="Gallery" className="w-4 h-4 object-contain rounded" />
                          {isLandscape && <span className="text-xs font-sans font-medium text-white">Gallery</span>}
                        </button>
                        <button
                          onClick={() => openApp('skills')}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-violet-500/20 text-white hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 hover:border-violet-500/30 cursor-pointer"
                          title="Skills (Flutter, Dart, UI/UX)"
                        >
                          <Award className="w-4 h-4 text-violet-400" />
                          {isLandscape && <span className="text-xs font-sans font-medium text-white">Skills</span>}
                        </button>
                        <button
                          onClick={() => openApp('messages')}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-emerald-500/20 text-white hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 hover:border-emerald-500/30 cursor-pointer"
                          title="Mail"
                        >
                          <img src="./app-icons/mail.png" alt="Mail" className="w-4 h-4 object-contain rounded" />
                          {isLandscape && <span className="text-xs font-sans font-medium text-white">Mail</span>}
                        </button>
                        <button
                          onClick={() => openApp('chat')}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-cyan-500/20 text-white hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 hover:border-cyan-500/30 cursor-pointer"
                          title="Chat"
                        >
                          <img src="./app-icons/chat.png" alt="Chat" className="w-4 h-4 object-contain rounded" />
                          {isLandscape && <span className="text-xs font-sans font-medium text-white">Chat</span>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* IN-APP CONTAINER (Edge-to-edge for tablet & chat app) */
                    <div className={`flex-1 min-h-0 flex flex-col ${isLandscape || activeApp === 'chat' ? 'p-0' : 'p-2'} overflow-hidden animate-fluid-scale`}>
                      {activeApp !== 'chat' && (
                        <div className={`flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 shrink-0 ${isLandscape ? 'px-3 pt-2 bg-[#060a14]/90' : ''}`}>
                          <button
                            onClick={goHome}
                            onMouseEnter={() => sound.playHover()}
                            className="flex items-center gap-1 text-xs font-mono text-[#00F5FF] hover:underline font-semibold cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Home Screen</span>
                          </button>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">
                            {isLandscape ? 'Fold 6 Inner \u2022 Widescreen Tablet' : 'Smart Phone View'}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-h-0 overflow-hidden relative">
                        {activeApp === 'profile' && (
                          <ProfileApp
                            onOpenCVModal={onOpenCVModal}
                            onOpenMessages={() => openApp('messages')}
                          />
                        )}
                        {activeApp === 'gallery' && (
                          <GalleryApp onLaunchApp={(appId) => openApp(appId)} />
                        )}
                        {activeApp === 'skills' && <SkillsApp />}
                        {activeApp === 'messages' && <MessagesApp />}
                        {activeApp === 'phone' && <PhoneApp />}
                        {activeApp === 'notes' && <NotesApp isSPenActive={isSPenEjected} />}
                        {activeApp === 'browser' && <BrowserApp />}
                        {activeApp === 'settings' && (
                          <SettingsApp
                            currentWallpaper={wallpaperTheme}
                            onSelectWallpaper={(wp) => setWallpaperTheme(wp)}
                            is120Hz={is120Hz}
                            onToggle120Hz={() => setIs120Hz(!is120Hz)}
                            navStyle={navStyle}
                            onToggleNavStyle={() => setNavStyle(navStyle === 'buttons' ? 'gestures' : 'buttons')}
                            onOpenCVModal={onOpenCVModal}
                          />
                        )}
                        {activeApp === 'chat' && (
                          <RealtimeChatApp
                            onOpenCVModal={onOpenCVModal}
                            isTablet={isLandscape}
                            onGoHome={goHome}
                          />
                        )}
                        {activeApp === 'snake' && <SnakeAppEmbedded />}
                      </div>
                    </div>
                  )}
                </div>

                {/* SYSTEM NAVIGATION BAR */}
                {navStyle === 'buttons' ? (
                  <div
                    className={`relative z-40 flex items-center justify-between border-t border-white/5 bg-[#07090f]/95 backdrop-blur-md ${
                      isLandscape ? 'h-6 px-12' : 'h-8 px-6'
                    }`}
                  >
                    <button
                      onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
                      className="text-slate-400 hover:text-white p-1 active:scale-90 transition-all duration-200"
                      title="Recents"
                    >
                      <MenuIcon className="w-3.5 h-3.5" />
                    </button>

                    <button onClick={goHome} className="p-1 px-4 text-slate-300 hover:text-[#00F5FF] active:scale-95 transition-all duration-200" title="Home">
                      <div className="w-8 h-1 rounded-full bg-slate-400 hover:bg-[#00F5FF] hover:w-10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                    </button>

                    <button onClick={goHome} className="text-slate-400 hover:text-white p-1 active:scale-90 transition-all duration-200" title="Back">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={goHome}
                    className={`relative z-40 flex items-center justify-center cursor-pointer hover:bg-white/5 ${
                      isLandscape ? 'h-4' : 'h-5'
                    }`}
                  >
                    <div className="w-24 h-1 rounded-full bg-slate-400 hover:bg-[#00F5FF] hover:w-28 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Dedicated Right-Side Tools Dock for Smart Phone */}
      {!isLandscape && (
        <div className="flex flex-col gap-2.5 z-30 font-mono text-xs w-[180px] sm:w-[190px] shrink-0 sm:pt-6 transition-all duration-[2000ms] ease-[cubic-bezier(0.25,1,0.35,1)] animate-fluid-scale">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#00F5FF]" />
            <span>STUDIO TOOLS</span>
          </div>

          {/* Switch to 3D Orbit */}
          {onSwitchTo3D && (
            <button
              onClick={() => {
                sound.playClick();
                onSwitchTo3D();
              }}
              onMouseEnter={() => sound.playHover()}
              className="glass-panel px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold tracking-wider text-[#00F5FF] bg-[#050811]/90 border border-[#00F5FF]/50 hover:bg-[#00F5FF]/20 hover:border-[#00F5FF] hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all flex items-center gap-2 shadow-md backdrop-blur-xl w-full"
              title="Return to 3D Orbit Monolith"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#00F5FF]" />
              <span className="whitespace-nowrap">SWITCH TO 3D</span>
            </button>
          )}

          {/* Tablet Mode */}
          <button
            onClick={toggleFold}
            onMouseEnter={() => sound.playHover()}
            className="glass-panel px-3.5 py-2.5 rounded-2xl border border-white/10 hover:border-[#00F5FF]/50 hover:bg-[#00F5FF]/10 text-slate-300 hover:text-white transition-all flex items-center gap-2 shadow-md backdrop-blur-md w-full text-xs"
            title="Unfold to Tablet View"
          >
            <Tablet className="w-3.5 h-3.5 text-[#00F5FF]" />
            <span className="whitespace-nowrap">Tablet Mode</span>
          </button>

          {/* Eject / Insert S-Pen Stylus */}
          <button
            onClick={toggleSPen}
            onMouseEnter={() => sound.playHover()}
            className={`glass-panel px-3.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 shadow-md backdrop-blur-md w-full text-xs ${
              isSPenEjected
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-300 hover:text-white'
            }`}
            title="Eject / Insert Virtual S-Pen Stylus"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">{isSPenEjected ? 'Insert S-Pen' : 'Eject S-Pen'}</span>
          </button>

          {/* Display Size Scale Controller */}
          <div className="glass-panel p-2.5 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col gap-1.5 w-full">
            <span className="text-[10px] font-mono text-slate-400 px-1">Display Size</span>
            <div className="flex items-center justify-between gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              {[0.75, 0.85, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    sound.playClick();
                    setScaleFactor(s);
                  }}
                  className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors text-center ${
                    scaleFactor === s
                      ? 'bg-[#00F5FF] text-black font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Right-Side Tools Dock for Tablet Mode */}
      {isLandscape && (
        <div className="flex flex-row xl:flex-col gap-2.5 z-50 font-mono text-xs w-full xl:w-[195px] shrink-0 xl:pt-4 justify-center items-center xl:items-start transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] animate-fluid-scale">
          <div className="hidden xl:flex text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1 items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#7C4DFF]" />
            <span>TABLET TOOLS</span>
          </div>

          {/* SWITCH TO PHONE BUTTON (Primary Highlighted Action) */}
          <button
            onClick={toggleFold}
            onMouseEnter={() => sound.playHover()}
            className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-mono font-bold tracking-wider text-[#00F5FF] bg-[#00F5FF]/20 border-2 border-[#00F5FF] hover:bg-[#00F5FF]/30 hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] transition-all flex items-center gap-2 shadow-lg backdrop-blur-xl w-auto xl:w-full justify-center active:scale-95"
            title="Fold back to Smartphone Portrait View"
          >
            <Smartphone className="w-4 h-4 text-[#00F5FF]" />
            <span className="whitespace-nowrap">SWITCH TO PHONE</span>
          </button>

          {/* Switch to 3D Orbit */}
          {onSwitchTo3D && (
            <button
              onClick={() => {
                sound.playClick();
                setIsLandscape(false);
                onSwitchTo3D();
              }}
              onMouseEnter={() => sound.playHover()}
              className="glass-panel px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold tracking-wider text-slate-200 bg-[#050811]/90 border border-white/15 hover:border-[#00F5FF]/60 hover:text-[#00F5FF] transition-all flex items-center gap-2 shadow-md backdrop-blur-xl w-auto xl:w-full justify-center active:scale-95"
              title="Return to 3D Orbit Monolith"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#00F5FF]" />
              <span className="whitespace-nowrap">SWITCH TO 3D</span>
            </button>
          )}

          {/* Eject / Insert S-Pen Stylus */}
          <button
            onClick={toggleSPen}
            onMouseEnter={() => sound.playHover()}
            className={`glass-panel px-3.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 shadow-md backdrop-blur-md w-auto xl:w-full justify-center text-xs ${
              isSPenEjected
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-300 hover:text-white'
            }`}
            title="Eject / Insert Virtual S-Pen Stylus"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">{isSPenEjected ? 'S-Pen Ejected' : 'S-Pen Stylus'}</span>
          </button>

          {/* Close Tablet View */}
          <button
            onClick={toggleFold}
            onMouseEnter={() => sound.playHover()}
            className="glass-panel px-3.5 py-2.5 rounded-2xl border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 transition-all flex items-center gap-2 shadow-md backdrop-blur-md w-auto xl:w-full justify-center text-xs"
            title="Fold Tablet View"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span className="whitespace-nowrap">Close Tablet</span>
          </button>
        </div>
      )}

      {/* Floating Scroll HUD Prompt in Tablet Mode */}
      {scrollPrompt && isLandscape && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#070b14]/95 backdrop-blur-xl border border-[#00F5FF]/50 px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(0,245,255,0.4)] flex items-center gap-2.5 text-xs font-mono text-[#00F5FF] pointer-events-none animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#00F5FF] animate-ping" />
          <span className="font-semibold tracking-wide">{scrollPrompt}</span>
        </div>
      )}
    </div>
    </div>
  );
};

// Squircle App Icon Helper Component
const AppIcon: React.FC<{
  name: string;
  icon?: React.ElementType;
  iconImage?: string;
  bgGradient?: string;
  badge?: string;
  compact?: boolean;
  onClick: () => void;
}> = ({ name, icon: Icon, iconImage, bgGradient = 'from-slate-600 to-slate-800', badge, compact = false, onClick }) => {
  return (
    <button
      onClick={() => {
        sound.playHover();
        onClick();
      }}
      className="flex flex-col items-center gap-1 group active:scale-90 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer"
    >
      <div className="relative">
        <div
          style={{ transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)' }}
          className={`${
            compact ? 'w-10 h-10 rounded-[14px]' : 'w-11 h-11 sm:w-12 sm:h-12 rounded-[18px]'
          } ${
            iconImage ? 'bg-transparent' : `bg-gradient-to-br ${bgGradient} p-0.5`
          } shadow-md group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(0,245,255,0.45)] flex items-center justify-center overflow-hidden`}
        >
          {iconImage ? (
            <img
              src={iconImage}
              alt={name}
              className={`w-full h-full object-contain ${compact ? 'rounded-[14px]' : 'rounded-[18px]'}`}
            />
          ) : (
            <div className={`w-full h-full ${compact ? 'rounded-[12px]' : 'rounded-[16px]'} bg-black/20 flex items-center justify-center text-white`}>
              {Icon && <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />}
            </div>
          )}
        </div>
        {badge && (
          <span
            style={{ transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)' }}
            className={`absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-[#00F5FF] ${
              compact ? 'text-[7px]' : 'text-[8px]'
            } font-mono font-bold text-black border border-black shadow-sm`}
          >
            {badge}
          </span>
        )}
      </div>
      <span
        style={{ transition: 'all 2000ms cubic-bezier(0.32, 0.72, 0, 1)' }}
        className={`${
          compact ? 'text-[9.5px] max-w-[72px]' : 'text-[10px] max-w-[64px]'
        } font-sans text-white group-hover:text-[#00F5FF] transition-colors truncate text-center font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}
      >
        {name}
      </span>
    </button>
  );
};

/* ========================================================
   EMBEDDED APP ADAPTERS
   ======================================================== */
const SnakeAppEmbedded: React.FC = () => {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }]);
  const [food, setFood] = useState({ x: 8, y: 8 });
  const [dir, setDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const gridSize = 14;

  const reset = () => {
    sound.playClick();
    setSnake([{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }]);
    setFood({ x: 8, y: 8 });
    setDir('UP');
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning || gameOver) return;
    const t = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          sound.playTerminalBeep(300);
          return prev;
        }

        const next = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          sound.playChirp(880, 0.05);
          setScore((s) => s + 10);
          setFood({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
        } else {
          next.pop();
        }
        return next;
      });
    }, 180);
    return () => clearInterval(t);
  }, [dir, food, gameOver, isRunning]);

  return (
    <div className="flex flex-col h-full items-center justify-between space-y-2 text-white">
      <div className="w-full flex justify-between text-xs font-mono px-2">
        <span className="text-emerald-400 font-bold">SCORE: {score}</span>
        <span className="text-slate-400">FLUTTER TICKER</span>
      </div>
      <div className="relative w-[230px] h-[230px] bg-slate-950 rounded-2xl border-2 border-emerald-500/40 p-1 grid grid-cols-14 grid-rows-14 shadow-inner">
        {(!isRunning || gameOver) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2 z-20">
            <span className="text-white text-xs font-mono">{gameOver ? `Game Over! Score: ${score}` : 'Flutter Snake Game'}</span>
            <button onClick={reset} className="px-4 py-1 rounded-full bg-emerald-400 text-black font-bold text-xs">
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div key={i} className={`w-full h-full rounded-[2px] ${isHead ? 'bg-emerald-400' : isBody ? 'bg-emerald-600' : isFood ? 'bg-rose-500 rounded-full animate-pulse' : ''}`} />
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => dir !== 'DOWN' && setDir('UP')} className="w-8 h-8 rounded-lg bg-slate-800 text-xs">▲</button>
        <div className="flex gap-4">
          <button onClick={() => dir !== 'RIGHT' && setDir('LEFT')} className="w-8 h-8 rounded-lg bg-slate-800 text-xs">◀</button>
          <button onClick={() => dir !== 'LEFT' && setDir('RIGHT')} className="w-8 h-8 rounded-lg bg-slate-800 text-xs">▶</button>
        </div>
        <button onClick={() => dir !== 'UP' && setDir('DOWN')} className="w-8 h-8 rounded-lg bg-slate-800 text-xs">▼</button>
      </div>
    </div>
  );
};

export const SamsungS23UltraOneUI = SmartPhoneView;
