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

interface Rally3DAppProps {
  isTablet?: boolean;
  onGoHome?: () => void;
}

// 4 Classic Dynamic Track Environments
export interface StageConfig {
  id: string;
  name: string;
  subtitle: string;
  skyColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  groundColor: number;
  roadColor: number;
  curbColor1: number;
  curbColor2: number;
  trackLength: number;
  gripFactor: number;
  timeBonus: number;
  lightColor: number;
  lightIntensity: number;
  weatherType: 'dust' | 'snow' | 'sand' | 'sparks';
}

const STAGES: StageConfig[] = [
  {
    id: 'forest',
    name: 'Forest Dirt Trail',
    subtitle: 'Classic Finland Gravel',
    skyColor: 0x60a5fa, // Rich blue Nokia sky
    fogColor: 0x93c5fd,
    fogNear: 120,
    fogFar: 460,
    groundColor: 0x2e6f40, // Forest grass
    roadColor: 0x6e4726, // Dirt gravel road
    curbColor1: 0xd97706,
    curbColor2: 0xfef3c7,
    trackLength: 2600,
    gripFactor: 1.0,
    timeBonus: 20,
    lightColor: 0xfffbeb,
    lightIntensity: 1.8,
    weatherType: 'dust',
  },
  {
    id: 'alpine',
    name: 'Alpine Snow & Ice',
    subtitle: 'Monte Carlo Ice Glaze',
    skyColor: 0x93c5fd,
    fogColor: 0xdbeafe,
    fogNear: 90,
    fogFar: 380,
    groundColor: 0xf1f5f9, // Crisp white snow
    roadColor: 0x94a3b8, // Ice coated road
    curbColor1: 0xdc2626,
    curbColor2: 0xffffff,
    trackLength: 2800,
    gripFactor: 0.78, // Slippery ice!
    timeBonus: 22,
    lightColor: 0xe0f2fe,
    lightIntensity: 2.0,
    weatherType: 'snow',
  },
  {
    id: 'desert',
    name: 'Desert Canyon',
    subtitle: 'Sahara Sun-Baked Gravel',
    skyColor: 0xf97316, // Golden sunset sky
    fogColor: 0xfdba74,
    fogNear: 110,
    fogFar: 420,
    groundColor: 0xc2410c, // Red canyon soil
    roadColor: 0x9a3412, // Dusty desert dirt
    curbColor1: 0xfacc15,
    curbColor2: 0x78350f,
    trackLength: 3000,
    gripFactor: 0.9,
    timeBonus: 20,
    lightColor: 0xffedd5,
    lightIntensity: 2.1,
    weatherType: 'sand',
  },
  {
    id: 'night',
    name: 'Night City / Asphalt',
    subtitle: 'Tokyo Expressway Midnight',
    skyColor: 0x020617, // Midnight black
    fogColor: 0x0f172a,
    fogNear: 80,
    fogFar: 340,
    groundColor: 0x0f172a,
    roadColor: 0x1e293b, // Smooth dark asphalt
    curbColor1: 0x06b6d4, // Glowing neon cyan
    curbColor2: 0xd946ef, // Glowing neon magenta
    trackLength: 3200,
    gripFactor: 1.08, // Maximum asphalt grip
    timeBonus: 18,
    lightColor: 0x38bdf8,
    lightIntensity: 1.2,
    weatherType: 'sparks',
  },
];

// Track turn curve definition
interface TrackCurve {
  startDist: number;
  endDist: number;
  curvature: number; // -1 sharp left, 1 sharp right
  warningDist: number;
  type: 'EASY LEFT' | 'EASY RIGHT' | 'HAIRPIN LEFT' | 'HAIRPIN RIGHT' | 'S-BEND';
}

const TRACK_CURVES: TrackCurve[] = [
  { startDist: 200, endDist: 420, curvature: -0.45, warningDist: 140, type: 'EASY LEFT' },
  { startDist: 540, endDist: 800, curvature: 0.85, warningDist: 460, type: 'HAIRPIN RIGHT' },
  { startDist: 920, endDist: 1180, curvature: -0.85, warningDist: 840, type: 'HAIRPIN LEFT' },
  { startDist: 1300, endDist: 1550, curvature: 0.5, warningDist: 1220, type: 'EASY RIGHT' },
  { startDist: 1700, endDist: 2000, curvature: -0.65, warningDist: 1620, type: 'S-BEND' },
  { startDist: 2150, endDist: 2450, curvature: 0.9, warningDist: 2050, type: 'HAIRPIN RIGHT' },
];

