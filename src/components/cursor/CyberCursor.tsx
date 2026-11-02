import React, { useEffect, useState, useRef } from 'react';

export const CyberCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable custom cursor for non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, select, [data-interactive="true"]');
        setIsHovering(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updateCursor = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.22);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.22);

      setPos({ x: currentPos.current.x, y: currentPos.current.y });
      animFrameId.current = requestAnimationFrame(updateCursor);
    };

    animFrameId.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer reticle / ring */}
      <div
        className="fixed rounded-full transition-transform duration-100 ease-out flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovering ? '52px' : isClicking ? '26px' : '36px',
          height: isHovering ? '52px' : isClicking ? '26px' : '36px',
          border: isHovering
            ? '1.5px solid #00F5FF'
            : '1px solid rgba(0, 245, 255, 0.45)',
          boxShadow: isHovering
            ? '0 0 16px rgba(0, 245, 255, 0.6), inset 0 0 8px rgba(0, 245, 255, 0.3)'
            : '0 0 8px rgba(0, 245, 255, 0.2)',
          transition: 'width 0.2s, height 0.2s, border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {isHovering && (
          <div className="absolute w-2 h-2 rounded-full bg-[#00F5FF] animate-ping opacity-75" />
        )}
      </div>

      {/* Center pinpoint */}
      <div
        className="fixed w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#00F5FF]"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          boxShadow: '0 0 6px #00F5FF, 0 0 12px #3D5AFE',
        }}
      />
    </div>
  );
};
