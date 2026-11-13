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
} from 'lucide-react';
import { sound } from '../../audio/audioEngine';
import {
  getTopHighScores,
  saveHighScoreRecord,
  updateHighScoreName,
  deleteHighScoreRecord,
  subscribeToHighScores,
  type RallyHighScore,
} from '../../../lib/rallyHighscores';

interface Rally3DAppProps {
  isTablet?: boolean;
  onGoHome?: () => void;
}

export const Rally3DApp: React.FC<Rally3DAppProps> = ({ isTablet: _isTablet = false, onGoHome: _onGoHome }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'racing' | 'finished' | 'leaderboard'>('menu');
  const [speed, setSpeed] = useState(0);
  const [stageTime, setStageTime] = useState('00:00:0');
  const [gear, setGear] = useState('N');
  const [driftScore, setDriftScore] = useState(0);
  const [paceNote, setPaceNote] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [highScores, setHighScores] = useState<RallyHighScore[]>([]);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalStats, setFinalStats] = useState({
    time: '01:22:4',
    timeMs: 82400,
    topSpeed: 164,
    score: 14200,
  });

  // Track key inputs
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // Physics engine mutable state
  const physics = useRef({
    speed: 0, // km/h
    maxSpeed: 176,
    acceleration: 0.65,
    braking: 1.2,
    friction: 0.985,
    steeringAngle: 0,
    carX: 0, // track lateral position (-1 to 1)
    distance: 0,
    driftMultiplier: 1,
    isDrifting: false,
    maxRecordedSpeed: 0,
    lapProgress: 0,
    trackLength: 2400, // meters
    startTime: 0,
    elapsedMs: 0,
    checkpointPassed: 0,
  });

  // Subscribe to real-time high scores
  useEffect(() => {
    const unsubscribe = subscribeToHighScores((scores) => {
      setHighScores(scores);
    });
    return () => unsubscribe();
  }, []);

  // Format millisecond timer to retro Nokia "MM:SS:T" (Minutes:Seconds:Tenths)
  const formatTime = (ms: number) => {
    const totalTenths = Math.floor(ms / 100);
    const tenths = totalTenths % 10;
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const mins = Math.floor(totalSecs / 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${tenths}`;
  };

  // Start a new rally stage
  const startRace = useCallback(() => {
    sound.playClick();
    sound.playRallyCheckpoint();
    physics.current = {
      speed: 0,
      maxSpeed: 176,
      acceleration: 0.65,
      braking: 1.2,
      friction: 0.985,
      steeringAngle: 0,
      carX: 0,
      distance: 0,
      driftMultiplier: 1,
      isDrifting: false,
      maxRecordedSpeed: 0,
      lapProgress: 0,
      trackLength: 2400,
      startTime: Date.now(),
      elapsedMs: 0,
      checkpointPassed: 0,
    };
    setDriftScore(0);
    setIsNewRecord(false);
    setGameState('racing');
  }, []);

  // Three.js 3D Viewport Setup & Game Loop
  useEffect(() => {
    if (!mountRef.current || gameState !== 'racing') return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8); // Classic Nokia bright alpine blue sky
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.0075);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 3. Iconic Red Rally Car (Enhanced 3D Nokia Rally Model)
    const carGroup = new THREE.Group();

    // Red car main body chassis
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.65, 3.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xdd1818, // Vibrant Rally Red
      roughness: 0.3,
      metalness: 0.4,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.55;
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);

    // White lower front bumper / skirt (Authentic to user's uploaded Rally 3D screenshot)
    const bumperGeo = new THREE.BoxGeometry(1.64, 0.22, 0.6);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const frontBumper = new THREE.Mesh(bumperGeo, bumperMat);
    frontBumper.position.set(0, 0.32, 1.4);
    carGroup.add(frontBumper);

    // Rear bumper in white/light blue tint
    const rearBumper = new THREE.Mesh(bumperGeo, bumperMat);
    rearBumper.position.set(0, 0.32, -1.4);
    carGroup.add(rearBumper);

    // Cabin / Cockpit Roof & Windshields
    const cabinGeo = new THREE.BoxGeometry(1.3, 0.52, 1.6);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0, 1.05, -0.2);
    carGroup.add(cabinMesh);

    // Rear Windshield Tint Glass (Nokia cyan/sky reflection)
    const rearGlassGeo = new THREE.PlaneGeometry(1.15, 0.45);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide });
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.rotation.x = -Math.PI / 6;
    rearGlass.position.set(0, 1.05, -1.02);
    carGroup.add(rearGlass);

    // Front Windshield Glass
    const frontGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    frontGlass.rotation.x = Math.PI / 6;
    frontGlass.position.set(0, 1.05, 0.62);
    carGroup.add(frontGlass);

    // Iconic Rear Rally Spoiler
    const spoilerWingGeo = new THREE.BoxGeometry(1.5, 0.08, 0.3);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0xdd1818, roughness: 0.4 });
    const spoilerWing = new THREE.Mesh(spoilerWingGeo, spoilerMat);
    spoilerWing.position.set(0, 1.25, -1.45);
    carGroup.add(spoilerWing);

    const spoilerStandGeo = new THREE.BoxGeometry(0.08, 0.25, 0.15);
    const spoilerStandL = new THREE.Mesh(spoilerStandGeo, bodyMat);
    spoilerStandL.position.set(-0.5, 1.05, -1.45);
    carGroup.add(spoilerStandL);
    const spoilerStandR = new THREE.Mesh(spoilerStandGeo, bodyMat);
    spoilerStandR.position.set(0.5, 1.05, -1.45);
    carGroup.add(spoilerStandR);

    // Amber / Red Taillights (Classic Nokia style with brake glow)
    const tailLightGeo = new THREE.BoxGeometry(0.35, 0.14, 0.05);
    const tailLightMatL = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Amber
    const tailLightMatR = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const tailLightL = new THREE.Mesh(tailLightGeo, tailLightMatL);
    tailLightL.position.set(-0.55, 0.58, -1.61);
    const tailLightR = new THREE.Mesh(tailLightGeo, tailLightMatR);
    tailLightR.position.set(0.55, 0.58, -1.61);
    carGroup.add(tailLightL);
    carGroup.add(tailLightR);

    // Front Dual Headlights with PointLight projection
    const headLightGeo = new THREE.BoxGeometry(0.3, 0.14, 0.05);
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headLightL = new THREE.Mesh(headLightGeo, headLightMat);
    headLightL.position.set(-0.55, 0.52, 1.61);
    const headLightR = new THREE.Mesh(headLightGeo, headLightMat);
    headLightR.position.set(0.55, 0.52, 1.61);
    carGroup.add(headLightL);
    carGroup.add(headLightR);

    const carLightBeam = new THREE.SpotLight(0xfff7ed, 3, 40, Math.PI / 5, 0.4);
    carLightBeam.position.set(0, 0.8, 1.5);
    carLightBeam.target.position.set(0, 0, 15);
    carGroup.add(carLightBeam);
    carGroup.add(carLightBeam.target);

    // 4 Detailed Wheels (Rubber tires + Silver alloy rims)
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.28, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.29, 8);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });

    const createWheel = () => {
      const g = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      g.add(tire);
      g.add(rim);
      return g;
    };

    const frontWheelL = createWheel();
    frontWheelL.position.set(-0.85, 0.34, 1.05);
    const frontWheelR = createWheel();
    frontWheelR.position.set(0.85, 0.34, 1.05);
    const rearWheelL = createWheel();
    rearWheelL.position.set(-0.85, 0.34, -1.05);
    const rearWheelR = createWheel();
    rearWheelR.position.set(0.85, 0.34, -1.05);

    carGroup.add(frontWheelL);
    carGroup.add(frontWheelR);
    carGroup.add(rearWheelL);
    carGroup.add(rearWheelR);

    // Shadow blob beneath car
    const carShadowGeo = new THREE.PlaneGeometry(2.0, 3.6);
    const carShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const carShadow = new THREE.Mesh(carShadowGeo, carShadowMat);
    carShadow.rotation.x = -Math.PI / 2;
    carShadow.position.y = 0.05;
    carGroup.add(carShadow);

    scene.add(carGroup);

    // 4. Procedural 3D Rally Road & Scenic Landscape
    // Alpine mountain range in distant background
    const mountainGeo = new THREE.ConeGeometry(50, 45, 4);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate mountain rock
      roughness: 0.9,
    });
    const snowCapGeo = new THREE.ConeGeometry(22, 18, 4);
    const snowCapMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Snow cap
      roughness: 0.6,
    });

    const mountainsGroup = new THREE.Group();
    for (let i = -6; i <= 6; i++) {
      const m = new THREE.Mesh(mountainGeo, mountainMat);
      const s = new THREE.Mesh(snowCapGeo, snowCapMat);
      s.position.y = 15;
      m.add(s);
      m.position.set(i * 60 + (Math.random() - 0.5) * 20, 20, 400 + (Math.random() - 0.5) * 50);
      m.scale.set(1 + Math.random() * 0.4, 1 + Math.random() * 0.5, 1);
      mountainsGroup.add(m);
    }
    scene.add(mountainsGroup);

    // Dense Forest Tree Meshes along the track sides
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const treeFoliageGeo = new THREE.ConeGeometry(2.4, 6.5, 7);
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 }); // Forest evergreen

    const createPineTree = () => {
      const tg = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 1.25;
      const foliage1 = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage1.position.y = 4.2;
      const foliage2 = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage2.position.y = 5.6;
      foliage2.scale.set(0.75, 0.75, 0.75);
      tg.add(trunk);
      tg.add(foliage1);
      tg.add(foliage2);
      return tg;
    };

    const trees: THREE.Group[] = [];
    for (let z = 20; z < 500; z += 18) {
      // Left side trees
      const treeL = createPineTree();
      treeL.position.set(-16 - Math.random() * 12, 0, z);
      treeL.scale.setScalar(0.8 + Math.random() * 0.5);
      scene.add(treeL);
      trees.push(treeL);

      // Right side trees
      const treeR = createPineTree();
      treeR.position.set(16 + Math.random() * 12, 0, z);
      treeR.scale.setScalar(0.8 + Math.random() * 0.5);
      scene.add(treeR);
      trees.push(treeR);
    }

    // Road Track Segments
    const SEGMENTS_COUNT = 60;
    const SEGMENT_LENGTH = 10;
    const trackWidth = 10;

    const roadGeo = new THREE.PlaneGeometry(trackWidth, SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x5a4632, // Classic Nokia dirt brown gravel
      roughness: 0.85,
    });

    const grassGeo = new THREE.PlaneGeometry(35, SEGMENT_LENGTH);
    grassGeo.rotateX(-Math.PI / 2);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f, // Lush green grass bank
      roughness: 0.9,
    });

    // Guardrail / Barrier posts on sharp turns
    const barrierGeo = new THREE.BoxGeometry(0.3, 0.8, SEGMENT_LENGTH);
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 }); // Red safety strip

    interface Segment {
      mesh: THREE.Group;
      roadMesh: THREE.Mesh;
      curvature: number;
      elevation: number;
      z: number;
    }

    const segments: Segment[] = [];

    for (let i = 0; i < SEGMENTS_COUNT; i++) {
      const segGroup = new THREE.Group();

      const road = new THREE.Mesh(roadGeo, roadMat);
      road.receiveShadow = true;
      segGroup.add(road);

      const grassL = new THREE.Mesh(grassGeo, grassMat);
      grassL.position.x = -22.5;
      grassL.receiveShadow = true;
      segGroup.add(grassL);

      const grassR = new THREE.Mesh(grassGeo, grassMat);
      grassR.position.x = 22.5;
      grassR.receiveShadow = true;
      segGroup.add(grassR);

      // Left & right red safety barriers
      const bL = new THREE.Mesh(barrierGeo, barrierMat);
      bL.position.set(-trackWidth / 2 - 0.2, 0.4, 0);
      segGroup.add(bL);
      const bR = new THREE.Mesh(barrierGeo, barrierMat);
      bR.position.set(trackWidth / 2 + 0.2, 0.4, 0);
      segGroup.add(bR);

      const zPos = i * SEGMENT_LENGTH;
      segGroup.position.z = zPos;
      scene.add(segGroup);

      segments.push({
        mesh: segGroup,
        roadMesh: road,
        curvature: Math.sin(i * 0.12) * 0.45,
        elevation: Math.sin(i * 0.08) * 1.5,
        z: zPos,
      });
    }

    // 5. Tire Dust Particle System
    const DUST_COUNT = 70;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustOpacities = new Float32Array(DUST_COUNT);

    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 1.6;
      dustPositions[i * 3 + 1] = Math.random() * 0.4;
      dustPositions[i * 3 + 2] = -1.2 - Math.random() * 4;
      dustOpacities[i] = 0;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xb48c68, // Sandy brown dust
      size: 0.45,
      transparent: true,
      opacity: 0.6,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 6. Keyboard input listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (e.code === 'Space') {
        keys.current.handbrake = true;
        sound.playRallyDrift();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (e.code === 'Space') keys.current.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 7. Main High-Precision Physics Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let currentCurve = 0;

    const gameLoop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const p = physics.current;

      // Update elapsed time
      p.elapsedMs = Date.now() - p.startTime;
      const formatted = formatTime(p.elapsedMs);
      setStageTime(formatted);

      // Input response: Acceleration & Braking
      if (keys.current.up) {
        p.speed = Math.min(p.maxSpeed, p.speed + p.acceleration);
        tailLightMatL.color.setHex(0xf59e0b);
        tailLightMatR.color.setHex(0xf59e0b);
      } else if (keys.current.down) {
        p.speed = Math.max(-25, p.speed - p.braking);
        // Bright red glowing brake lights
        tailLightMatL.color.setHex(0xff0000);
        tailLightMatR.color.setHex(0xff0000);
      } else {
        p.speed *= p.friction;
        tailLightMatL.color.setHex(0xf59e0b);
        tailLightMatR.color.setHex(0xf59e0b);
      }

      // Handbrake drift mechanics
      if (keys.current.handbrake && p.speed > 30) {
        p.speed *= 0.985;
        p.isDrifting = true;
      } else {
        p.isDrifting = false;
      }

      // Record top speed
      if (p.speed > p.maxRecordedSpeed) {
        p.maxRecordedSpeed = Math.round(p.speed);
      }
      setSpeed(Math.round(p.speed));

      // Automatic transmission gear indicator
      if (p.speed < -1) setGear('R');
      else if (p.speed < 2) setGear('N');
      else if (p.speed < 40) setGear('1');
      else if (p.speed < 75) setGear('2');
      else if (p.speed < 115) setGear('3');
      else if (p.speed < 150) setGear('4');
      else setGear('5');

      // Steering with speed sensitivity
      const steerSpeed = Math.min(1.2, p.speed / 50);
      if (keys.current.left) {
        p.steeringAngle = Math.max(-0.45, p.steeringAngle - 0.05 * steerSpeed);
        p.carX -= (0.015 + (p.isDrifting ? 0.02 : 0)) * (p.speed / 60);
      } else if (keys.current.right) {
        p.steeringAngle = Math.min(0.45, p.steeringAngle + 0.05 * steerSpeed);
        p.carX += (0.015 + (p.isDrifting ? 0.02 : 0)) * (p.speed / 60);
      } else {
        p.steeringAngle *= 0.85;
      }

      // Front wheels turn realistically
      frontWheelL.rotation.y = p.steeringAngle * 1.4;
      frontWheelR.rotation.y = p.steeringAngle * 1.4;

      // Wheel rotation based on forward motion
      const wheelSpin = (p.speed / 3.6) * dt * 4;
      frontWheelL.children[0].rotation.x += wheelSpin;
      frontWheelR.children[0].rotation.x += wheelSpin;
      rearWheelL.children[0].rotation.x += wheelSpin;
      rearWheelR.children[0].rotation.x += wheelSpin;

      // Distance progress & Track boundaries
      p.distance += (p.speed / 3.6) * dt;
      p.lapProgress = Math.min(1, p.distance / p.trackLength);

      // Checkpoints check (every 600m)
      const currentCP = Math.floor(p.distance / 600);
      if (currentCP > p.checkpointPassed && currentCP <= 3) {
        p.checkpointPassed = currentCP;
        sound.playRallyCheckpoint();
        setPaceNote(`CHECKPOINT ${currentCP} PASSED!`);
        setTimeout(() => setPaceNote(null), 1800);
      }

      // Check off-road grass collision
      if (Math.abs(p.carX) > 0.85) {
        // Off road grass slows car down with barrier collision
        p.speed *= 0.96;
        if (Math.abs(p.carX) > 1.1) {
          sound.playRallyCrash();
          p.carX = Math.sign(p.carX) * 1.05;
        }
      }

      // Drift scoring
      if ((p.isDrifting || Math.abs(p.steeringAngle) > 0.25) && p.speed > 55) {
        const driftAdd = Math.round(p.speed * 0.8);
        setDriftScore((prev) => prev + driftAdd);
      }

      // Calculate upcoming track curve for co-driver pace notes
      const curveAhead = Math.sin((p.distance + 80) * 0.015);
      if (curveAhead > 0.6) setPaceNote('>>> HARD RIGHT >>>');
      else if (curveAhead < -0.6) setPaceNote('<<< HARD LEFT <<<');
      else if (curveAhead > 0.3) setPaceNote('> EASY RIGHT >');
      else if (curveAhead < -0.3) setPaceNote('< EASY LEFT <');
      else if (!paceNote || paceNote.includes('LEFT') || paceNote.includes('RIGHT')) {
        setPaceNote(null);
      }

      // Move track segments backwards to create high-speed forward travel
      currentCurve = Math.sin(p.distance * 0.015) * 4;
      p.carX += currentCurve * (p.speed / 3600); // centrifugal push

      segments.forEach((seg) => {
        let segZ = ((seg.z - p.distance) % (SEGMENTS_COUNT * SEGMENT_LENGTH));
        if (segZ < -SEGMENT_LENGTH) segZ += SEGMENTS_COUNT * SEGMENT_LENGTH;
        seg.mesh.position.z = segZ;

        // Apply curve shift to road segment
        const curveOffset = Math.sin((p.distance + segZ) * 0.015) * 8;
        seg.mesh.position.x = curveOffset;
        seg.mesh.position.y = Math.sin((p.distance + segZ) * 0.008) * 2;
      });

      // Update trees position
      trees.forEach((tree) => {
        let tz = ((tree.position.z - p.distance) % 500);
        if (tz < 0) tz += 500;
        tree.position.z = tz;
      });

      // Mountain parallax scroll
      mountainsGroup.position.x = -currentCurve * 12;

      // Update Car 3D Transform
      carGroup.position.x = p.carX * (trackWidth * 0.42);
      carGroup.position.y = Math.sin(p.distance * 0.008) * 2 + 0.1;
      carGroup.position.z = 8; // Stable focal distance

      // Car body physics tilt (roll on turn, pitch on accel/brake)
      const targetRoll = -p.steeringAngle * 0.35 + (p.isDrifting ? -0.15 : 0);
      carGroup.rotation.z += (targetRoll - carGroup.rotation.z) * 0.2;

      const targetPitch = keys.current.down ? 0.06 : keys.current.up ? -0.04 : 0;
      carGroup.rotation.x += (targetPitch - carGroup.rotation.x) * 0.2;

      // Car body yaw angle during drifts
      const targetYaw = p.steeringAngle * 0.8;
      carGroup.rotation.y += (targetYaw - carGroup.rotation.y) * 0.25;

      // Update tire dust particles
      const positions = dustGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < DUST_COUNT; i++) {
        positions[i * 3 + 2] -= (p.speed / 3.6) * dt * 1.5;
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 2] < -12 || Math.random() < 0.08) {
          positions[i * 3] = carGroup.position.x + (Math.random() - 0.5) * 1.4;
          positions[i * 3 + 1] = carGroup.position.y + 0.15 + Math.random() * 0.2;
          positions[i * 3 + 2] = carGroup.position.z - 1.4;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;

      // Camera Chase Positioning (Dynamic third-person chase camera)
      const targetCamX = carGroup.position.x * 0.65;
      const targetCamY = carGroup.position.y + 3.2;
      const targetCamZ = carGroup.position.z - 6.2;

      camera.position.x += (targetCamX - camera.position.x) * 0.15;
      camera.position.y += (targetCamY - camera.position.y) * 0.15;
      camera.position.z = targetCamZ;
      camera.lookAt(carGroup.position.x * 0.8, carGroup.position.y + 1.2, carGroup.position.z + 18);

      renderer.render(scene, camera);

      // Check Race Finish (2400 meters reached!)
      if (p.distance >= p.trackLength) {
        finishRace();
        return;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gameState]);

  // Finish race and check high scores
  const finishRace = useCallback(async () => {
    sound.playRallyCheckpoint();
    const p = physics.current;
    const finalTimeFormatted = formatTime(p.elapsedMs);
    const speedScore = Math.round(p.maxRecordedSpeed * 40);
    const timeBonus = Math.max(0, 120000 - p.elapsedMs) / 10;
    const computedTotal = Math.round(10000 + driftScore + speedScore + timeBonus);

    setFinalStats({
      time: finalTimeFormatted,
      timeMs: p.elapsedMs,
      topSpeed: p.maxRecordedSpeed,
      score: computedTotal,
    });
    setGameState('finished');

    // Check if score places on top leaderboard
    const topScores = await getTopHighScores(10);
    const isRecord = topScores.length < 10 || computedTotal > (topScores[topScores.length - 1]?.score || 0);

    if (isRecord) {
      setIsNewRecord(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [driftScore]);

  // Handle saving new player record to Firebase
  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerNameInput.trim()) return;
    setIsSubmitting(true);
    try {
      await saveHighScoreRecord({
        playerName: playerNameInput.trim(),
        score: finalStats.score,
        timeFormatted: finalStats.time,
        timeMs: finalStats.timeMs,
        topSpeed: finalStats.topSpeed,
        stageName: 'Alpine Mountain Pass',
      });
      sound.playClick();
      setIsNewRecord(false);
      setGameState('leaderboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CRUD: Update player name
  const handleUpdateName = async (id: string) => {
    if (!editNameText.trim()) return;
    await updateHighScoreName(id, editNameText.trim());
    sound.playClick();
    setEditingScoreId(null);
    setEditNameText('');
  };

  // CRUD: Delete high score record
  const handleDeleteScore = async (id: string) => {
    if (window.confirm('Delete this high score record?')) {
      await deleteHighScoreRecord(id);
      sound.playClick();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-white relative select-none overflow-hidden overscroll-contain">
      {/* 1. RETRO NOKIA RALLY TITLE MENU */}
      {gameState === 'menu' && (
        <div className="flex-1 flex flex-col justify-between items-center p-4 sm:p-6 text-center animate-fadeIn relative z-20">
          <div className="space-y-2 mt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Nokia 3D Legacy Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 drop-shadow-[0_4px_12px_rgba(220,38,38,0.5)]">
              RALLY 3D
            </h1>
            <p className="text-xs font-mono text-slate-400 max-w-xs mx-auto">
              The legendary Nokia 3D rally game reimagined with 60FPS Three.js physics & Cloud Leaderboards.
            </p>
          </div>

          {/* Central Retro Car Preview Graphic */}
          <div className="relative w-48 h-32 sm:w-56 sm:h-36 rounded-2xl glass-panel border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.3)] flex items-center justify-center group">
            <img
              src="./app-icons/rally3d.png"
              alt="Rally 3D Car"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2">
              <span className="text-[10px] font-mono text-amber-300 font-bold tracking-widest">
                STAGE 1 &bull; ALPINE PASS
              </span>
            </div>
          </div>

          {/* Controls hint strip */}
          <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 space-y-1 max-w-sm">
            <div className="text-amber-400 font-bold">RALLY CONTROLS</div>
            <div className="text-slate-400 text-[10px]">
              Keyboard: Arrow Keys / WASD + Spacebar (Drift)
              <br />
              Mobile: On-Screen Touch Pedals & Steering
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full max-w-xs space-y-2 pb-2">
            <button
              type="button"
              onClick={startRace}
              className="w-full py-3.5 px-6 rounded-2xl font-orbitron font-bold text-sm text-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>START RALLY</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setGameState('leaderboard');
              }}
              className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-slate-200 glass-panel border border-white/15 hover:border-amber-400/50 hover:text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>GLOBAL HALL OF FAME</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE 3D RACING VIEWPORT & RETRO NOKIA HUD */}
      {gameState === 'racing' && (
        <div className="relative flex-1 w-full h-full">
          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Authentic Retro Nokia Top HUD Bar (Yellow/White Typography from Original Screenshots) */}
          <div className="absolute top-2 inset-x-3 z-30 flex items-center justify-between select-none pointer-events-none">
            {/* Speedometer (Original Nokia text: "Km/h:85") */}
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-orbitron font-extrabold text-sm sm:text-base text-yellow-300 tracking-wider">
                Km/h:{speed}
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 ml-1 px-1 rounded bg-black/50">
                G:{gear}
              </span>
            </div>

            {/* Stage Timer (Original Nokia text: "10:8" / "14:3") */}
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-orbitron font-extrabold text-sm sm:text-base text-yellow-300 tracking-wider">
                {stageTime}
              </span>
            </div>
          </div>

          {/* Co-Driver Pace Note Banner Alert */}
          {paceNote && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
              <div className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-orbitron font-extrabold text-xs tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.8)] flex items-center gap-2">
                <span>{paceNote}</span>
              </div>
            </div>
          )}

          {/* Drift Points Ticker */}
          {driftScore > 0 && (
            <div className="absolute top-20 right-3 z-30 pointer-events-none animate-fadeIn">
              <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-orange-500/40 text-orange-400 font-mono text-[10px] font-bold">
                DRIFT: +{driftScore}
              </div>
            </div>
          )}

          {/* Sound Toggle (Top Right Corner) */}
          <div className="absolute top-2 right-28 z-40">
            <button
              type="button"
              onClick={() => {
                const muted = sound.toggleMute();
                setIsMuted(muted);
              }}
              className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
              title="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00F5FF]" />}
            </button>
          </div>

          {/* ON-SCREEN TACTILE TOUCH CONTROLS (FOR SMARTPHONE & TABLET MODES) */}
          <div className="absolute bottom-2 inset-x-2 z-30 flex items-end justify-between pointer-events-auto p-1">
            {/* Left Hand: Steering Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => (keys.current.left = true)}
                onPointerUp={() => (keys.current.left = false)}
                onPointerLeave={() => (keys.current.left = false)}
                className="w-12 h-12 rounded-2xl bg-black/60 active:bg-amber-500/40 border border-white/20 active:border-amber-400 flex items-center justify-center text-lg font-bold text-white shadow-lg active:scale-90 transition-all touch-none select-none"
              >
                ◀
              </button>
              <button
                type="button"
                onPointerDown={() => (keys.current.right = true)}
                onPointerUp={() => (keys.current.right = false)}
                onPointerLeave={() => (keys.current.right = false)}
                className="w-12 h-12 rounded-2xl bg-black/60 active:bg-amber-500/40 border border-white/20 active:border-amber-400 flex items-center justify-center text-lg font-bold text-white shadow-lg active:scale-90 transition-all touch-none select-none"
              >
                ▶
              </button>
            </div>

            {/* Right Hand: Gas, Brake, Handbrake */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => {
                  keys.current.handbrake = true;
                  sound.playRallyDrift();
                }}
                onPointerUp={() => (keys.current.handbrake = false)}
                onPointerLeave={() => (keys.current.handbrake = false)}
                className="w-10 h-10 rounded-xl bg-orange-600/40 active:bg-orange-500 border border-orange-400/40 text-[10px] font-mono font-bold text-white flex items-center justify-center active:scale-90 shadow-md touch-none select-none"
                title="Handbrake Drift"
              >
                DRIFT
              </button>
              <button
                type="button"
                onPointerDown={() => (keys.current.down = true)}
                onPointerUp={() => (keys.current.down = false)}
                onPointerLeave={() => (keys.current.down = false)}
                className="w-12 h-12 rounded-2xl bg-rose-950/70 active:bg-rose-600 border border-rose-500/40 flex items-center justify-center text-xs font-mono font-bold text-rose-300 shadow-lg active:scale-90 transition-all touch-none select-none"
              >
                BRAKE
              </button>
              <button
                type="button"
                onPointerDown={() => (keys.current.up = true)}
                onPointerUp={() => (keys.current.up = false)}
                onPointerLeave={() => (keys.current.up = false)}
                className="w-14 h-14 rounded-2xl bg-emerald-600 active:bg-emerald-400 border-2 border-emerald-300 flex items-center justify-center text-sm font-mono font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-90 transition-all touch-none select-none"
              >
                GAS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FINISH LINE / GAME OVER STATS & NEW HIGH SCORE PROMPT */}
      {gameState === 'finished' && (
        <div className="flex-1 flex flex-col justify-between items-center p-4 sm:p-6 text-center animate-fadeIn overflow-y-auto">
          <div className="space-y-1 mt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-xs font-bold">
              <Flag className="w-3.5 h-3.5" />
              <span>STAGE FINISHED!</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-orbitron text-white">
              RALLY COMPLETED
            </h2>
            <p className="text-xs font-mono text-slate-400">Alpine Mountain Pass - Stage 1</p>
          </div>

          {/* Performance Telemetry Card */}
          <div className="w-full max-w-sm glass-panel p-4 rounded-2xl border border-white/10 space-y-3 my-2">
            <div className="text-2xl font-orbitron font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
              SCORE: {finalStats.score.toLocaleString()}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-slate-400">TIME</div>
                <div className="font-orbitron font-bold text-sm text-[#00F5FF]">{finalStats.time}</div>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-slate-400">TOP SPEED</div>
                <div className="font-orbitron font-bold text-sm text-yellow-300">{finalStats.topSpeed} km/h</div>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-slate-400">DRIFT PTS</div>
                <div className="font-orbitron font-bold text-sm text-orange-400">+{driftScore}</div>
              </div>
            </div>
          </div>

          {/* New Record Name Input Form (Save to Firebase Firestore) */}
          {isNewRecord ? (
            <form onSubmit={handleSaveScore} className="w-full max-w-sm glass-panel p-4 rounded-2xl border-2 border-amber-400/60 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.3)] space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-mono text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>NEW RECORD! ENTER YOUR NAME</span>
              </div>
              <input
                type="text"
                maxLength={20}
                required
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="Driver Name (e.g. RallyLegend)"
                className="w-full bg-black/70 border border-amber-400/50 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-300 text-center"
              />
              <button
                type="submit"
                disabled={isSubmitting || !playerNameInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'SAVING TO CLOUD...' : 'SAVE RECORD TO LEADERBOARD'}
              </button>
            </form>
          ) : (
            <div className="text-xs font-mono text-slate-400">
              Good run! Try drifting tighter through corners to beat the top record.
            </div>
          )}

          {/* Navigation buttons */}
          <div className="w-full max-w-sm flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={startRace}
              className="flex-1 py-3 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>RACE AGAIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setGameState('leaderboard');
              }}
              className="flex-1 py-3 rounded-xl font-mono text-xs font-bold text-slate-200 glass-panel border border-white/10 hover:border-amber-400/40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>LEADERBOARD</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. REAL-TIME FIREBASE HIGH SCORES LEADERBOARD (FULL CRUD) */}
      {gameState === 'leaderboard' && (
        <div className="flex-1 flex flex-col justify-between p-3 sm:p-5 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGameState('menu');
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Back to Game Menu"
              >
                <X className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm sm:text-base font-orbitron font-bold text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>RALLY 3D HALL OF FAME</span>
                </h3>
                <p className="text-[10px] font-mono text-emerald-400">Live Cloud Firestore Sync</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startRace}
              className="py-1.5 px-3 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 cursor-pointer shadow-sm"
            >
              RACE NOW
            </button>
          </div>

          {/* Scores Table */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-2 space-y-2 pr-1">
            {highScores.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                Loading live records from Firebase...
              </div>
            ) : (
              highScores.map((entry, index) => {
                const isTop1 = index === 0;
                const isTop3 = index < 3;
                const isEditing = editingScoreId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`p-2.5 sm:p-3 rounded-2xl glass-panel border transition-all flex items-center justify-between gap-2 ${
                      isTop1
                        ? 'border-amber-400/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : isTop3
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-white/5 bg-white/5'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-orbitron font-bold text-xs shrink-0 ${
                          index === 0
                            ? 'bg-amber-400 text-black shadow-md'
                            : index === 1
                            ? 'bg-slate-300 text-black'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </div>

                      {/* Driver info & Edit input */}
                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editNameText}
                              onChange={(e) => setEditNameText(e.target.value)}
                              className="bg-black/80 border border-amber-400 rounded-lg px-2 py-0.5 text-xs font-mono text-white focus:outline-none max-w-[120px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateName(entry.id)}
                              className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer"
                              title="Save name"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingScoreId(null)}
                              className="p-1 rounded bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="font-space font-bold text-xs text-white truncate flex items-center gap-1">
                              <span>{entry.playerName}</span>
                              {isTop1 && (
                                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                  CHAMP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {entry.timeFormatted} &bull; {entry.topSpeed} km/h &bull; {entry.stageName}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score & Actions (Update Name & Delete Record) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-orbitron font-extrabold text-xs sm:text-sm text-yellow-300">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">{entry.date.split(',')[0]}</div>
                      </div>

                      {/* CRUD: Edit & Delete buttons */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingScoreId(entry.id);
                              setEditNameText(entry.playerName);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-[#00F5FF] hover:bg-white/5 cursor-pointer"
                            title="Edit Driver Name (Update)"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteScore(entry.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            title="Delete Record"
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

          {/* Bottom strip */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
            <span>CRUD: Cloud Firestore &bull; Realtime Listeners</span>
            <button
              type="button"
              onClick={startRace}
              className="text-amber-400 hover:underline font-bold cursor-pointer"
            >
              Race Again &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
