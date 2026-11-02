import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const BackgroundCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL availability
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

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x05060a, 1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.025);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    // 1. Fluid Wave Grid Mesh
    const gridWidth = 70;
    const gridDepth = 60;
    const segmentsX = 64;
    const segmentsZ = 64;
    const geometry = new THREE.PlaneGeometry(gridWidth, gridDepth, segmentsX, segmentsZ);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -4, 0);

    // Store base positions for fluid simulation
    const posAttr = geometry.attributes.position;
    const basePositions = new Float32Array(posAttr.array.length);
    for (let i = 0; i < posAttr.array.length; i++) {
      basePositions[i] = posAttr.array[i];
    }

    const material = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const waveMesh = new THREE.Mesh(geometry, material);
    scene.add(waveMesh);

    // 2. Bioluminescent floating particle constellation
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00f5ff);
    const colorCobalt = new THREE.Color(0x3d5afe);
    const colorViolet = new THREE.Color(0x7c4dff);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 60;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 30 + 2;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 50;

      particleScales[i] = Math.random() * 2.5 + 0.5;

      const rand = Math.random();
      const c = rand < 0.5 ? colorCyan : rand < 0.8 ? colorCobalt : colorViolet;
      particleColors[i3] = c.r;
      particleColors[i3 + 1] = c.g;
      particleColors[i3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom circular glowing particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(0, 245, 255, 0.8)');
      grad.addColorStop(0.8, 'rgba(124, 77, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse coordinates
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Handle Resize
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse easing
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Camera parallax tilt
      camera.position.x = mouseX * 2.5;
      camera.position.y = 5 + mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      // Continuous wave oscillations (Multi-octave sine fluid dynamics)
      const positions = waveMesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = basePositions[i];
        const z = basePositions[i + 2];

        // Complex wave function
        const wave1 = Math.sin(x * 0.15 + elapsedTime * 0.9) * 1.2;
        const wave2 = Math.cos(z * 0.18 + elapsedTime * 0.7) * 1.0;
        const wave3 = Math.sin((x + z) * 0.08 + elapsedTime * 1.2) * 0.6;
        const mouseRipple = Math.exp(-((x - mouseX * 10) ** 2 + (z - mouseY * 10) ** 2) / 60) * 1.5;

        positions[i + 1] = basePositions[i + 1] + wave1 + wave2 + wave3 + mouseRipple;
      }
      waveMesh.geometry.attributes.position.needsUpdate = true;

      // Particle subtle flow & drift
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pPositions[i3 + 1] += Math.sin(elapsedTime * 0.6 + i) * 0.015;
        pPositions[i3] += Math.cos(elapsedTime * 0.3 + i) * 0.01;

        // Wrap around bounds
        if (pPositions[i3 + 1] > 20) pPositions[i3 + 1] = -10;
        if (pPositions[i3 + 1] < -10) pPositions[i3 + 1] = 20;
      }
      particleGeo.attributes.position.needsUpdate = true;

      particles.rotation.y = elapsedTime * 0.02 + mouseX * 0.15;
      particles.rotation.x = mouseY * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};
