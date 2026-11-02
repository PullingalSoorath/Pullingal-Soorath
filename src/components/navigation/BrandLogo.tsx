import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8', showText = true }) => {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="relative flex items-center justify-center p-1 rounded-xl bg-slate-900/80 border border-[#00F5FF]/30 group-hover:border-[#00F5FF] transition-all shadow-[0_0_15px_rgba(0,245,255,0.25)]">
        <img
          src="./ps-logo.png"
          alt="Pullingal Soorath Logo"
          className={`${className} w-auto object-contain transition-transform group-hover:scale-105`}
        />
        <div className="absolute inset-0 rounded-xl bg-[#00F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-orbitron font-extrabold text-xs tracking-wider text-white">
              PULLINGAL SOORATH
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden lg:inline tracking-tight">
            Flutter Dev &bull; UI/UX &bull; Web
          </span>
        </div>
      )}
    </div>
  );
};
