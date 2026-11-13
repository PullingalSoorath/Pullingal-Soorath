import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCw,
  Play,
  Volume2,
  VolumeX,
  Gauge,
  Timer,
  Flame,
  Check,
  X,
  Edit2,
  Trash2,
  Flag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  ArrowLeft,
  Zap,
  Radio,
  Sliders,
  Award,
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';
import {
  createScore,
  updateRecordHolder,
  deleteScore,
  subscribeToLeaderboard,
  validatePlayerName,
  type RallyHighScore,
} from '../../../lib/firebaseHighscoreService';

interface RallyGameAppProps {
  isTablet?: boolean;
  onGoHome?: () => void;
}

// 6 Authentic Cars modeled after RallyGame-master cardata
export interface CarDef {
  id: string;
  name: string;
  category: string;
  description: string;
  bodyColor: number;
  accentColor: number;
  roofScoop: boolean;
  spoiler: boolean;
  topSpeed: number; // km/h
  acceleration: number;
  nitroPower: number;
  handling: number;
  maxRpm: number;
  weight: number;
}

export const CARS: CarDef[] = [
  {
    id: 'rally',
    name: 'Rally Raid 4WD',
    category: 'Rally WRC',
    description: 'All-wheel drive rally raid champion with long-travel suspension',
    bodyColor: 0xf8fafc,
    accentColor: 0x16a34a, // Castrol Green
    roofScoop: true,
    spoiler: true,
    topSpeed: 182,
    acceleration: 48,
    nitroPower: 300,
    handling: 1.0,
    maxRpm: 7800,
    weight: 1500,
  },
  {
    id: 'muscle',
    name: 'American V8 Muscle',
    category: 'Muscle Car',
    description: 'Raw American torque, rear-wheel drive burnout and high power slides',
    bodyColor: 0x1e293b,
    accentColor: 0xf97316,
    roofScoop: false,
    spoiler: false,
    topSpeed: 195,
    acceleration: 52,
    nitroPower: 350,
    handling: 0.88,
    maxRpm: 6000,
    weight: 1520,
  },
  {
    id: 'rocket',
    name: 'Rocket Hypercar',
    category: 'Hyper Formula',
    description: 'Extreme aerodynamic downforce, 15,000 RPM screams and lightning speed',
    bodyColor: 0x312e81,
    accentColor: 0x06b6d4,
    roofScoop: true,
    spoiler: true,
    topSpeed: 235,
    acceleration: 68,
    nitroPower: 500,
    handling: 1.15,
    maxRpm: 15000,
    weight: 1200,
  },
  {
    id: 'whitesloth',
    name: 'The White Beast',
    category: 'Sleeper Special',
    description: 'The infamous White Beast from RallyGame with insane 3000 nitro force',
    bodyColor: 0xffffff,
    accentColor: 0xdc2626,
    roofScoop: false,
    spoiler: true,
    topSpeed: 210,
    acceleration: 60,
    nitroPower: 850,
    handling: 1.04,
    maxRpm: 8500,
    weight: 960,
  },
  {
    id: 'hunter',
    name: 'Hunter 4x4 Off-Road',
    category: 'Heavy Off-Roader',
    description: 'Heavy duty 4x4 with lifted suspension, roof rack, and all-terrain grip',
    bodyColor: 0x3f6212,
    accentColor: 0xeab308,
    roofScoop: true,
    spoiler: false,
    topSpeed: 165,
    acceleration: 42,
    nitroPower: 280,
    handling: 0.85,
    maxRpm: 5500,
    weight: 2100,
  },
  {
    id: 'roadster',
    name: 'Apex Roadster',
    category: 'Open Top GT',
    description: 'Lightweight mid-engine roadster with razor sharp steering',
    bodyColor: 0xb91c1c,
    accentColor: 0x0284c7,
    roofScoop: false,
    spoiler: true,
    topSpeed: 190,
    acceleration: 50,
    nitroPower: 320,
    handling: 1.08,
    maxRpm: 7200,
    weight: 1180,
  },
];

// 4 Dynamic World Environments (from RallyGame DynamicType & StaticWorld)
export interface WorldDef {
  id: string;
  name: string;
  subtitle: string;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  roadColor: number;
  curbColor: number;
  trackLength: number;
  grip: number;
  weather: 'dust' | 'sand' | 'night' | 'neon';
}

export const WORLDS: WorldDef[] = [
  {
    id: 'valley',
    name: 'Valley Rally',
    subtitle: 'Dynamic Finnish Dirt & Pines',
    skyColor: 0x38bdf8,
    fogColor: 0x7dd3fc,
    groundColor: 0x166534,
    roadColor: 0x5c4033,
    curbColor: 0xf59e0b,
    trackLength: 2600,
    grip: 1.0,
    weather: 'dust',
  },
  {
    id: 'cliff',
    name: 'Desert Canyon',
    subtitle: 'Sahara Sun-Baked Dust & Cliffs',
    skyColor: 0xf97316,
    fogColor: 0xfdba74,
    groundColor: 0x9a3412,
    roadColor: 0x7c2d12,
    curbColor: 0xfde047,
    trackLength: 2800,
    grip: 0.92,
    weather: 'sand',
  },
  {
    id: 'city',
    name: 'City Expressway',
    subtitle: 'Midnight Tokyo Asphalt & Neons',
    skyColor: 0x020617,
    fogColor: 0x0f172a,
    groundColor: 0x0f172a,
    roadColor: 0x1e293b,
    curbColor: 0x06b6d4,
    trackLength: 3000,
    grip: 1.1,
    weather: 'night',
  },
  {
    id: 'skyway',
    name: 'Floating Skyway',
    subtitle: 'Futuristic High-Altitude Highway',
    skyColor: 0x312e81,
    fogColor: 0x4338ca,
    groundColor: 0x1e1b4b,
    roadColor: 0x3730a3,
    curbColor: 0xa855f7,
    trackLength: 3200,
    grip: 1.15,
    weather: 'neon',
  },
];