export const Rally3DApp: React.FC<Rally3DAppProps> = ({ isTablet: _isTablet = false, onGoHome }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'racing' | 'summary' | 'leaderboard'>('menu');
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [selectedLivery, setSelectedLivery] = useState<'white_wrc' | 'classic_red'>('white_wrc');

  // Racing HUD telemetry
  const [speedKmh, setSpeedKmh] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState(45.0); // Seconds:Tenths
  const [score, setScore] = useState(0);
  const [paceNote, setPaceNote] = useState<{ text: string; icon: string; isSharp: boolean } | null>(null);
  const [bonusNotification, setBonusNotification] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [autoGas, setAutoGas] = useState(true);
  const [lapProgress, setLapProgress] = useState(0);

  // Firestore Highscores
  const [leaderboard, setLeaderboard] = useState<RallyHighScore[]>([]);
  const [worldRecord, setWorldRecord] = useState<RallyHighScore | null>(null);
  const [isNewRecordModal, setIsNewRecordModal] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Admin Leaderboard CRUD
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  // Race results summary
  const [summaryStats, setSummaryStats] = useState({
    reason: 'FINISH',
    score: 0,
    timeFormatted: '00:00:0',
    timeMs: 0,
    topSpeed: 0,
    checkpointsCleared: 0,
    rivalsOvertaken: 0,
    driftsCount: 0,
    stageName: 'Forest Dirt Trail',
  });

  // Countdown state before green light
  const [countdownBeepNum, setCountdownBeepNum] = useState<number | string>(3);

  // Keyboard controls ref
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // Touch control states
  const touchSteer = useRef<number>(0); // -1 = full left, 1 = full right
  const touchBrake = useRef<boolean>(false);

  // Real-time Physics Engine State
  const physics = useRef({
    speed: 0, // km/h (0 to 185)
    maxSpeed: 182,
    carX: 0, // Lateral position on track (-1.8 to 1.8)
    carHeading: 0, // Car rotation
    carRoll: 0,
    carPitch: 0,
    distance: 0, // Metres traveled along track
    timeRemaining: 45.0, // Checkpoint countdown
    elapsedMs: 0,
    startTime: 0,
    isDrifting: false,
    driftPoints: 0,
    topSpeedRecorded: 0,
    checkpointsPassed: 0,
    nextCheckpointDist: 400,
    rivalsOvertaken: 0,
    overtakenIds: new Set<number>(),
    shakeAmount: 0,
    totalDistance: 2600,
    lastPaceNoteDist: -1,
    isFinished: false,
  });

  // Subscribe to real-time Firestore high scores
  useEffect(() => {
    const unsub = subscribeToLeaderboard((scores) => {
      setLeaderboard(scores);
      if (scores.length > 0) {
        setWorldRecord(scores[0]);
      }
    });
    return () => unsub();
  }, []);

  // Format seconds to classic Nokia Rally 3D timer: "SS:T" e.g. "14:3" or "09:8"
  const formatNokiaTimer = (seconds: number) => {
    const clamped = Math.max(0, seconds);
    const s = Math.floor(clamped);
    const t = Math.floor((clamped - s) * 10);
    return `${s < 10 ? '0' : ''}${s}:${t}`;
  };

  // Format milliseconds to MM:SS:T
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
      // Isolate outer viewport from arrow key / space scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.current.up = true;
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.current.down = true;
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
      if (e.code === 'Space') keys.current.handbrake = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.stopPropagation();
      }

      if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.current.up = false;
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.current.down = false;
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
      if (e.code === 'Space') keys.current.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Three.js Game Engine Lifecycle
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const stage = STAGES[selectedStageIdx];

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(stage.skyColor);
    scene.fog = new THREE.Fog(stage.fogColor, stage.fogNear, stage.fogFar);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, -7.5);
    camera.lookAt(0, 1.2, 5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(stage.lightColor, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(stage.lightColor, stage.lightIntensity);
    sunLight.position.set(30, 60, -40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    // 3. Build Iconic Nokia Rally 3D WRC Car
    const carGroup = new THREE.Group();

    // Livery Colors:
    // White WRC: White body with Nokia Castrol Red and Green racing decals
    // Classic Red: Nokia Rally 3D red car with white lower trim
    const isWRC = selectedLivery === 'white_wrc';
    const mainBodyHex = isWRC ? 0xf8fafc : 0xdc2626;
    const accentGreenHex = 0x16a34a; // Nokia Castrol Green
    const accentRedHex = 0xdc2626; // Nokia Castrol Red
    const lowerSkirtHex = isWRC ? 0x0f172a : 0xf1f5f9;

    // Car Body Material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainBodyHex,
      metalness: 0.25,
      roughness: 0.2,
    });

    // Lower Chassis / Bumper
    const lowerBodyGeo = new THREE.BoxGeometry(1.68, 0.44, 3.4);
    const lowerBodyMat = new THREE.MeshStandardMaterial({
      color: lowerSkirtHex,
      metalness: 0.1,
      roughness: 0.5,
    });
    const lowerBody = new THREE.Mesh(lowerBodyGeo, lowerBodyMat);
    lowerBody.position.y = 0.38;
    lowerBody.castShadow = true;
    carGroup.add(lowerBody);

    // Main Mid Body
    const midBodyGeo = new THREE.BoxGeometry(1.64, 0.42, 3.25);
    const midBody = new THREE.Mesh(midBodyGeo, bodyMat);
    midBody.position.y = 0.68;
    midBody.castShadow = true;
    carGroup.add(midBody);

    // Upper Cabin (Cockpit)
    const cabinGeo = new THREE.BoxGeometry(1.36, 0.48, 1.85);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 1.05, -0.15);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // WRC Castrol Livery Racing Stripes (Roof & Hood decals)
    if (isWRC) {
      // Red Center Stripe
      const redStripeGeo = new THREE.BoxGeometry(0.24, 0.02, 3.2);
      const redStripeMat = new THREE.MeshStandardMaterial({ color: accentRedHex, roughness: 0.3 });
      const redStripe = new THREE.Mesh(redStripeGeo, redStripeMat);
      redStripe.position.set(-0.16, 0.9, 0.05);
      carGroup.add(redStripe);

      // Green Side Stripe
      const greenStripeGeo = new THREE.BoxGeometry(0.24, 0.02, 3.2);
      const greenStripeMat = new THREE.MeshStandardMaterial({ color: accentGreenHex, roughness: 0.3 });
      const greenStripe = new THREE.Mesh(greenStripeGeo, greenStripeMat);
      greenStripe.position.set(0.16, 0.9, 0.05);
      carGroup.add(greenStripe);

      // Number "1" Door Plates (Classic Nokia #1)
      const numPlateGeo = new THREE.BoxGeometry(0.04, 0.28, 0.45);
      const numPlateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const plateL = new THREE.Mesh(numPlateGeo, numPlateMat);
      plateL.position.set(-0.84, 0.68, 0);
      const plateR = new THREE.Mesh(numPlateGeo, numPlateMat);
      plateR.position.set(0.84, 0.68, 0);
      carGroup.add(plateL);
      carGroup.add(plateR);
    }

    // Windows & Windshield Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
    });

    const frontWindshieldGeo = new THREE.PlaneGeometry(1.28, 0.52);
    const frontWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
    frontWindshield.rotation.x = Math.PI / 4.2;
    frontWindshield.position.set(0, 1.05, 0.84);
    carGroup.add(frontWindshield);

    const rearGlassGeo = new THREE.PlaneGeometry(1.25, 0.46);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.rotation.x = -Math.PI / 4.5;
    rearGlass.rotation.y = Math.PI;
    rearGlass.position.set(0, 1.05, -1.14);
    carGroup.add(rearGlass);

    // Roof Air Scoop (Signature WRC Rally detail)
    const scoopGeo = new THREE.BoxGeometry(0.35, 0.12, 0.45);
    const scoopMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
    const roofScoop = new THREE.Mesh(scoopGeo, scoopMat);
    roofScoop.position.set(0, 1.34, 0.3);
    carGroup.add(roofScoop);

    // Iconic Elevated WRC Rally Wing / Spoiler
    const spoilerMat = new THREE.MeshStandardMaterial({
      color: isWRC ? accentRedHex : 0xffffff,
      roughness: 0.3,
    });
    const spoilerWingGeo = new THREE.BoxGeometry(1.55, 0.08, 0.32);
    const spoilerWing = new THREE.Mesh(spoilerWingGeo, spoilerMat);
    spoilerWing.position.set(0, 1.28, -1.55);
    carGroup.add(spoilerWing);

    const spoilerLegGeo = new THREE.BoxGeometry(0.08, 0.28, 0.14);
    const spoilerLegL = new THREE.Mesh(spoilerLegGeo, bodyMat);
    spoilerLegL.position.set(-0.54, 1.08, -1.55);
    const spoilerLegR = new THREE.Mesh(spoilerLegGeo, bodyMat);
    spoilerLegR.position.set(0.54, 1.08, -1.55);
    carGroup.add(spoilerLegL);
    carGroup.add(spoilerLegR);

    // Front Quad Rally Fog Light Pod
    const fogPodGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    fogPodGeo.rotateX(Math.PI / 2);
    const fogPodMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.45, -0.15, 0.15, 0.45].forEach((xOffset) => {
      const fogLight = new THREE.Mesh(fogPodGeo, fogPodMat);
      fogLight.position.set(xOffset, 0.56, 1.68);
      carGroup.add(fogLight);
    });

    // Glowing Taillights & Dynamic Brake Lights
    const tailLightGeo = new THREE.BoxGeometry(0.38, 0.14, 0.04);
    const tailLightMatL = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Nokia Amber
    const tailLightMatR = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const tailLightL = new THREE.Mesh(tailLightGeo, tailLightMatL);
    tailLightL.position.set(-0.58, 0.62, -1.68);
    const tailLightR = new THREE.Mesh(tailLightGeo, tailLightMatR);
    tailLightR.position.set(0.58, 0.62, -1.68);
    carGroup.add(tailLightL);
    carGroup.add(tailLightR);

    // Front Headlight Spotlights for Night Stage
    if (stage.id === 'night') {
      const headlightBeamL = new THREE.SpotLight(0xffedd5, 3.5, 55, Math.PI / 6, 0.5);
      headlightBeamL.position.set(-0.5, 0.6, 1.6);
      headlightBeamL.target.position.set(-0.5, 0, 30);
      carGroup.add(headlightBeamL);
      carGroup.add(headlightBeamL.target);

      const headlightBeamR = new THREE.SpotLight(0xffedd5, 3.5, 55, Math.PI / 6, 0.5);
      headlightBeamR.position.set(0.5, 0.6, 1.6);
      headlightBeamR.target.position.set(0.5, 0, 30);
      carGroup.add(headlightBeamR);
      carGroup.add(headlightBeamR.target);
    }

    // 4 Wheels (Rubber rally tires with silver OZ-racing rims)
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.29, 8);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.8,
      roughness: 0.2,
    });

    const createWheelMesh = () => {
      const g = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, rimMat);
      g.add(tire);
      g.add(rim);
      return g;
    };

    const frontWheelL = createWheelMesh();
    frontWheelL.position.set(-0.88, 0.36, 1.1);
    const frontWheelR = createWheelMesh();
    frontWheelR.position.set(0.88, 0.36, 1.1);
    const rearWheelL = createWheelMesh();
    rearWheelL.position.set(-0.88, 0.36, -1.1);
    const rearWheelR = createWheelMesh();
    rearWheelR.position.set(0.88, 0.36, -1.1);

    carGroup.add(frontWheelL);
    carGroup.add(frontWheelR);
    carGroup.add(rearWheelL);
    carGroup.add(rearWheelR);

    // Car Undercarriage Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.1, 3.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.04;
    carGroup.add(shadowMesh);

    scene.add(carGroup);

    // 4. Track Scenery: Distant Mountains, Road Segments, Guardrails, Trees & Arch
    // Distant Mountain Backdrop (Classic Nokia snow mountains)
    const mountainGroup = new THREE.Group();
    const mountainConeGeo = new THREE.ConeGeometry(60, 55, 4);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: stage.id === 'desert' ? 0x9a3412 : 0x334155,
      roughness: 0.9,
    });
    const snowCapGeo = new THREE.ConeGeometry(24, 22, 4);
    const snowCapMat = new THREE.MeshStandardMaterial({
      color: stage.id === 'desert' ? 0xfdba74 : 0xffffff,
      roughness: 0.6,
    });

    for (let i = -8; i <= 8; i++) {
      const m = new THREE.Mesh(mountainConeGeo, mountainMat);
      const s = new THREE.Mesh(snowCapGeo, snowCapMat);
      s.position.y = 20;
      m.add(s);
      m.position.set(i * 70 + (Math.sin(i) * 30), 25, 450 + (Math.cos(i) * 40));
      mountainGroup.add(m);
    }
    scene.add(mountainGroup);

    // Procedural Road Track Grid (Infinite Looping Segments)
    const ROAD_SEGMENTS_COUNT = 60;
    const SEGMENT_LENGTH = 16;
    const roadSegmentsGroup = new THREE.Group();

    const roadGeo = new THREE.PlaneGeometry(14, SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: stage.roadColor,
      roughness: 0.85,
    });

    const groundGeo = new THREE.PlaneGeometry(180, SEGMENT_LENGTH);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: stage.groundColor,
      roughness: 0.95,
    });

    // Curbs / Embankments
    const curbGeo = new THREE.BoxGeometry(0.8, 0.25, SEGMENT_LENGTH);
    const curbMat1 = new THREE.MeshStandardMaterial({ color: stage.curbColor1, roughness: 0.5 });
    const curbMat2 = new THREE.MeshStandardMaterial({ color: stage.curbColor2, roughness: 0.5 });

    interface RoadSegment {
      group: THREE.Group;
      zPos: number;
    }

    const segments: RoadSegment[] = [];

    for (let i = 0; i < ROAD_SEGMENTS_COUNT; i++) {
      const segGroup = new THREE.Group();
      const zPos = i * SEGMENT_LENGTH - 20;

      // Ground Plane (Terrain)
      const terrain = new THREE.Mesh(groundGeo, groundMat);
      terrain.position.y = -0.02;
      segGroup.add(terrain);

      // Road Surface
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.receiveShadow = true;
      segGroup.add(road);

      // Left Curb
      const curbL = new THREE.Mesh(curbGeo, i % 2 === 0 ? curbMat1 : curbMat2);
      curbL.position.set(-7.4, 0.12, 0);
      segGroup.add(curbL);

      // Right Curb
      const curbR = new THREE.Mesh(curbGeo, i % 2 === 0 ? curbMat2 : curbMat1);
      curbR.position.set(7.4, 0.12, 0);
      segGroup.add(curbR);

      segGroup.position.z = zPos;
      roadSegmentsGroup.add(segGroup);
      segments.push({ group: segGroup, zPos });
    }
    scene.add(roadSegmentsGroup);

    // Trackside Scenery Objects (Pine Trees, Cacti, Streetlights depending on stage)
    const sceneryGroup = new THREE.Group();
    const sceneryPool: THREE.Group[] = [];
    const SCENERY_COUNT = 45;

    const createSceneryObject = (stageId: string) => {
      const g = new THREE.Group();
      if (stageId === 'forest' || stageId === 'alpine') {
        // Pine Tree
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.8, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.4;
        trunk.castShadow = true;

        const needleGeo = new THREE.ConeGeometry(2.4, 6.2, 7);
        const needleMat = new THREE.MeshStandardMaterial({
          color: stageId === 'alpine' ? 0x064e3b : 0x14532d,
          roughness: 0.8,
        });
        const needles = new THREE.Mesh(needleGeo, needleMat);
        needles.position.y = 4.4;
        needles.castShadow = true;

        if (stageId === 'alpine') {
          // Add snow frosting
          const snowGeo = new THREE.ConeGeometry(1.4, 3.2, 7);
          const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
          const snowMesh = new THREE.Mesh(snowGeo, snowMat);
          snowMesh.position.y = 5.2;
          g.add(snowMesh);
        }

        g.add(trunk);
        g.add(needles);
      } else if (stageId === 'desert') {
        // Desert Cactus or Red Rock
        const rockGeo = new THREE.DodecahedronGeometry(2.8, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.95 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.y = 2.2;
        rock.scale.set(1, 1.6, 1);
        rock.castShadow = true;
        g.add(rock);
      } else {
        // Night City Streetlight
        const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 3.75;

        const lampArmGeo = new THREE.BoxGeometry(2.0, 0.12, 0.2);
        const arm = new THREE.Mesh(lampArmGeo, poleMat);
        arm.position.set(0.9, 7.2, 0);

        const glowBulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const glowBulbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const bulb = new THREE.Mesh(glowBulbGeo, glowBulbMat);
        bulb.position.set(1.8, 7.0, 0);

        g.add(pole);
        g.add(arm);
        g.add(bulb);
      }
      return g;
    };

    for (let i = 0; i < SCENERY_COUNT; i++) {
      const obj = createSceneryObject(stage.id);
      const isLeft = Math.random() > 0.5;
      const xPos = isLeft ? -(11 + Math.random() * 22) : 11 + Math.random() * 22;
      const zPos = 20 + i * 18;
      obj.position.set(xPos, 0, zPos);
      sceneryGroup.add(obj);
      sceneryPool.push(obj);
    }
    scene.add(sceneryGroup);

    // Glowing Nokia Checkpoint Arch
    const checkpointArchGroup = new THREE.Group();
    const pillarGeo = new THREE.BoxGeometry(0.8, 5.5, 0.8);
    const archBarGeo = new THREE.BoxGeometry(16.5, 0.9, 0.8);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5,
    });

    const pillarL = new THREE.Mesh(pillarGeo, archMat);
    pillarL.position.set(-8.2, 2.75, 0);
    const pillarR = new THREE.Mesh(pillarGeo, archMat);
    pillarR.position.set(8.2, 2.75, 0);
    const archBar = new THREE.Mesh(archBarGeo, archMat);
    archBar.position.set(0, 5.5, 0);

    checkpointArchGroup.add(pillarL);
    checkpointArchGroup.add(pillarR);
    checkpointArchGroup.add(archBar);

    checkpointArchGroup.position.set(0, 0, 400); // Initial checkpoint
    scene.add(checkpointArchGroup);

    // AI Rival Cars (2 AI rally cars to overtake on track!)
    interface RivalCar {
      mesh: THREE.Group;
      dist: number;
      speedKmh: number;
      xPos: number;
      laneTarget: number;
      id: number;
    }

    const rivals: RivalCar[] = [];
    const rivalColors = [0x2563eb, 0x16a34a]; // Blue and Green rival cars

    rivalColors.forEach((color, idx) => {
      const rGroup = new THREE.Group();
      const rBodyGeo = new THREE.BoxGeometry(1.65, 0.7, 3.3);
      const rBodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.3 });
      const rBody = new THREE.Mesh(rBodyGeo, rBodyMat);
      rBody.position.y = 0.6;
      rBody.castShadow = true;
      rGroup.add(rBody);

      // Cabin
      const rCabGeo = new THREE.BoxGeometry(1.3, 0.45, 1.8);
      const rCab = new THREE.Mesh(rCabGeo, rBodyMat);
      rCab.position.set(0, 1.0, -0.1);
      rGroup.add(rCab);

      // Taillights
      const rTailL = new THREE.Mesh(tailLightGeo, tailLightMatL);
      rTailL.position.set(-0.55, 0.6, -1.66);
      const rTailR = new THREE.Mesh(tailLightGeo, tailLightMatR);
      rTailR.position.set(0.55, 0.6, -1.66);
      rGroup.add(rTailL);
      rGroup.add(rTailR);

      // Wheels
      const w1 = createWheelMesh();
      w1.position.set(-0.88, 0.35, 1.0);
      const w2 = createWheelMesh();
      w2.position.set(0.88, 0.35, 1.0);
      const w3 = createWheelMesh();
      w3.position.set(-0.88, 0.35, -1.0);
      const w4 = createWheelMesh();
      w4.position.set(0.88, 0.35, -1.0);
      rGroup.add(w1);
      rGroup.add(w2);
      rGroup.add(w3);
      rGroup.add(w4);

      rGroup.position.set(idx === 0 ? -3.5 : 3.5, 0, 160 + idx * 280);
      scene.add(rGroup);

      rivals.push({
        mesh: rGroup,
        dist: 160 + idx * 280,
        speedKmh: 110 + idx * 15,
        xPos: idx === 0 ? -3.5 : 3.5,
        laneTarget: idx === 0 ? -3.5 : 3.5,
        id: idx + 1,
      });
    });

    // Particle Weather & Tire Drift Dust
    const PARTICLE_COUNT = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 40;
      particlePositions[i + 1] = Math.random() * 15;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: stage.weatherType === 'snow' ? 0xffffff : stage.weatherType === 'sand' ? 0xfdba74 : 0xd97706,
      size: stage.weatherType === 'snow' ? 0.45 : 0.25,
      transparent: true,
      opacity: 0.65,
    });
    const weatherParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(weatherParticles);

    // 5. Animation & Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.05); // Limit delta
      lastTime = currentTime;

      const p = physics.current;

      // When in racing state, run full arcade rally physics
      if (gameState === 'racing') {
        p.elapsedMs = performance.now() - p.startTime;

        // Check countdown timer
        p.timeRemaining -= delta;
        setCountdownTimer(p.timeRemaining);

        // Time Out Check (Arcade Game Over)
        if (p.timeRemaining <= 0 && !p.isFinished) {
          p.isFinished = true;
          sound.playRallyCrash();
          finishRace('TIME_UP');
          return;
        }

        // Stage Complete Check
        if (p.distance >= stage.trackLength && !p.isFinished) {
          p.isFinished = true;
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          finishRace('STAGE_CLEAR');
          return;
        }

        // Calculate Track Curvature at current distance
        let currentCurve = 0;
        let activePaceCurve: TrackCurve | null = null;

        for (const c of TRACK_CURVES) {
          if (p.distance >= c.startDist && p.distance <= c.endDist) {
            currentCurve = c.curvature;
          }
          // Co-driver turn warning (triggers ~80m before turn)
          if (p.distance >= c.warningDist && p.distance < c.startDist) {
            activePaceCurve = c;
          }
        }

        // Trigger Co-Driver Turn Warning beep and UI
        if (activePaceCurve && p.lastPaceNoteDist !== activePaceCurve.warningDist) {
          p.lastPaceNoteDist = activePaceCurve.warningDist;
          const isSharp = activePaceCurve.type.includes('HAIRPIN') || activePaceCurve.type.includes('S-BEND');
          const arrowIcon = activePaceCurve.curvature < 0 ? '⮘⮘' : '⮚⮚';
          setPaceNote({
            text: activePaceCurve.type,
            icon: arrowIcon,
            isSharp,
          });
          sound.playTurnWarning(isSharp);
          setTimeout(() => setPaceNote(null), 3000);
        }

        // Acceleration & Braking (Keyboard + Touch inputs)
        const isBraking = keys.current.down || touchBrake.current;
        const isHandbrake = keys.current.handbrake;
        const isGas = keys.current.up || autoGas;

        if (isGas && !isBraking) {
          p.speed = Math.min(p.speed + 42 * delta * stage.gripFactor, p.maxSpeed);
        } else if (isBraking) {
          p.speed = Math.max(p.speed - 90 * delta, 0);
          tailLightMatL.color.setHex(0xdc2626); // Bright red brake lights
          tailLightMatR.color.setHex(0xdc2626);
        } else {
          // Coasting friction
          p.speed = Math.max(p.speed - 15 * delta, 0);
          tailLightMatL.color.setHex(0xf59e0b); // Idle amber
          tailLightMatR.color.setHex(0xf59e0b);
        }

        if (p.speed > p.topSpeedRecorded) {
          p.topSpeedRecorded = Math.round(p.speed);
        }

        // Steering & Drift Physics
        let steerInput = 0;
        if (keys.current.left) steerInput -= 1;
        if (keys.current.right) steerInput += 1;
        if (touchSteer.current !== 0) steerInput = touchSteer.current;

        // Apply handbrake drift multiplier
        if (isHandbrake && p.speed > 40) {
          p.isDrifting = true;
          p.driftPoints += Math.round(p.speed * delta * 2);
          sound.playRallyDrift();
        } else if (Math.abs(steerInput) > 0.6 && p.speed > 80 && Math.abs(currentCurve) > 0.4) {
          p.isDrifting = true;
          p.driftPoints += Math.round(p.speed * delta);
        } else {
          p.isDrifting = false;
        }

        // Lateral track position update (with centrifugal road pull on turns!)
        const lateralSpeed = steerInput * (p.speed / 18) * stage.gripFactor;
        const centrifugalPull = currentCurve * (p.speed / 28);
        p.carX += (lateralSpeed - centrifugalPull) * delta;

        // Off-road penalty (if player slides off dirt road into verge)
        if (Math.abs(p.carX) > 6.4) {
          p.speed = Math.max(p.speed - 60 * delta, 30);
          p.shakeAmount = 0.15;
        } else {
          p.shakeAmount = Math.max(0, p.shakeAmount - delta * 0.5);
        }

        // Clamp lateral boundary
        p.carX = THREE.MathUtils.clamp(p.carX, -10, 10);

        // Distance advancement (speed km/h to m/s: km/h / 3.6)
        const speedMps = p.speed / 3.6;
        p.distance += speedMps * delta;

        // Score increment (distance + drift bonus)
        setScore((prev) => prev + Math.round(speedMps * delta * 4) + (p.isDrifting ? 15 : 0));
        setSpeedKmh(Math.round(p.speed));
        setLapProgress(Math.min(100, Math.round((p.distance / stage.trackLength) * 100)));

        // Checkpoint detection
        const distToCheckpoint = p.nextCheckpointDist - p.distance;
        if (distToCheckpoint <= 4 && distToCheckpoint >= -12) {
          // Crossed checkpoint!
          p.checkpointsPassed += 1;
          p.nextCheckpointDist += 450;
          p.timeRemaining += stage.timeBonus;
          sound.playRallyCheckpoint();
          setBonusNotification(`+${stage.timeBonus}s BONUS!`);
          setTimeout(() => setBonusNotification(null), 2500);

          // Reposition arch to next distance ahead
          checkpointArchGroup.position.z = p.nextCheckpointDist - p.distance;
        } else {
          // Update arch position relative to car
          checkpointArchGroup.position.z = p.nextCheckpointDist - p.distance;
        }

        // Car Visual Roll & Pitch (Weight transfer)
        p.carHeading = -steerInput * 0.18 + (p.isDrifting ? -steerInput * 0.28 : 0);
        p.carRoll = steerInput * 0.08;
        p.carPitch = isGas ? -0.04 : isBraking ? 0.07 : 0;

        carGroup.position.x = p.carX;
        carGroup.rotation.y = p.carHeading;
        carGroup.rotation.z = p.carRoll;
        carGroup.rotation.x = p.carPitch;

        // Spin Wheels
        const wheelRotDelta = speedMps * delta * 5;
        frontWheelL.rotation.x += wheelRotDelta;
        frontWheelR.rotation.x += wheelRotDelta;
        rearWheelL.rotation.x += wheelRotDelta;
        rearWheelR.rotation.x += wheelRotDelta;

        // Steer front wheels
        frontWheelL.rotation.y = steerInput * 0.35;
        frontWheelR.rotation.y = steerInput * 0.35;

        // Camera Follow with Dynamic Speed FOV & Shake
        const targetCamX = p.carX * 0.65;
        camera.position.x += (targetCamX - camera.position.x) * 0.1;
        camera.position.y = 3.2 + (p.shakeAmount > 0 ? (Math.random() - 0.5) * p.shakeAmount : 0);
        camera.fov = 62 + (p.speed / p.maxSpeed) * 12; // Dynamic FOV expansion
        camera.updateProjectionMatrix();

        // Update Road Segments to create continuous motion illusion
        segments.forEach((seg) => {
          seg.zPos -= speedMps * delta;
          if (seg.zPos < -20) {
            seg.zPos += ROAD_SEGMENTS_COUNT * SEGMENT_LENGTH;
          }
          seg.group.position.z = seg.zPos;
          // Apply track curve offset
          seg.group.position.x = Math.sin((seg.zPos + p.distance) * 0.006) * (currentCurve * 14);
        });

        // Update Trackside Scenery Objects
        sceneryPool.forEach((obj) => {
          obj.position.z -= speedMps * delta;
          if (obj.position.z < -15) {
            obj.position.z += SCENERY_COUNT * 18;
          }
        });

        // Update AI Rivals
        rivals.forEach((rival) => {
          rival.dist += (rival.speedKmh / 3.6) * delta;
          const relativeZ = rival.dist - p.distance;
          rival.mesh.position.z = relativeZ;
          rival.mesh.position.x = rival.xPos;

          // Check if player overtakes rival car
          if (relativeZ < 0 && !p.overtakenIds.has(rival.id)) {
            p.overtakenIds.add(rival.id);
            p.rivalsOvertaken += 1;
            setScore((s) => s + 500);
            sound.playTerminalBeep(980);
            setBonusNotification('+500 OVERTAKE!');
            setTimeout(() => setBonusNotification(null), 2000);
          }

          // Simple collision check between player and rival
          if (Math.abs(relativeZ) < 3.2 && Math.abs(p.carX - rival.xPos) < 1.8) {
            p.speed = Math.max(p.speed - 35, 20);
            p.shakeAmount = 0.25;
            sound.playRallyCrash();
          }
        });

        // Update Weather Particles
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT * 3; i += 3) {
          positions[i + 2] -= (speedMps + 15) * delta;
          if (positions[i + 2] < -30) {
            positions[i + 2] = 50;
            positions[i] = (Math.random() - 0.5) * 35;
          }
          if (stage.weatherType === 'snow') {
            positions[i + 1] -= delta * 6;
            if (positions[i + 1] < 0) positions[i + 1] = 12;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else if (gameState === 'menu') {
        // In Menu: Beautiful rotating 3D car showcase
        carGroup.position.set(0, 0, 0);
        carGroup.rotation.y += delta * 0.7;
        camera.position.set(0, 2.4, -6.5);
        camera.lookAt(0, 0.8, 0);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 360;
      const newH = container.clientHeight || 640;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [gameState, selectedStageIdx, selectedLivery, autoGas]);

  // Finish Race Handler
  const finishRace = useCallback(
    (reason: 'STAGE_CLEAR' | 'TIME_UP') => {
      setGameState('summary');
      const p = physics.current;
      const finalMs = p.elapsedMs;
      const finalFormatted = formatRaceTime(finalMs);
      const stage = STAGES[selectedStageIdx];

      setSummaryStats({
        reason,
        score,
        timeFormatted: finalFormatted,
        timeMs: finalMs,
        topSpeed: p.topSpeedRecorded,
        checkpointsCleared: p.checkpointsPassed,
        rivalsOvertaken: p.rivalsOvertaken,
        driftsCount: Math.round(p.driftPoints / 100),
        stageName: stage.name,
      });

      // Check if player broke current World Record or achieved a leaderboard score!
      const currentTopScore = worldRecord?.score || 18500;
      if (score > currentTopScore) {
        setIsNewRecordModal(true);
        confetti({ particleCount: 150, spread: 90 });
      }
    },
    [score, selectedStageIdx, worldRecord]
  );

  // Start Countdown Sequence
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

      // Initialize fresh physics
      const p = physics.current;
      p.speed = 0;
      p.carX = 0;
      p.carHeading = 0;
      p.distance = 0;
      p.timeRemaining = 45.0;
      p.elapsedMs = 0;
      p.startTime = performance.now();
      p.isDrifting = false;
      p.driftPoints = 0;
      p.topSpeedRecorded = 0;
      p.checkpointsPassed = 0;
      p.nextCheckpointDist = 400;
      p.rivalsOvertaken = 0;
      p.overtakenIds.clear();
      p.isFinished = false;

      setScore(0);
      setCountdownTimer(45.0);
      setSpeedKmh(0);
      setGameState('racing');
    }, 3000);
  };

  // Save New High Score (CRUD: Create)
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
      score: summaryStats.score,
      stage: summaryStats.stageName,
      timeFormatted: summaryStats.timeFormatted,
      timeMs: summaryStats.timeMs,
      topSpeed: summaryStats.topSpeed,
    });

    setIsSavingScore(false);
    if (res.success) {
      setIsNewRecordModal(false);
      setGameState('leaderboard');
    } else {
      setNameError(res.error || 'Failed to save score');
    }
  };

  // Admin Update Record Holder Name (CRUD: Update)
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

  // Admin Delete Score Entry (CRUD: Delete)
  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Delete this record entry?')) {
      await deleteScore(id);
    }
  };

  // Verify Admin Key
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

      {/* EXIT TO PHONE HOME (Top Left) */}
      {onGoHome && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGoHome();
          }}
          className="absolute top-3 left-3 z-30 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/90 hover:text-white shadow-lg transition-transform active:scale-95"
          title="Exit to Phone Home"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
        </button>
      )}

      {/* AUDIO MUTE TOGGLE (Top Right) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const next = !isMuted;
          setIsMuted(next);
          sound.setMute(next);
        }}
        className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/90 hover:text-white shadow-lg transition-transform active:scale-95"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      </button>

      {/* ========================================================================= */}
      {/* 1. RETRO NOKIA RACING HUD (Visible during gameplay)                      */}
      {/* ========================================================================= */}
      {gameState === 'racing' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5">
          {/* TOP BAR: Classic Nokia Km/h & Countdown Timer */}
          <div>
            <div className="flex items-center justify-between">
              {/* Retro Bold Top-Left: Km/h:85 */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-black text-lg tracking-wider text-amber-300">
                  Km/h:{speedKmh}
                </span>
              </div>

              {/* Retro Bold Top-Right: 14:3 */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border shadow-lg ${
                  countdownTimer < 10 ? 'border-rose-500/60 bg-rose-950/60 animate-pulse' : 'border-white/10'
                }`}
              >
                <Timer className={`w-4 h-4 ${countdownTimer < 10 ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span
                  className={`font-mono font-black text-lg tracking-wider ${
                    countdownTimer < 10 ? 'text-rose-400' : 'text-emerald-300'
                  }`}
                >
                  {formatNokiaTimer(countdownTimer)}
                </span>
              </div>
            </div>

            {/* World Record Indicator Banner */}
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-slate-300 px-2">
              <span className="flex items-center gap-1 text-amber-400">
                <Trophy className="w-3 h-3" />
                #1 {worldRecord?.name || 'S. Pullingal'}: {worldRecord?.score || 18500}
              </span>
              <span className="font-mono font-bold text-white tracking-wide">
                SCORE: {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* CO-DRIVER PACE NOTE TURN WARNING (Top-Center) */}
          {paceNote && (
            <div className="self-center animate-bounce flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-sm tracking-wider shadow-2xl border-2 border-amber-300">
              <span className="text-lg">{paceNote.icon}</span>
              <span>{paceNote.text}</span>
            </div>
          )}

          {/* CHECKPOINT BONUS FLASH NOTIFICATION */}
          {bonusNotification && (
            <div className="self-center animate-pulse flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-base tracking-widest shadow-2xl border-2 border-emerald-300">
              <Zap className="w-5 h-5 fill-current" />
              <span>{bonusNotification}</span>
            </div>
          )}

          {/* BOTTOM CONTROLS & DISTANCE BAR */}
          <div className="space-y-2 pointer-events-auto">
            {/* Track Progress Bar */}
            <div className="w-full bg-black/60 backdrop-blur-md rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-150"
                style={{ width: `${lapProgress}%` }}
              />
            </div>

            {/* On-Screen Touch Controls (Left/Right steering + Drift/Brake) */}
            <div className="flex items-center justify-between pt-1">
              {/* Steer Left Button */}
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
                className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-500/40 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* Center Controls: Auto Gas Toggle & Handbrake Drift */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAutoGas(!autoGas);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all ${
                    autoGas
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                      : 'bg-white/10 border-white/20 text-slate-300'
                  }`}
                >
                  AUTO GAS: {autoGas ? 'ON' : 'OFF'}
                </button>

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
                  className="px-4 py-3 rounded-2xl bg-rose-600/70 hover:bg-rose-600 active:bg-rose-500 backdrop-blur-lg border border-rose-400/50 flex items-center gap-1.5 text-xs font-black tracking-wider text-white shadow-xl active:scale-95 transition-transform"
                >
                  <Flame className="w-4 h-4 fill-current text-amber-300" />
                  DRIFT
                </button>
              </div>

              {/* Steer Right Button */}
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
                className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-500/40 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COUNTDOWN 3-2-1-GO OVERLAY                                            */}
      {/* ========================================================================= */}
      {gameState === 'countdown' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="font-mono font-black text-7xl tracking-tighter text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] animate-pulse">
            {countdownBeepNum}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TITLE MENU SCREEN (Rotating 3D WRC Car, Stage Selector, Controls)       */}
      {/* ========================================================================= */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80 backdrop-blur-[2px]">
          {/* Header Title with Nokia Brand Identity */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-semibold text-emerald-300 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Nokia J2ME Classic • Remastered HD
            </div>
            <h1 className="font-black text-3xl tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 bg-clip-text text-transparent">
              RALLY 3D
            </h1>
            <p className="text-xs text-slate-300">WRC Championship • WebGL 60 FPS</p>
          </div>

          {/* WORLD RECORD BADGE */}
          <div className="self-center px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-amber-500/30 shadow-xl flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-left text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">World Record</div>
              <div className="font-bold text-amber-300">
                {worldRecord ? `${worldRecord.name} — ${worldRecord.score.toLocaleString()} pts` : 'S. Pullingal — 18,500 pts'}
              </div>
            </div>
          </div>

          {/* STAGE & CAR SELECTION */}
          <div className="space-y-3">
            {/* Stage Selector */}
            <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  Select Stage
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  {selectedStageIdx + 1} / {STAGES.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStageIdx((prev) => (prev > 0 ? prev - 1 : STAGES.length - 1));
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center flex-1">
                  <div className="font-bold text-sm text-white">{STAGES[selectedStageIdx].name}</div>
                  <div className="text-[11px] text-slate-400">{STAGES[selectedStageIdx].subtitle}</div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStageIdx((prev) => (prev < STAGES.length - 1 ? prev + 1 : 0));
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Livery Toggle: White WRC vs Classic Red */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLivery('white_wrc');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedLivery === 'white_wrc'
                    ? 'bg-white text-slate-950 border-white shadow-lg'
                    : 'bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                🏁 White WRC Livery
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLivery('classic_red');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedLivery === 'classic_red'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg'
                    : 'bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                🏎️ Classic Rally Red
              </button>
            </div>

            {/* Start Race & Leaderboard Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startRaceCountdown();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:opacity-95 active:scale-[0.98] font-black text-sm tracking-wider text-slate-950 shadow-2xl flex items-center justify-center gap-2 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                START CHAMPIONSHIP
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGameState('leaderboard');
                }}
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
      {/* 4. RACE SUMMARY SCREEN (Finished or Time Expired)                         */}
      {/* ========================================================================= */}
      {gameState === 'summary' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
          <div className="text-center pt-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                summaryStats.reason === 'STAGE_CLEAR'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {summaryStats.reason === 'STAGE_CLEAR' ? 'STAGE COMPLETE' : 'TIME EXPIRED'}
            </div>
            <h2 className="text-2xl font-black text-white">{summaryStats.stageName}</h2>
          </div>

          {/* TELEMETRY CARD */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 shadow-2xl space-y-3">
            <div className="text-center pb-2 border-b border-white/10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Final Score</div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {summaryStats.score.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">STAGE TIME</div>
                <div className="font-mono font-bold text-white text-sm">{summaryStats.timeFormatted}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">TOP SPEED</div>
                <div className="font-mono font-bold text-white text-sm">{summaryStats.topSpeed} KM/H</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">CHECKPOINTS</div>
                <div className="font-bold text-emerald-400 text-sm">+{summaryStats.checkpointsCleared}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">RIVALS OVERTAKEN</div>
                <div className="font-bold text-amber-400 text-sm">+{summaryStats.rivalsOvertaken}</div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsNewRecordModal(true);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Trophy className="w-4 h-4 fill-current" />
              SAVE TO HALL OF FAME
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startRaceCountdown();
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              RACE AGAIN
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGameState('menu');
              }}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
            >
              Back to Main Menu
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. NEW HIGH SCORE NAME ENTRY MODAL (2-15 characters validation)            */}
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
                Score: <span className="text-amber-400 font-bold">{summaryStats.score.toLocaleString()}</span>
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
                  placeholder="e.g. Rally Legend"
                  onFocus={(e) => e.target.focus({ preventScroll: true })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
                {nameError && <div className="text-rose-400 text-xs mt-1">{nameError}</div>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNewRecordModal(false);
                  }}
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
      {/* 6. GLOBAL LEADERBOARD & ADMIN CRUD VIEW                                   */}
      {/* ========================================================================= */}
      {gameState === 'leaderboard' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-slate-950/98 backdrop-blur-md overflow-hidden">
          {/* Top Bar with Back and Admin Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGameState('menu');
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                setShowAdminLogin(!showAdminLogin);
              }}
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

          {/* Admin Login Dialog */}
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

          {/* Bottom Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startRaceCountdown();
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider shadow-xl flex items-center justify-center gap-2"
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
export default Rally3DApp;
