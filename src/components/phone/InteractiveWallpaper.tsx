import React, { useEffect, useRef } from 'react';

interface InteractiveWallpaperProps {
  theme: string;
  isLandscape?: boolean;
}

export const InteractiveWallpaper: React.FC<InteractiveWallpaperProps> = ({ theme, isLandscape = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const getParentSize = () => {
      const p = canvas.parentElement;
      const defaultW = isLandscape ? 1000 : 360;
      const defaultH = isLandscape ? 620 : 700;
      const w = p?.clientWidth ? Math.max(p.clientWidth, defaultW) : defaultW;
      const h = p?.clientHeight ? Math.max(p.clientHeight, 400) : defaultH;
      return { w, h };
    };

    let { w: width, h: height } = getParentSize();
    canvas.width = width;
    canvas.height = height;

    const ripples: { x: number; y: number; r: number; alpha: number }[] = [];

    // Dense particle constellation across the full width and height
    const targetParticleCount = isLandscape ? 115 : 55;
    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];

    const spawnParticles = (w: number, h: number, count: number) => {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    spawnParticles(width, height, targetParticleCount);

    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      const curW = p?.clientWidth || width;
      const curH = p?.clientHeight || height;
      if (curW > 0 && curH > 0 && (canvas.width !== curW || canvas.height !== curH)) {
        const oldW = width || curW;
        canvas.width = curW;
        canvas.height = curH;
        width = curW;
        height = curH;

        // Smoothly scale particle positions across the newly expanded canvas
        particles.forEach((pt) => {
          if (oldW > 0 && curW > oldW) {
            pt.x = (pt.x / oldW) * width;
          }
          if (pt.x > width) pt.x = Math.random() * width;
          if (pt.y > height) pt.y = Math.random() * height;
        });

        // Ensure we maintain full density across the entire widescreen
        const expectedCount = curW > 600 ? 115 : 55;
        while (particles.length < expectedCount) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.42,
            vy: (Math.random() - 0.5) * 0.42,
            radius: Math.random() * 2 + 1,
          });
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener('resize', handleResize);

    // Staggered size sync throughout 2000ms transition
    const timers = [
      setTimeout(handleResize, 100),
      setTimeout(handleResize, 300),
      setTimeout(handleResize, 600),
      setTimeout(handleResize, 1000),
      setTimeout(handleResize, 1500),
      setTimeout(handleResize, 2050),
    ];

    const getColors = () => {
      switch (theme) {
        case 'neon':
          return { primary: '#7C4DFF', secondary: '#EC4899', bg1: '#0d0717', bg2: '#050209' };
        case 'aurora':
          return { primary: '#10B981', secondary: '#00F5FF', bg1: '#031412', bg2: '#020708' };
        case 'titanium':
          return { primary: '#94A3B8', secondary: '#E2E8F0', bg1: '#0e1117', bg2: '#06070a' };
        default: // cyber
          return { primary: '#00F5FF', secondary: '#3D5AFE', bg1: '#070b14', bg2: '#030509' };
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      ripples.push({ x, y, r: 5, alpha: 0.8 });
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown);

    let time = 0;
    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.02;

      // Continuously sync canvas buffer to parent width/height during 2000ms transition
      if (canvas.parentElement) {
        const curW = canvas.parentElement.clientWidth;
        const curH = canvas.parentElement.clientHeight;
        if (curW > 0 && curH > 0 && (canvas.width !== curW || canvas.height !== curH)) {
          const oldW = width || curW;
          canvas.width = curW;
          canvas.height = curH;
          width = curW;
          height = curH;

          particles.forEach((pt) => {
            if (oldW > 0 && curW > oldW) {
              pt.x = (pt.x / oldW) * width;
            }
            if (pt.x > width) pt.x = Math.random() * width;
            if (pt.y > height) pt.y = Math.random() * height;
          });

          const neededCount = curW > 600 ? 115 : 55;
          while (particles.length < neededCount) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * 0.42,
              vy: (Math.random() - 0.5) * 0.42,
              radius: Math.random() * 2 + 1,
            });
          }
        }
      }

      const colors = getColors();

      // Deep cyber background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, colors.bg1);
      bgGrad.addColorStop(1, colors.bg2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial fluid glow
      const radial = ctx.createRadialGradient(
        width * 0.65 + Math.sin(time * 0.8) * 50,
        height * 0.35 + Math.cos(time * 0.6) * 60,
        15,
        width * 0.65,
        height * 0.35,
        width * 0.85
      );
      radial.addColorStop(0, `${colors.primary}22`);
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Inter-particle glowing constellation lines (covers the full screen)
      const maxConnectDist = isLandscape ? 85 : 70;
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.18;
            ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particle constellation
      ctx.fillStyle = colors.primary;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Interactive touch ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 3.5;
        r.alpha -= 0.02;

        ctx.strokeStyle = `rgba(0, 245, 255, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();

        if (r.alpha <= 0) {
          ripples.splice(i, 1);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      timers.forEach((t) => clearTimeout(t));
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
    };
  }, [theme, isLandscape]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
    />
  );
};
