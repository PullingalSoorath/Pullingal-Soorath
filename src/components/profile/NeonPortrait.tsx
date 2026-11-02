import React, { useState, useRef } from 'react';

interface NeonPortraitProps {
  imageSrc?: string;
  variant?: 'card' | 'frameless';
  className?: string;
}

export const NeonPortrait: React.FC<NeonPortraitProps> = ({
  imageSrc = './profile-neon.jpg',
  variant: initialVariant = 'card',
  className = '',
}) => {
  const [variant, setVariant] = useState<'card' | 'frameless'>(initialVariant);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || variant === 'frameless') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Interactive Variant Toggle Pill */}
      <div className="flex items-center gap-1.5 p-1 mb-4 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-[11px] font-mono z-20">
        <button
          onClick={() => setVariant('card')}
          className={`px-3 py-1 rounded-full transition-all ${
            variant === 'card'
              ? 'bg-gradient-to-r from-[#00F5FF]/20 to-[#FF0080]/20 text-white border border-[#00F5FF]/50 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Option A: Cyber Card
        </button>
        <button
          onClick={() => setVariant('frameless')}
          className={`px-3 py-1 rounded-full transition-all ${
            variant === 'frameless'
              ? 'bg-gradient-to-r from-[#00F5FF]/20 to-[#FF0080]/20 text-white border border-[#FF0080]/50 shadow-[0_0_12px_rgba(255,0,128,0.25)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Option B: Frameless
        </button>
      </div>

      {/* Main Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: '1000px',
        }}
        className="relative group w-full max-w-[340px] sm:max-w-[380px]"
      >
        {/* ========================================================
            DUAL-TONE AMBIENT BACKLIGHT GLOW (Cyan Left & Magenta Right)
            ======================================================== */}
        {/* Left Glow (Cyan / Electric Blue) */}
        <div
          className={`absolute -inset-2 -left-6 top-1/4 w-40 h-64 rounded-full bg-[#00F5FF] blur-[70px] pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-40 scale-110' : 'opacity-25'
          }`}
        />

        {/* Right Glow (Magenta / Hot Pink) */}
        <div
          className={`absolute -inset-2 -right-6 top-1/4 w-40 h-64 rounded-full bg-[#FF0080] blur-[70px] pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-40 scale-110' : 'opacity-25'
          }`}
        />

        {/* ========================================================
            OPTION A: HOLOGRAPHIC CYBER CARD
            ======================================================== */}
        {variant === 'card' && (
          <div
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
                isHovered ? 'scale3d(1.03, 1.03, 1.03)' : 'scale3d(1, 1, 1)'
              }`,
              transition: isHovered
                ? 'transform 0.1s ease-out'
                : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="relative rounded-3xl p-2 bg-[#0c101c]/70 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,245,255,0.15)] group-hover:border-[#00F5FF]/40 transition-colors duration-500"
          >
            {/* Glowing Tech HUD Corner Accents */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00F5FF] rounded-tl-lg pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#FF0080] rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00F5FF] rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#FF0080] rounded-br-lg pointer-events-none" />

            {/* Image Wrapper */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#05060A]">
              <img
                src={imageSrc}
                alt="Pullingal Soorath - Dual-Tone Neon Portrait"
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'scale-105 contrast-110 saturate-110' : 'scale-100'
                }`}
              />

              {/* Seamless Vignette & Bottom Edge Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />

              {/* Bottom Holographic Profile Tag */}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[#070b14]/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-space text-white flex items-center gap-1.5">
                    <span>Pullingal Soorath</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-mono text-[#00F5FF]">Flutter &bull; UI/UX &bull; Web Designer</div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FF0080]/20 text-[#FF0080] border border-[#FF0080]/40 font-bold">
                  FLUTTER PRO
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            OPTION B: FRAMELESS HERO INTEGRATION (Seamless Vignette Mask)
            ======================================================== */}
        {variant === 'frameless' && (
          <div className="relative aspect-[3/4] w-full overflow-hidden transition-all duration-500 group-hover:scale-105">
            {/* CSS Radial & Linear Vignette Mask for 100% Seamless Blend */}
            <div
              style={{
                WebkitMaskImage:
                  'radial-gradient(circle at 50% 45%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 75%, rgba(0,0,0,0) 98%), linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                maskImage:
                  'radial-gradient(circle at 50% 45%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 75%, rgba(0,0,0,0) 98%), linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                WebkitMaskComposite: 'destination-in',
                maskComposite: 'intersect',
              }}
              className="relative w-full h-full"
            >
              <img
                src={imageSrc}
                alt="Pullingal Soorath - Frameless Neon Portrait"
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'scale-105 contrast-110 saturate-110' : 'scale-100'
                }`}
              />

              {/* Edge Gradient Falloff Overlay into Background #05060A */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#05060A]/40 via-transparent to-[#05060A]/40 pointer-events-none" />
            </div>

            {/* Subtle Floating Coordinates Badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1.5 whitespace-nowrap shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]" />
              <span>PS // THIRUPURAM, TRIVANDRUM, KERALA</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
