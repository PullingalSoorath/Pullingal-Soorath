import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Smartphone } from 'lucide-react';
import { sound } from '../audio/audioEngine';
import { SmartPhoneView } from '../phone/SamsungS23UltraOneUI';
import { getISTTime, fetchLiveWeather } from '../../lib/realtimeService';

interface HeroViewport3DProps {
  onOpenCVModal?: () => void;
}

export const HeroViewport3D: React.FC<HeroViewport3DProps> = ({ onOpenCVModal }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [interactivePhoneMode, setInteractivePhoneMode] = useState(true);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.1, y: -0.2 });
  const currentRotation = useRef({ x: 0.1, y: -0.2 });
  const autoRotate = useRef(true);

  useEffect(() => {
    if (!mountRef.current || interactivePhoneMode) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5ff, 4, 20);
    cyanLight.position.set(5, 5, 5);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x7c4dff, 3.5, 20);
    violetLight.position.set(-5, -4, 4);
    scene.add(violetLight);

    // Master Group for 3D Device Monolith
    const monolithGroup = new THREE.Group();
    scene.add(monolithGroup);

    // Smartphone device signature sleek slab
    const phoneWidth = 2.45;
    const phoneHeight = 4.8;
    const phoneDepth = 0.22;
    const phoneGeo = new THREE.BoxGeometry(phoneWidth, phoneHeight, phoneDepth, 4, 4, 4);

    const phoneMat = new THREE.MeshPhysicalMaterial({
      color: 0x080b12,
      metalness: 0.85,
      roughness: 0.15,
      transmission: 0.35,
      thickness: 0.5,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
    monolithGroup.add(phoneMesh);

    // Glowing Neon Edge Wireframe
    const edgeGeo = new THREE.EdgesGeometry(phoneGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.75,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    monolithGroup.add(edgeLines);

    // Dynamic High-Res Screen Canvas (Smartphone UI View)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 1024;
    const ctx = screenCanvas.getContext('2d')!;

    let currentWeatherText = '29°C Sunny';
    const renderScreenUI = (timeText = getISTTime().time12, weatherText = currentWeatherText) => {
      // Dark Wallpaper
      const grad = ctx.createLinearGradient(0, 0, 512, 1024);
      grad.addColorStop(0, '#090C16');
      grad.addColorStop(0.5, '#05070D');
      grad.addColorStop(1, '#020306');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1024);

      // Punch hole camera simulation
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, 32, 10, 0, Math.PI * 2);
      ctx.fill();

      // Top status bar
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.fillText(timeText, 40, 48);

      ctx.fillStyle = '#00F5FF';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText('5G • 98% SMART PHONE', 270, 48);

      // Weather & Clock Widget
      ctx.fillStyle = 'rgba(15, 22, 38, 0.7)';
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.roundRect(35, 80, 442, 160, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px "Space Grotesk", sans-serif';
      ctx.fillText('Thirupuram, Trivandrum', 60, 126);

      ctx.fillStyle = '#00F5FF';
      ctx.font = '17px "JetBrains Mono", monospace';
      ctx.fillText(`${weatherText} • Flutter Engine 60 FPS`, 60, 166);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '14px "Space Grotesk", sans-serif';
      ctx.fillText('Professional Flutter Developer', 60, 204);

      // Smartphone App Icons Simulation (Profile, Gallery, Skills, Messages)
      const apps = [
        { name: 'Profile', color: '#00F5FF', icon: '👤' },
        { name: 'Gallery', color: '#EC4899', icon: '🖼️' },
        { name: 'Skills', color: '#7C4DFF', icon: '⚡' },
        { name: 'Messages', color: '#10B981', icon: '✉️' },
        { name: 'Chat App', color: '#00F5FF', icon: '💬' },
        { name: 'Gemini AI', color: '#7C4DFF', icon: '✨' },
        { name: 'Rally 3D', color: '#EF4444', icon: '🏎️' },
        { name: 'YouTube UI', color: '#EF4444', icon: '▶️' },
      ];

      apps.forEach((app, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const x = 55 + col * 110;
        const y = 280 + row * 125;

        // Squircle
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeStyle = `${app.color}66`;
        ctx.lineWidth = 2;
        ctx.roundRect(x, y, 70, 70, 20);
        ctx.fill();
        ctx.stroke();

        // Icon Emoji/Text
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(app.icon, x + 35, y + 45);

        // Name
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px "Space Grotesk", sans-serif';
        ctx.fillText(app.name, x + 35, y + 90);
        ctx.textAlign = 'left';
      });

      // Interactive Dart Live Reactive Engine Simulation Box
      ctx.fillStyle = 'rgba(124, 77, 255, 0.08)';
      ctx.strokeStyle = 'rgba(124, 77, 255, 0.35)';
      ctx.roundRect(35, 570, 442, 280, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7C4DFF';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillText('// SMART PHONE VIEW • FLUTTER ENGINE', 60, 615);

      ctx.fillStyle = '#00F5FF';
      ctx.fillText('class SoorathEngine extends FlutterApp {', 60, 655);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('  final state = BLoCState.reactive();', 60, 690);
      ctx.fillText('  final storage = HiveDatabase.offline();', 60, 725);
      ctx.fillText('  final ai = GeminiStream.connected();', 60, 760);
      ctx.fillStyle = '#FF2A85';
      ctx.fillText('  // 100% Cross-Platform Precision', 60, 795);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('}', 60, 825);

      // Bottom Navigation pill
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.roundRect(196, 990, 120, 6, 3);
      ctx.fill();
    };

    renderScreenUI();
    const screenTexture = new THREE.CanvasTexture(screenCanvas);

    fetchLiveWeather().then((w) => {
      currentWeatherText = `${w.temp}°C ${w.condition}`;
      renderScreenUI(getISTTime().time12, currentWeatherText);
      screenTexture.needsUpdate = true;
    });

    const clockInterval = setInterval(() => {
      renderScreenUI(getISTTime().time12, currentWeatherText);
      screenTexture.needsUpdate = true;
    }, 1000);
    const screenGeo = new THREE.PlaneGeometry(phoneWidth * 0.95, phoneHeight * 0.96);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      transparent: true,
      opacity: 0.98,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneDepth / 2 + 0.01;
    monolithGroup.add(screenMesh);

    // Orbiting Satellites: Flutter Prism & Architecture Badges
    const orbitGroup = new THREE.Group();
    monolithGroup.add(orbitGroup);

    const ringGeo = new THREE.TorusGeometry(3.3, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    orbitGroup.add(ring1);

    const prismGeo = new THREE.OctahedronGeometry(0.35, 0);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    orbitGroup.add(prismMesh);

    // Floating UI Badges
    const createTextBadge = (text: string, colorHex: string) => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 256;
      bCanvas.height = 80;
      const bCtx = bCanvas.getContext('2d')!;
      bCtx.fillStyle = 'rgba(7, 10, 18, 0.9)';
      bCtx.strokeStyle = colorHex;
      bCtx.lineWidth = 4;
      bCtx.roundRect(4, 4, 248, 72, 16);
      bCtx.fill();
      bCtx.stroke();

      bCtx.fillStyle = colorHex;
      bCtx.font = 'bold 22px "Space Grotesk", sans-serif';
      bCtx.textAlign = 'center';
      bCtx.fillText(text, 128, 48);

      const bTex = new THREE.CanvasTexture(bCanvas);
      const bMat = new THREE.MeshBasicMaterial({ map: bTex, transparent: true, side: THREE.DoubleSide });
      const bGeo = new THREE.PlaneGeometry(1.3, 0.4);
      return new THREE.Mesh(bGeo, bMat);
    };

    const badgeFlutter = createTextBadge('FLUTTER 60FPS', '#00F5FF');
    badgeFlutter.position.set(-2.2, 1.8, 0.5);
    orbitGroup.add(badgeFlutter);

    const badgeDart = createTextBadge('DART ARCHITECT', '#7C4DFF');
    badgeDart.position.set(2.2, -1.6, 0.5);
    orbitGroup.add(badgeDart);

    // Raycaster for click & hover interaction with 3D phone
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownPos = { x: 0, y: 0 };
    let mouseDownTime = 0;

    // Mouse tilt & Drag Orbit
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      autoRotate.current = false;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      mouseDownPos = { x: e.clientX, y: e.clientY };
      mouseDownTime = Date.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = normX;
      mouse.y = normY;

      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        targetRotation.current.y += deltaX * 0.007;
        targetRotation.current.x += deltaY * 0.007;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        targetRotation.current.y = normX * 0.45;
        targetRotation.current.x = -normY * 0.35 + 0.1;

        // Check if mouse is hovering over the 3D phone monolith
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(monolithGroup.children, true);
        if (intersects.length > 0) {
          container.style.cursor = 'pointer';
        } else {
          container.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging.current = false;
      const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      const timeElapsed = Date.now() - mouseDownTime;

      // Click detected (not a long drag rotation)
      if (dist < 12 && timeElapsed < 600) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(monolithGroup.children, true);

        // Clicked anywhere on or near the 3D phone
        if (intersects.length > 0 || dist < 6) {
          sound.playClick();
          setInteractivePhoneMode(true);
        }
      }
    };

    // Touch event handlers for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        autoRotate.current = false;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        mouseDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        mouseDownTime = Date.now();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
        targetRotation.current.y += deltaX * 0.007;
        targetRotation.current.x += deltaY * 0.007;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      isDragging.current = false;
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - mouseDownPos.x, touch.clientY - mouseDownPos.y);
        const timeElapsed = Date.now() - mouseDownTime;
        if (dist < 15 && timeElapsed < 600) {
          sound.playClick();
          setInteractivePhoneMode(true);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Render loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate.current && !isDragging.current) {
        targetRotation.current.y += 0.004;
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      monolithGroup.rotation.x = currentRotation.current.x;
      monolithGroup.rotation.y = currentRotation.current.y;
      monolithGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

      const orbitSpeed = elapsedTime * 0.8;
      prismMesh.position.set(
        Math.cos(orbitSpeed) * 3.3,
        Math.sin(orbitSpeed * 1.5) * 0.6,
        Math.sin(orbitSpeed) * 3.3
      );
      prismMesh.rotation.x += 0.02;
      prismMesh.rotation.y += 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(clockInterval);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      phoneGeo.dispose();
      phoneMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      screenTexture.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      prismGeo.dispose();
      prismMat.dispose();
    };
  }, [interactivePhoneMode]);

  return (
    <div
      className={`relative w-full ${
        interactivePhoneMode
          ? 'min-h-[640px] sm:min-h-[670px] py-1'
          : 'h-[620px] lg:h-[700px]'
      } flex items-center justify-center select-none group transition-all duration-300`}
    >
      {/* MODE 1: Interactive 3D WebGL Canvas Viewport */}
      {!interactivePhoneMode ? (
        <>
          <div
            ref={mountRef}
            className="w-full h-full cursor-pointer relative z-10"
            title="Click 3D phone to open interactive Smart Phone view, or drag to orbit"
          />
          {/* Bottom Interaction Hint Badge */}
          <div className="absolute bottom-3 sm:bottom-5 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050811]/90 border border-[#00F5FF]/40 text-[11px] font-mono text-slate-200 shadow-[0_0_20px_rgba(0,245,255,0.25)] backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-[#00F5FF] animate-ping" />
            <span className="text-[#00F5FF] font-bold">CLICK 3D PHONE</span>
            <span className="text-slate-400">&bull; To Interact</span>
          </div>
        </>
      ) : (
        /* MODE 2: Real Interactive Smart Phone View */
        <div className="relative z-20 py-2 animate-fadeIn w-full flex items-center justify-center">
          <SmartPhoneView
            onOpenCVModal={onOpenCVModal}
            onSwitchTo3D={() => setInteractivePhoneMode(false)}
          />
        </div>
      )}

      {/* Top HUD Switcher: Smart Phone View (Only visible in 3D orbit mode) */}
      {!interactivePhoneMode && (
        <div className="absolute top-4 left-4 z-30 pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setInteractivePhoneMode(true);
            }}
            onMouseEnter={() => sound.playHover()}
            className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-mono font-bold tracking-wider text-[#00F5FF] bg-[#050811]/90 border border-[#00F5FF]/50 hover:bg-[#00F5FF]/20 hover:border-[#00F5FF] hover:shadow-[0_0_25px_rgba(0,245,255,0.4)] transition-all flex items-center gap-2 shadow-lg backdrop-blur-xl"
          >
            <Smartphone className="w-4 h-4 text-[#00F5FF]" />
            <span>Smart Phone view</span>
          </button>
        </div>
      )}

      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[340px] h-[340px] lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-tr from-[#00F5FF]/15 via-[#3D5AFE]/10 to-[#7C4DFF]/20 blur-3xl opacity-80" />
      </div>
    </div>
  );
};