export const RallyGameApp: React.FC<RallyGameAppProps> = ({ isTablet: _isTablet = false, onGoHome }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'racing' | 'summary' | 'leaderboard'>('menu');
  const [gameMode, setGameMode] = useState<'duel' | 'timetrial' | 'freeroam'>('duel');
  const [selectedCarIdx, setSelectedCarIdx] = useState(0);
  const [selectedWorldIdx, setSelectedWorldIdx] = useState(0);

  // Telemetry HUD state
  const [speedKmh, setSpeedKmh] = useState(0);
  const [rpmVal, setRpmVal] = useState(1000);
  const [gearLabel, setGearLabel] = useState('1');
  const [nitroFuel, setNitroFuel] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(45.0);
  const [lapProgress, setLapProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [duelWins, setDuelWins] = useState(0);
  const [duelStatus, setDuelStatus] = useState<'1ST' | '2ND'>('1ST');
  const [duelDistanceDiff, setDuelDistanceDiff] = useState(0);
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);

  // Settings
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [autoGas, setAutoGas] = useState(true);

  // Leaderboard & CRUD
  const [leaderboard, setLeaderboard] = useState<RallyHighScore[]>([]);
  const [worldRecord, setWorldRecord] = useState<RallyHighScore | null>(null);
  const [isNewRecordModal, setIsNewRecordModal] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Admin CRUD
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  // Race summary
  const [summaryData, setSummaryData] = useState({
    title: 'VICTORY!',
    isWinner: true,
    score: 0,
    timeFormatted: '00:00:0',
    topSpeed: 0,
    duelWins: 0,
    carName: 'Rally Raid 4WD',
    worldName: 'Valley Rally',
  });

  const [countdownBeepNum, setCountdownBeepNum] = useState<number | string>(3);

  // Audio References for RallyGame-master sounds
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const engineAudioRef = useRef<HTMLAudioElement | null>(null);

  // Input states
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    handbrake: false,
    nitro: false,
    jump: false,
  });

  const touchSteer = useRef<number>(0);
  const touchBrake = useRef<boolean>(false);
  const touchNitro = useRef<boolean>(false);
  const touchJump = useRef<boolean>(false);

  // Mutable Physics State
  const physics = useRef({
    speed: 0, // km/h
    carX: 0, // Lateral position
    carY: 0, // Vertical position (jumps!)
    velocityY: 0,
    isAirborne: false,
    carHeading: 0,
    carRoll: 0,
    carPitch: 0,
    distance: 0,
    timeRemaining: 45.0,
    startTime: 0,
    elapsedMs: 0,
    nitroFuel: 100, // 0 to 100
    isNitroActive: false,
    isDrifting: false,
    driftPoints: 0,
    topSpeedRecorded: 0,
    nextCheckpointDist: 400,
    isFinished: false,
    // AI Rival Car for Duel Mode
    rivalDist: 15,
    rivalSpeed: 120,
    rivalX: 2.2,
    shake: 0,
  });

  // Initialize and load RallyGame-master background music & engine audio
  useEffect(() => {
    try {
      const music = new Audio('./rallygame/sounds/duel_music.ogg');
      music.loop = true;
      music.volume = 0.28;
      bgMusicRef.current = music;

      const engine = new Audio('./rallygame/sounds/engine.wav');
      engine.loop = true;
      engine.volume = 0.22;
      engineAudioRef.current = engine;
    } catch {
      // Audio safety
    }

    return () => {
      bgMusicRef.current?.pause();
      engineAudioRef.current?.pause();
    };
  }, []);

  // Sync background music with mute/music states
  useEffect(() => {
    if (bgMusicRef.current) {
      if (isMuted || !isMusicPlaying || gameState === 'racing') {
        bgMusicRef.current.pause();
      } else {
        bgMusicRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, isMusicPlaying, gameState]);

  // Sync engine sound during racing
  useEffect(() => {
    if (engineAudioRef.current) {
      if (gameState === 'racing' && !isMuted) {
        engineAudioRef.current.play().catch(() => {});
      } else {
        engineAudioRef.current.pause();
      }
    }
  }, [gameState, isMuted]);

  // Subscribe to real-time Firestore Leaderboard
  useEffect(() => {
    const unsub = subscribeToLeaderboard((scores) => {
      setLeaderboard(scores);
      if (scores.length > 0) {
        setWorldRecord(scores[0]);
      }
    });
    return () => unsub();
  }, []);

  // Format millisecond timer to "MM:SS:T"
  const formatRaceTime = (ms: number) => {
    const totalTenths = Math.floor(ms / 100);
    const tenths = totalTenths % 10;
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const mins = Math.floor(totalSecs / 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}:${tenths}`;
  };

  // Keyboard Event Listeners with emulator scroll isolation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyN', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.current.up = true;
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.current.down = true;
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
      if (e.code === 'Space') keys.current.handbrake = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'n' || e.key === 'N') keys.current.nitro = true;
      if (e.code === 'KeyF' || e.code === 'KeyJ') keys.current.jump = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyN', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.stopPropagation();
      }

      if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.current.up = false;
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.current.down = false;
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
      if (e.code === 'Space') keys.current.handbrake = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'n' || e.key === 'N') keys.current.nitro = false;
      if (e.code === 'KeyF' || e.code === 'KeyJ') keys.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 3D WebGL Three.js Game Engine
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const carDef = CARS[selectedCarIdx];
    const worldDef = WORLDS[selectedWorldIdx];

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(worldDef.skyColor);
    scene.fog = new THREE.Fog(worldDef.fogColor, 100, 480);

    const camera = new THREE.PerspectiveCamera(64, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, -7.2);
    camera.lookAt(0, 1.2, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(40, 70, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // =========================================================================
    // HERO CAR BUILDER (Accurately creates Rally, Muscle, Rocket, White Beast...)
    // =========================================================================
    const carGroup = new THREE.Group();

    // Body Paint Material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: carDef.bodyColor,
      metalness: 0.35,
      roughness: 0.2,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: carDef.accentColor,
      metalness: 0.2,
      roughness: 0.3,
    });
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.1,
      roughness: 0.8,
    });

    // Lower Chassis
    const lowerBodyGeo = new THREE.BoxGeometry(1.7, 0.4, 3.4);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, chassisMat);
    lowerBody.position.y = 0.36;
    lowerBody.castShadow = true;
    carGroup.add(lowerBody);

    // Main Mid Body
    const midBodyGeo = new THREE.BoxGeometry(1.66, 0.44, 3.3);
    const midBody = new THREE.Mesh(midBodyGeo, bodyMat);
    midBody.position.y = 0.68;
    midBody.castShadow = true;
    carGroup.add(midBody);

    // Cockpit Cabin
    const cabinGeo = new THREE.BoxGeometry(1.36, 0.46, 1.9);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 1.05, -0.15);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Dual Racing Livery Stripes
    const stripeGeo = new THREE.BoxGeometry(0.24, 0.02, 3.25);
    const stripeL = new THREE.Mesh(stripeGeo, accentMat);
    stripeL.position.set(-0.2, 0.91, 0.05);
    const stripeR = new THREE.Mesh(stripeGeo, accentMat);
    stripeR.position.set(0.2, 0.91, 0.05);
    carGroup.add(stripeL);
    carGroup.add(stripeR);

    // Windshield & Windows Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.08,
      transparent: true,
      opacity: 0.82,
    });
    const frontGlassGeo = new THREE.PlaneGeometry(1.3, 0.5);
    const frontGlass = new THREE.Mesh(frontGlassGeo, glassMat);
    frontGlass.rotation.x = Math.PI / 4.2;
    frontGlass.position.set(0, 1.06, 0.82);
    carGroup.add(frontGlass);

    const rearGlassGeo = new THREE.PlaneGeometry(1.26, 0.44);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.rotation.x = -Math.PI / 4.4;
    rearGlass.rotation.y = Math.PI;
    rearGlass.position.set(0, 1.06, -1.12);
    carGroup.add(rearGlass);

    // Optional Roof Scoop
    if (carDef.roofScoop) {
      const scoopGeo = new THREE.BoxGeometry(0.36, 0.14, 0.48);
      const scoopMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const scoop = new THREE.Mesh(scoopGeo, scoopMat);
      scoop.position.set(0, 1.35, 0.3);
      carGroup.add(scoop);
    }

    // Optional WRC Spoiler Wing
    if (carDef.spoiler) {
      const spoilerMat = new THREE.MeshStandardMaterial({ color: carDef.accentColor, roughness: 0.3 });
      const wingGeo = new THREE.BoxGeometry(1.58, 0.08, 0.32);
      const wing = new THREE.Mesh(wingGeo, spoilerMat);
      wing.position.set(0, 1.28, -1.54);
      carGroup.add(wing);

      const standGeo = new THREE.BoxGeometry(0.08, 0.28, 0.14);
      const standL = new THREE.Mesh(standGeo, bodyMat);
      standL.position.set(-0.55, 1.08, -1.54);
      const standR = new THREE.Mesh(standGeo, bodyMat);
      standR.position.set(0.55, 1.08, -1.54);
      carGroup.add(standL);
      carGroup.add(standR);
    }

    // Headlights & Taillights
    const headLightGeo = new THREE.BoxGeometry(0.3, 0.14, 0.04);
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headL = new THREE.Mesh(headLightGeo, headLightMat);
    headL.position.set(-0.56, 0.6, 1.66);
    const headR = new THREE.Mesh(headLightGeo, headLightMat);
    headR.position.set(0.56, 0.6, 1.66);
    carGroup.add(headL);
    carGroup.add(headR);

    const tailLightGeo = new THREE.BoxGeometry(0.36, 0.14, 0.04);
    const tailLightMatL = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const tailLightMatR = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const tailL = new THREE.Mesh(tailLightGeo, tailLightMatL);
    tailL.position.set(-0.56, 0.62, -1.66);
    const tailR = new THREE.Mesh(tailLightGeo, tailLightMatR);
    tailR.position.set(0.56, 0.62, -1.66);
    carGroup.add(tailL);
    carGroup.add(tailR);

    // Dual Exhaust Pipes & Nitro Flame Jets
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    const exL = new THREE.Mesh(exhaustGeo, exhaustMat);
    exL.position.set(-0.45, 0.28, -1.72);
    const exR = new THREE.Mesh(exhaustGeo, exhaustMat);
    exR.position.set(0.45, 0.28, -1.72);
    carGroup.add(exL);
    carGroup.add(exR);

    // Glowing Nitro Exhaust Flame Jets (activated when nitro is pressed)
    const nitroFlameGeo = new THREE.ConeGeometry(0.16, 0.75, 8);
    nitroFlameGeo.rotateX(-Math.PI / 2);
    const nitroFlameMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.95,
    });
    const flameL = new THREE.Mesh(nitroFlameGeo, nitroFlameMat);
    flameL.position.set(-0.45, 0.28, -2.15);
    flameL.visible = false;
    const flameR = new THREE.Mesh(nitroFlameGeo, nitroFlameMat);
    flameR.position.set(0.45, 0.28, -2.15);
    flameR.visible = false;
    carGroup.add(flameL);
    carGroup.add(flameR);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.29, 8);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8, roughness: 0.2 });

    const createWheel = () => {
      const g = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, rimMat);
      g.add(tire);
      g.add(rim);
      return g;
    };

    const frontWheelL = createWheel();
    frontWheelL.position.set(-0.88, 0.36, 1.1);
    const frontWheelR = createWheel();
    frontWheelR.position.set(0.88, 0.36, 1.1);
    const rearWheelL = createWheel();
    rearWheelL.position.set(-0.88, 0.36, -1.1);
    const rearWheelR = createWheel();
    rearWheelR.position.set(0.88, 0.36, -1.1);

    carGroup.add(frontWheelL);
    carGroup.add(frontWheelR);
    carGroup.add(rearWheelL);
    carGroup.add(rearWheelR);

    // Ground Shadow Blob
    const shadowGeo = new THREE.PlaneGeometry(2.1, 3.8);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.04;
    carGroup.add(shadowMesh);

    scene.add(carGroup);

    // =========================================================================
    // AI RIVAL CAR (For 1v1 DUEL MODE)
    // =========================================================================
    const rivalGroup = new THREE.Group();
    const rivalMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.25 });
    const rivalBody = new THREE.Mesh(midBodyGeo, rivalMat);
    rivalBody.position.y = 0.68;
    rivalGroup.add(rivalBody);

    const rivalCabin = new THREE.Mesh(cabinGeo, rivalMat);
    rivalCabin.position.set(0, 1.05, -0.15);
    rivalGroup.add(rivalCabin);

    const rW1 = createWheel();
    rW1.position.set(-0.88, 0.36, 1.1);
    const rW2 = createWheel();
    rW2.position.set(0.88, 0.36, 1.1);
    const rW3 = createWheel();
    rW3.position.set(-0.88, 0.36, -1.1);
    const rW4 = createWheel();
    rW4.position.set(0.88, 0.36, -1.1);
    rivalGroup.add(rW1);
    rivalGroup.add(rW2);
    rivalGroup.add(rW3);
    rivalGroup.add(rW4);

    rivalGroup.position.set(2.2, 0, 15);
    scene.add(rivalGroup);

    // =========================================================================
    // SCENERY & TRACK SEGMENTS
    // =========================================================================
    const SEGMENT_COUNT = 55;
    const SEGMENT_LEN = 16;
    const roadGroup = new THREE.Group();

    const roadGeo = new THREE.PlaneGeometry(14, SEGMENT_LEN);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({ color: worldDef.roadColor, roughness: 0.85 });

    const groundGeo = new THREE.PlaneGeometry(160, SEGMENT_LEN);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ color: worldDef.groundColor, roughness: 0.95 });

    const curbGeo = new THREE.BoxGeometry(0.8, 0.25, SEGMENT_LEN);
    const curbMat1 = new THREE.MeshStandardMaterial({ color: worldDef.curbColor, roughness: 0.5 });
    const curbMat2 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    interface RoadSeg {
      group: THREE.Group;
      z: number;
    }
    const segments: RoadSeg[] = [];

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const g = new THREE.Group();
      const z = i * SEGMENT_LEN - 20;

      const terrain = new THREE.Mesh(groundGeo, groundMat);
      terrain.position.y = -0.02;
      g.add(terrain);

      const road = new THREE.Mesh(roadGeo, roadMat);
      road.receiveShadow = true;
      g.add(road);

      const curbL = new THREE.Mesh(curbGeo, i % 2 === 0 ? curbMat1 : curbMat2);
      curbL.position.set(-7.4, 0.12, 0);
      g.add(curbL);

      const curbR = new THREE.Mesh(curbGeo, i % 2 === 0 ? curbMat2 : curbMat1);
      curbR.position.set(7.4, 0.12, 0);
      g.add(curbR);

      g.position.z = z;
      roadGroup.add(g);
      segments.push({ group: g, z });
    }
    scene.add(roadGroup);

    // Glowing Checkpoint Gate Arch
    const gateGroup = new THREE.Group();
    const pillarGeo = new THREE.BoxGeometry(0.9, 6.0, 0.9);
    const beamGeo = new THREE.BoxGeometry(16.5, 1.0, 0.9);
    const gateMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
    });
    const p1 = new THREE.Mesh(pillarGeo, gateMat);
    p1.position.set(-8.2, 3.0, 0);
    const p2 = new THREE.Mesh(pillarGeo, gateMat);
    p2.position.set(8.2, 3.0, 0);
    const beam = new THREE.Mesh(beamGeo, gateMat);
    beam.position.set(0, 6.0, 0);
    gateGroup.add(p1);
    gateGroup.add(p2);
    gateGroup.add(beam);
    gateGroup.position.set(0, 0, 400);
    scene.add(gateGroup);

    // Distant Scenery (Mountains or High-rises)
    const backdropGroup = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(55, 50, 4);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    for (let i = -7; i <= 7; i++) {
      const m = new THREE.Mesh(coneGeo, rockMat);
      m.position.set(i * 70, 25, 460 + Math.sin(i) * 30);
      backdropGroup.add(m);
    }
    scene.add(backdropGroup);

    // Weather / Tire Dust Particles
    const PART_COUNT = 160;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(PART_COUNT * 3);
    for (let i = 0; i < PART_COUNT * 3; i += 3) {
      partPos[i] = (Math.random() - 0.5) * 40;
      partPos[i + 1] = Math.random() * 12;
      partPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: worldDef.weather === 'dust' ? 0xd97706 : 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // =========================================================================
    // GAME ANIMATION LOOP (60 FPS)
    // =========================================================================
    let animId: number;
    let lastTime = performance.now();

    const loop = (currTime: number) => {
      animId = requestAnimationFrame(loop);
      const delta = Math.min((currTime - lastTime) / 1000, 0.05);
      lastTime = currTime;

      const p = physics.current;

      if (gameState === 'racing') {
        p.elapsedMs = performance.now() - p.startTime;

        // Check countdown timer
        if (gameMode !== 'freeroam') {
          p.timeRemaining -= delta;
          setTimeRemaining(p.timeRemaining);

          if (p.timeRemaining <= 0 && !p.isFinished) {
            p.isFinished = true;
            sound.playRallyCrash();
            handleFinishRace('TIME_UP');
            return;
          }
        }

        // Finish line check
        if (p.distance >= worldDef.trackLength && !p.isFinished) {
          p.isFinished = true;
          const isPlayerWinner = p.distance >= p.rivalDist;
          if (isPlayerWinner) {
            setDuelWins((w) => w + 1);
            confetti({ particleCount: 140, spread: 85 });
          }
          handleFinishRace(isPlayerWinner ? 'VICTORY' : 'DEFEAT');
          return;
        }

        // NITRO BOOST Mechanic (Key Shift/N or touch button)
        const wantsNitro = keys.current.nitro || touchNitro.current;
        if (wantsNitro && p.nitroFuel > 0 && p.speed > 30) {
          p.isNitroActive = true;
          p.nitroFuel = Math.max(0, p.nitroFuel - delta * 35);
          flameL.visible = true;
          flameR.visible = true;
          p.speed = Math.min(p.speed + carDef.nitroPower * 0.4 * delta, carDef.topSpeed * 1.25);
        } else {
          p.isNitroActive = false;
          flameL.visible = false;
          flameR.visible = false;
          // Regenerate nitro slowly over time
          p.nitroFuel = Math.min(100, p.nitroFuel + delta * 6);
        }
        setNitroFuel(Math.round(p.nitroFuel));

        // JUMP FORCE Mechanic (Key F or touch button)
        const wantsJump = keys.current.jump || touchJump.current;
        if (wantsJump && !p.isAirborne) {
          p.isAirborne = true;
          p.velocityY = 11.5; // Jump vertical velocity
          sound.playSPen();
        }

        // Air gravity physics
        if (p.isAirborne) {
          p.carY += p.velocityY * delta;
          p.velocityY -= 32 * delta; // Gravity
          if (p.carY <= 0) {
            p.carY = 0;
            p.velocityY = 0;
            p.isAirborne = false;
            p.shake = 0.2; // Landing thump
          }
        }

        // Acceleration & Braking
        const isBraking = keys.current.down || touchBrake.current;
        const isGas = keys.current.up || autoGas;

        if (isGas && !isBraking) {
          p.speed = Math.min(p.speed + carDef.acceleration * delta * worldDef.grip, carDef.topSpeed);
        } else if (isBraking) {
          p.speed = Math.max(p.speed - 95 * delta, 0);
          tailLightMatL.color.setHex(0xdc2626);
          tailLightMatR.color.setHex(0xdc2626);
        } else {
          p.speed = Math.max(p.speed - 16 * delta, 0);
          tailLightMatL.color.setHex(0xf59e0b);
          tailLightMatR.color.setHex(0xf59e0b);
        }

        if (p.speed > p.topSpeedRecorded) {
          p.topSpeedRecorded = Math.round(p.speed);
        }

        // Steering & Drift
        let steerInput = 0;
        if (keys.current.left) steerInput -= 1;
        if (keys.current.right) steerInput += 1;
        if (touchSteer.current !== 0) steerInput = touchSteer.current;

        const isHandbrake = keys.current.handbrake;
        if (isHandbrake && p.speed > 40) {
          p.isDrifting = true;
          p.driftPoints += Math.round(p.speed * delta);
          sound.playRallyDrift();
        } else {
          p.isDrifting = false;
        }

        const lateralSpeed = steerInput * (p.speed / 18) * carDef.handling;
        p.carX += lateralSpeed * delta;
        p.carX = THREE.MathUtils.clamp(p.carX, -8.5, 8.5);

        // Distance & Speed
        const speedMps = p.speed / 3.6;
        p.distance += speedMps * delta;

        // RPM calculation based on speed & gear
        const speedRatio = p.speed / carDef.topSpeed;
        const currentRpm = Math.round(1000 + speedRatio * (carDef.maxRpm - 1000));
        setRpmVal(currentRpm);

        // Gear calculation
        let gear = '1';
        if (p.speed > 160) gear = '6';
        else if (p.speed > 125) gear = '5';
        else if (p.speed > 90) gear = '4';
        else if (p.speed > 60) gear = '3';
        else if (p.speed > 30) gear = '2';
        setGearLabel(gear);

        // Modulate audio engine pitch if available
        if (engineAudioRef.current && !isMuted) {
          engineAudioRef.current.playbackRate = 0.7 + (currentRpm / carDef.maxRpm) * 0.9;
        }

        setSpeedKmh(Math.round(p.speed));
        setScore((prev) => prev + Math.round(speedMps * delta * 4) + (p.isDrifting ? 12 : 0));
        setLapProgress(Math.min(100, Math.round((p.distance / worldDef.trackLength) * 100)));

        // Checkpoint gate detection
        const distToGate = p.nextCheckpointDist - p.distance;
        if (distToGate <= 4 && distToGate >= -10) {
          p.nextCheckpointDist += 450;
          p.timeRemaining += 20;
          sound.playRallyCheckpoint();
          setBonusMessage('+20s BONUS!');
          setTimeout(() => setBonusMessage(null), 2500);
          gateGroup.position.z = p.nextCheckpointDist - p.distance;
        } else {
          gateGroup.position.z = p.nextCheckpointDist - p.distance;
        }

        // AI Rival Racing in DUEL MODE
        if (gameMode === 'duel') {
          // AI drives dynamically (110 - 180 km/h)
          const targetRivalSpeed = carDef.topSpeed * 0.92;
          p.rivalSpeed = targetRivalSpeed + Math.sin(currTime * 0.002) * 15;
          p.rivalDist += (p.rivalSpeed / 3.6) * delta;

          const relativeRivalZ = p.rivalDist - p.distance;
          rivalGroup.position.z = relativeRivalZ;
          rivalGroup.position.x = p.rivalX + Math.sin(currTime * 0.001) * 1.5;

          // Duel position indicator
          const diff = Math.round(p.distance - p.rivalDist);
          setDuelDistanceDiff(Math.abs(diff));
          setDuelStatus(diff >= 0 ? '1ST' : '2ND');
        }

        // Car Visual Roll & Pitch
        p.carHeading = -steerInput * 0.18 + (p.isDrifting ? -steerInput * 0.3 : 0);
        p.carRoll = steerInput * 0.08;
        p.carPitch = isGas ? -0.04 : isBraking ? 0.06 : 0;

        carGroup.position.x = p.carX;
        carGroup.position.y = p.carY;
        carGroup.rotation.y = p.carHeading;
        carGroup.rotation.z = p.carRoll;
        carGroup.rotation.x = p.carPitch;

        // Wheel Rotation & Steering
        const rotDelta = speedMps * delta * 5;
        frontWheelL.rotation.x += rotDelta;
        frontWheelR.rotation.x += rotDelta;
        rearWheelL.rotation.x += rotDelta;
        rearWheelR.rotation.x += rotDelta;
        frontWheelL.rotation.y = steerInput * 0.35;
        frontWheelR.rotation.y = steerInput * 0.35;

        // Camera Follow with FOV expansion at high speeds
        const targetCamX = p.carX * 0.65;
        camera.position.x += (targetCamX - camera.position.x) * 0.1;
        camera.position.y = 3.2 + p.carY * 0.5 + (p.shake > 0 ? (Math.random() - 0.5) * p.shake : 0);
        camera.fov = 64 + (p.speed / carDef.topSpeed) * 14;
        camera.updateProjectionMatrix();

        p.shake = Math.max(0, p.shake - delta * 0.6);

        // Infinite Looping Road Segments
        segments.forEach((seg) => {
          seg.z -= speedMps * delta;
          if (seg.z < -20) {
            seg.z += SEGMENT_COUNT * SEGMENT_LEN;
          }
          seg.group.position.z = seg.z;
        });

        // Weather particle animation
        const positions = partGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < PART_COUNT * 3; i += 3) {
          positions[i + 2] -= (speedMps + 20) * delta;
          if (positions[i + 2] < -30) {
            positions[i + 2] = 50;
            positions[i] = (Math.random() - 0.5) * 35;
          }
        }
        partGeo.attributes.position.needsUpdate = true;
      } else if (gameState === 'menu') {
        // Rotating 3D Car Showcase on Main Menu
        carGroup.position.set(0, 0, 0);
        carGroup.rotation.y += delta * 0.75;
        camera.position.set(0, 2.3, -6.2);
        camera.lookAt(0, 0.8, 0);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 360;
      const nh = container.clientHeight || 640;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [gameState, gameMode, selectedCarIdx, selectedWorldIdx, autoGas]);

  // Handle Race Finish
  const handleFinishRace = useCallback(
    (reason: 'VICTORY' | 'DEFEAT' | 'TIME_UP') => {
      setGameState('summary');
      const p = physics.current;
      const car = CARS[selectedCarIdx];
      const world = WORLDS[selectedWorldIdx];
      const formatted = formatRaceTime(p.elapsedMs);

      const isWin = reason === 'VICTORY';
      setSummaryData({
        title: isWin ? 'VICTORY! 🏆' : reason === 'DEFEAT' ? 'DEFEAT (2nd Place)' : 'TIME EXPIRED',
        isWinner: isWin,
        score,
        timeFormatted: formatted,
        topSpeed: p.topSpeedRecorded,
        duelWins,
        carName: car.name,
        worldName: world.name,
      });

      // Check if qualifies for New Record
      const topScore = worldRecord?.score || 18500;
      if (score > topScore) {
        setIsNewRecordModal(true);
        confetti({ particleCount: 150, spread: 90 });
      }
    },
    [score, selectedCarIdx, selectedWorldIdx, duelWins, worldRecord]
  );

  // Start Race Countdown
  const startRaceCountdown = () => {
    setGameState('countdown');
    setCountdownBeepNum(3);
    sound.playCountdownBeep(false);

    setTimeout(() => {
      setCountdownBeepNum(2);
      sound.playCountdownBeep(false);
    }, 1000);

    setTimeout(() => {
      setCountdownBeepNum(1);
      sound.playCountdownBeep(false);
    }, 2000);

    setTimeout(() => {
      setCountdownBeepNum('GO!');
      sound.playCountdownBeep(true);

      const p = physics.current;
      p.speed = 0;
      p.carX = 0;
      p.carY = 0;
      p.velocityY = 0;
      p.isAirborne = false;
      p.distance = 0;
      p.timeRemaining = 45.0;
      p.startTime = performance.now();
      p.nitroFuel = 100;
      p.topSpeedRecorded = 0;
      p.nextCheckpointDist = 400;
      p.rivalDist = 15;
      p.isFinished = false;

      setScore(0);
      setTimeRemaining(45.0);
      setNitroFuel(100);
      setSpeedKmh(0);
      setGameState('racing');
    }, 3000);
  };

  // Submit High Score (CRUD: Create)
  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const validation = validatePlayerName(playerNameInput);
    if (!validation.isValid) {
      setNameError(validation.error || 'Name must be 2 to 15 characters');
      return;
    }

    setIsSavingScore(true);
    setNameError(null);

    const res = await createScore({
      name: playerNameInput,
      score: summaryData.score,
      stage: summaryData.worldName,
      timeFormatted: summaryData.timeFormatted,
      topSpeed: summaryData.topSpeed,
    });

    setIsSavingScore(false);
    if (res.success) {
      setIsNewRecordModal(false);
      setGameState('leaderboard');
    } else {
      setNameError(res.error || 'Failed to save score');
    }
  };

  // Admin Update Record Name (CRUD: Update)
  const handleUpdateRecord = async (id: string) => {
    if (!editNameText.trim()) return;
    const validation = validatePlayerName(editNameText);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    await updateRecordHolder(id, editNameText);
    setEditingScoreId(null);
    setEditNameText('');
  };

  // Admin Delete Record (CRUD: Delete)
  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Delete this record entry?')) {
      await deleteScore(id);
    }
  };

  // Admin Key Unlock
  const handleVerifyAdminKey = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adminKeyInput.trim() === 'admin123' || adminKeyInput.trim() === 'pullingal') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminKeyInput('');
    } else {
      alert('Invalid admin passcode. Try: admin123');
    }
  };

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden font-sans text-white bg-slate-950"
      style={{ overscrollBehavior: 'contain' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP CONTROLS: Home Exit & Audio Toggles */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
        {onGoHome && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGoHome();
            }}
            className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/90 hover:text-white shadow-lg active:scale-95 transition-transform"
            title="Exit to Phone Home"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Background Music Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMusicPlaying(!isMusicPlaying);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md border shadow-lg active:scale-95 transition-transform ${
              isMusicPlaying
                ? 'bg-indigo-600/80 border-indigo-400 text-indigo-200'
                : 'bg-slate-900/80 border-white/10 text-slate-400'
            }`}
            title="Toggle Music"
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Master Mute Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = !isMuted;
              setIsMuted(next);
              sound.setMute(next);
            }}
            className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/90 hover:text-white shadow-lg active:scale-95 transition-transform"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RACING HUD (Digital Speedometer, Tachometer, Nitro & Duel indicator)   */}
      {/* ========================================================================= */}
      {gameState === 'racing' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5">
          {/* Top Bar: Digital Speedometer & Duel Position */}
          <div>
            <div className="flex items-center justify-between pt-10">
              {/* Speedometer & Gear */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-xl">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-black text-xl tracking-wider text-cyan-300">
                  {speedKmh} <span className="text-[10px] text-slate-400">KM/H</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                  G:{gearLabel}
                </span>
              </div>

              {/* DUEL Mode: 1ST vs 2ND place badge */}
              {gameMode === 'duel' && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-xl ${
                    duelStatus === '1ST'
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                      : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span className="font-black text-sm tracking-widest">{duelStatus}</span>
                  <span className="text-[10px] font-mono text-slate-300">({duelDistanceDiff}m)</span>
                </div>
              )}

              {/* Countdown Timer */}
              {gameMode !== 'freeroam' && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-xl ${
                    timeRemaining < 10
                      ? 'bg-rose-950/70 border-rose-500/60 text-rose-400 animate-pulse'
                      : 'bg-slate-950/80 border-white/10 text-emerald-400'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span className="font-mono font-black text-base">{Math.max(0, timeRemaining).toFixed(1)}s</span>
                </div>
              )}
            </div>

            {/* RPM Tachometer Bar & Nitro Bar */}
            <div className="mt-2 space-y-1.5">
              {/* RPM Bar */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>RPM: {rpmVal}</span>
                <div className="flex-1 bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-75 ${
                      rpmVal > CARS[selectedCarIdx].maxRpm * 0.85
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-cyan-400 to-amber-400'
                    }`}
                    style={{ width: `${(rpmVal / CARS[selectedCarIdx].maxRpm) * 100}%` }}
                  />
                </div>
              </div>

              {/* NITRO Tank Bar */}
              <div className="flex items-center gap-2 text-[10px] text-cyan-300 font-mono">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  NITRO: {nitroFuel}%
                </span>
                <div className="flex-1 bg-black/60 rounded-full h-2 overflow-hidden border border-cyan-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{ width: `${nitroFuel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BONUS FLASH NOTIFICATION */}
          {bonusMessage && (
            <div className="self-center animate-bounce flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm tracking-widest shadow-2xl border-2 border-cyan-300">
              <Zap className="w-5 h-5 fill-current" />
              <span>{bonusMessage}</span>
            </div>
          )}

          {/* BOTTOM ON-SCREEN CONTROLS */}
          <div className="space-y-2 pointer-events-auto">
            {/* Track Progress Bar */}
            <div className="w-full bg-black/60 backdrop-blur-md rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-150"
                style={{ width: `${lapProgress}%` }}
              />
            </div>

            {/* Mobile Controls: Left/Right Steer + NITRO + JUMP */}
            <div className="flex items-center justify-between pt-1">
              {/* Steer Left */}
              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  touchSteer.current = -1;
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  touchSteer.current = 0;
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  touchSteer.current = -1;
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  touchSteer.current = 0;
                }}
                className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/40 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* Action Buttons: NITRO + JUMP + Auto Gas */}
              <div className="flex items-center gap-2">
                {/* JUMP Button (RallyGame JUMP_FORCE) */}
                <button
                  type="button"
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    touchJump.current = true;
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    touchJump.current = false;
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    touchJump.current = true;
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    touchJump.current = false;
                  }}
                  className="px-3.5 py-3 rounded-2xl bg-emerald-600/70 hover:bg-emerald-600 active:bg-emerald-500 backdrop-blur-lg border border-emerald-400/50 flex flex-col items-center gap-0.5 text-[10px] font-black tracking-wider text-white shadow-xl active:scale-95 transition-transform"
                >
                  <Zap className="w-4 h-4 fill-current text-emerald-300" />
                  JUMP
                </button>

                {/* NITRO BOOST Button */}
                <button
                  type="button"
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    touchNitro.current = true;
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    touchNitro.current = false;
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    touchNitro.current = true;
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    touchNitro.current = false;
                  }}
                  className={`px-4 py-3 rounded-2xl border backdrop-blur-lg flex flex-col items-center gap-0.5 text-[10px] font-black tracking-wider shadow-xl active:scale-95 transition-transform ${
                    nitroFuel > 10
                      ? 'bg-cyan-600/80 hover:bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-800/60 border-white/10 text-slate-500'
                  }`}
                >
                  <Flame className="w-4 h-4 fill-current text-cyan-300" />
                  NITRO
                </button>

                {/* Handbrake Drift */}
                <button
                  type="button"
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    keys.current.handbrake = true;
                    touchBrake.current = true;
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    keys.current.handbrake = false;
                    touchBrake.current = false;
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    keys.current.handbrake = true;
                    touchBrake.current = true;
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    keys.current.handbrake = false;
                    touchBrake.current = false;
                  }}
                  className="px-3.5 py-3 rounded-2xl bg-rose-600/70 hover:bg-rose-600 active:bg-rose-500 backdrop-blur-lg border border-rose-400/50 flex flex-col items-center gap-0.5 text-[10px] font-black tracking-wider text-white shadow-xl active:scale-95 transition-transform"
                >
                  <Sliders className="w-4 h-4 text-rose-300" />
                  DRIFT
                </button>

                {/* Auto Gas Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAutoGas(!autoGas);
                  }}
                  className={`px-2 py-3 rounded-2xl border backdrop-blur-lg flex flex-col items-center justify-center text-[9px] font-bold tracking-tight shadow-xl active:scale-95 transition-all ${
                    autoGas
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                      : 'bg-white/10 border-white/20 text-slate-400'
                  }`}
                  title="Toggle Auto Acceleration"
                >
                  GAS
                  <span className="text-[8px] font-black">{autoGas ? 'AUTO' : 'MANUAL'}</span>
                </button>
              </div>

              {/* Steer Right */}
              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  touchSteer.current = 1;
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  touchSteer.current = 0;
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  touchSteer.current = 1;
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  touchSteer.current = 0;
                }}
                className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/40 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COUNTDOWN OVERLAY                                                     */}
      {/* ========================================================================= */}
      {gameState === 'countdown' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
          <div className="font-mono font-black text-8xl text-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.8)] animate-pulse">
            {countdownBeepNum}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN MENU (Car Garage, World Selection, Modes, World Record)          */}
      {/* ========================================================================= */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80 backdrop-blur-[2px] overflow-y-auto">
          {/* Header */}
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[11px] font-semibold text-cyan-300 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              RallyGame • 3D Ray Physics
            </div>
            <h1 className="font-black text-3xl tracking-tight bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              RALLY GAME
            </h1>
            <p className="text-xs text-slate-300">Duel Racing • Stunt Jumps • Nitro Boost</p>
          </div>

          {/* WORLD RECORD BADGE */}
          <div className="self-center px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-amber-500/30 shadow-xl flex items-center gap-2.5 my-1">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-left text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">World Record</div>
              <div className="font-bold text-amber-300">
                {worldRecord ? `${worldRecord.name} — ${worldRecord.score.toLocaleString()} pts` : 'S. Pullingal — 18,500 pts'}
              </div>
            </div>
          </div>

          {/* CAR & TRACK SELECTORS */}
          <div className="space-y-2.5">
            {/* Mode Tabs: Duel / Time Trial / Free Roam */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setGameMode('duel')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'duel' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                1v1 Duel
              </button>
              <button
                type="button"
                onClick={() => setGameMode('timetrial')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'timetrial' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Time Trial
              </button>
              <button
                type="button"
                onClick={() => setGameMode('freeroam')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameMode === 'freeroam' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Free Roam
              </button>
            </div>

            {/* Car Carousel Selector */}
            <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Select Car ({selectedCarIdx + 1}/{CARS.length})</span>
                <span className="text-[11px] text-cyan-400 uppercase">{CARS[selectedCarIdx].category}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCarIdx((prev) => (prev > 0 ? prev - 1 : CARS.length - 1))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center flex-1">
                  <div className="font-bold text-sm text-white">{CARS[selectedCarIdx].name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{CARS[selectedCarIdx].description}</div>
                  {/* Car Telemetry summary */}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-300 mt-1">
                    <span>⚡ {CARS[selectedCarIdx].topSpeed} KM/H</span>
                    <span>🔥 Nitro: {CARS[selectedCarIdx].nitroPower}</span>
                    <span>🏎️ {CARS[selectedCarIdx].maxRpm} RPM</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCarIdx((prev) => (prev < CARS.length - 1 ? prev + 1 : 0))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* World / Track Selector */}
            <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  Select Track
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  {selectedWorldIdx + 1} / {WORLDS.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorldIdx((prev) => (prev > 0 ? prev - 1 : WORLDS.length - 1))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center flex-1">
                  <div className="font-bold text-sm text-white">{WORLDS[selectedWorldIdx].name}</div>
                  <div className="text-[11px] text-slate-400">{WORLDS[selectedWorldIdx].subtitle}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedWorldIdx((prev) => (prev < WORLDS.length - 1 ? prev + 1 : 0))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={startRaceCountdown}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 hover:opacity-95 active:scale-[0.98] font-black text-sm tracking-wider text-slate-950 shadow-2xl flex items-center justify-center gap-2 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                START {gameMode.toUpperCase()}
              </button>

              <button
                type="button"
                onClick={() => setGameState('leaderboard')}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-xs font-bold text-white border border-white/15 flex items-center justify-center gap-2 transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Global High Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUMMARY SCREEN                                                        */}
      {/* ========================================================================= */}
      {gameState === 'summary' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
          <div className="text-center pt-5">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                summaryData.isWinner
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {summaryData.title}
            </div>
            <h2 className="text-2xl font-black text-white">{summaryData.worldName}</h2>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3">
            <div className="text-center pb-2 border-b border-white/10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Final Score</div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {summaryData.score.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">TIME</div>
                <div className="font-mono font-bold text-white text-sm">{summaryData.timeFormatted}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">TOP SPEED</div>
                <div className="font-mono font-bold text-white text-sm">{summaryData.topSpeed} KM/H</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">CAR</div>
                <div className="font-bold text-cyan-400 text-xs truncate">{summaryData.carName}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">DUEL WINS</div>
                <div className="font-bold text-amber-400 text-sm">🏆 {summaryData.duelWins}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewRecordModal(true)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Trophy className="w-4 h-4 fill-current" />
              SAVE RECORD TO LEADERBOARD
            </button>

            <button
              type="button"
              onClick={startRaceCountdown}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              RACE AGAIN
            </button>

            <button
              type="button"
              onClick={() => setGameState('menu')}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
            >
              Back to Main Menu
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. NEW RECORD MODAL (Firestore 2-15 chars validation)                    */}
      {/* ========================================================================= */}
      {isNewRecordModal && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Trophy className="w-6 h-6 fill-current" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">NEW RECORD!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Score: <span className="text-amber-400 font-bold">{summaryData.score.toLocaleString()}</span>
              </p>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-3">
              <div className="text-left">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Player Name (2–15 chars)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="e.g. Rally Master"
                  onFocus={(e) => e.target.focus({ preventScroll: true })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
                {nameError && <div className="text-rose-400 text-xs mt-1">{nameError}</div>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingScore}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black shadow-lg"
                >
                  {isSavingScore ? 'Saving...' : 'Submit Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LEADERBOARD & ADMIN CRUD                                              */}
      {/* ========================================================================= */}
      {gameState === 'leaderboard' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-slate-950/98 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setGameState('menu')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Menu
            </button>

            <div className="text-center">
              <h2 className="text-sm font-black text-amber-400 tracking-wider uppercase">Hall of Fame</h2>
              <div className="text-[10px] text-slate-400">Firebase Firestore • Live Sync</div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className={`p-1.5 rounded-lg border transition-all ${
                isAdminMode
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Admin CRUD Mode"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>

          {showAdminLogin && !isAdminMode && (
            <form
              onSubmit={handleVerifyAdminKey}
              className="my-2 p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center gap-2"
            >
              <input
                type="password"
                placeholder="Admin Passcode (admin123)"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                onFocus={(e) => e.target.focus({ preventScroll: true })}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 text-xs border border-white/20 text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Unlock
              </button>
            </form>
          )}

          {isAdminMode && (
            <div className="my-1 text-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 py-1 rounded-lg">
              🛡️ Admin Mode Active: You can Edit or Delete score entries
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
            {leaderboard.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading high scores...</div>
            ) : (
              leaderboard.map((item, idx) => {
                const isEditing = editingScoreId === item.id;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              maxLength={15}
                              value={editNameText}
                              onChange={(e) => setEditNameText(e.target.value)}
                              onFocus={(e) => e.target.focus({ preventScroll: true })}
                              className="px-1.5 py-0.5 rounded bg-slate-950 text-white text-xs border border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateRecord(item.id)}
                              className="p-1 text-emerald-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingScoreId(null)}
                              className="p-1 text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-white truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {item.stage} • {item.date}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono font-black text-amber-400 text-sm">
                          {item.score.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.timeFormatted}</div>
                      </div>

                      {isAdminMode && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingScoreId(item.id);
                              setEditNameText(item.name);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-400"
                            title="Edit Name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={startRaceCountdown}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs tracking-wider shadow-xl flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              PLAY NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RallyGameApp;
