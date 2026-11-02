import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Save, FileText, Check } from 'lucide-react';
import { sound } from '../../audio/audioEngine';

interface NotesAppProps {
  isSPenActive?: boolean;
}

export const NotesApp: React.FC<NotesAppProps> = ({ isSPenActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00F5FF');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'text'>('draw');
  const [textContent, setTextContent] = useState(
    '// Pullingal Soorath - Flutter Notes\n• Refactored BLoC state machine to Cubit for instant response.\n• Tested mobile gesture physics and animations.\n• SQFlite local offline sync pipeline verified at 60 FPS.'
  );
  const [savedAlert, setSavedAlert] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial canvas setup
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    sound.playHover();

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#0f172a' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sound.playClick();
  };

  const handleSave = () => {
    sound.playSuccess();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const palette = ['#00F5FF', '#F59E0B', '#EC4899', '#10B981', '#FFFFFF', '#7C4DFF'];

  return (
    <div className="flex flex-col h-full space-y-2 text-white animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#00F5FF]" />
          <span className="font-space font-bold text-xs">Smart Notes</span>
        </div>

        <div className="flex items-center gap-2">
          {isSPenActive && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00F5FF] border border-cyan-500/30 animate-pulse">
              S-Pen Active
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00F5FF] text-xs font-mono transition-all"
          >
            {savedAlert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedAlert ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-xl text-xs font-mono">
        <button
          onClick={() => setActiveTab('draw')}
          className={`flex-1 py-1 rounded-lg transition-all ${
            activeTab === 'draw' ? 'bg-[#00F5FF] text-black font-bold' : 'text-slate-400'
          }`}
        >
          S-Pen Drawing
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-1 rounded-lg transition-all ${
            activeTab === 'text' ? 'bg-[#00F5FF] text-black font-bold' : 'text-slate-400'
          }`}
        >
          Text Notes
        </button>
      </div>

      {activeTab === 'draw' ? (
        <div className="flex flex-col flex-1 space-y-2">
          {/* Drawing Tool Toolbar */}
          <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setIsEraser(false);
                    sound.playClick();
                  }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    color === c && !isEraser ? 'scale-125 ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/5">
                {[2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setLineWidth(w);
                      sound.playClick();
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                      lineWidth === w ? 'bg-[#00F5FF] text-black font-bold' : 'text-slate-400'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsEraser(!isEraser);
                  sound.playClick();
                }}
                className={`p-1.5 rounded-lg ${
                  isEraser ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>

              <button
                onClick={clearCanvas}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="relative flex-1 bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={300}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
            {!isDrawing && (
              <div className="absolute bottom-2 left-2 pointer-events-none text-[10px] font-mono text-slate-600">
                Draw with mouse or S-Pen stylus
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="flex-1 w-full bg-slate-950 p-3 rounded-2xl border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00F5FF] resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
