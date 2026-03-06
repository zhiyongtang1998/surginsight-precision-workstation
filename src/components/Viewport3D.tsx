import React from 'react';

interface Viewport3DProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  loading: boolean;
}

export function Viewport3D({ canvasRef, loading }: Viewport3DProps) {
  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 animate-pulse">
            Loading Model...
          </span>
        </div>
      )}
    </div>
  );
}
