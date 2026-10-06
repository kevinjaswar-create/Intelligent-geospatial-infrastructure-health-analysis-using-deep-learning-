import React, { useState } from 'react';
import { Defect } from '../../types';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles, Cpu } from 'lucide-react';

interface ImageDetectionCanvasProps {
  imageUrl: string;
  defects: Defect[];
  activeDefectId?: string | null;
  onHoverDefect?: (id: string | null) => void;
  engineUsed?: 'gemini_flash_vision' | 'benchmark_yolo_v11_sim';
  isMock?: boolean;
}

export const ImageDetectionCanvas: React.FC<ImageDetectionCanvasProps> = ({
  imageUrl,
  defects,
  activeDefectId,
  onHoverDefect,
  engineUsed,
  isMock = false,
}) => {
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-rose-500',
          bg: 'bg-rose-500/15',
          text: 'bg-rose-600 text-white',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]',
        };
      case 'HIGH':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-500/15',
          text: 'bg-amber-600 text-white',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        };
      case 'MEDIUM':
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-400/15',
          text: 'bg-yellow-500 text-slate-950 font-bold',
          glow: 'shadow-[0_0_10px_rgba(250,204,21,0.4)]',
        };
      default:
        return {
          border: 'border-cyan-400',
          bg: 'bg-cyan-400/15',
          text: 'bg-cyan-600 text-white',
          glow: 'shadow-[0_0_10px_rgba(34,211,238,0.4)]',
        };
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {engineUsed === 'gemini_flash_vision' && !isMock ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deep Learning (Gemini 3.8 Flash Vision)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Benchmark YOLO v11 Inference (Calibrated Sim)</span>
            </span>
          )}

          <span className="text-slate-400 font-mono">
            {defects.length} Defect Bounding {defects.length === 1 ? 'Box' : 'Boxes'}
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              showBoxes
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Boxes {showBoxes ? 'On' : 'Off'}</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full overflow-auto flex items-center justify-center p-4 min-h-[460px] max-h-[640px] bg-slate-950/60 select-none">
        <div
          className="relative inline-block transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <img
            src={imageUrl}
            alt="Infrastructure Defect Inspection Target"
            className="block max-w-full max-h-[560px] object-contain rounded-xl border border-slate-800 shadow-2xl pointer-events-none"
          />

          {/* Bounding Boxes Layer */}
          {showBoxes &&
            defects.map((defect) => {
              const isActive = activeDefectId === defect.id;
              const styleColor = getSeverityColor(defect.severity);

              return (
                <div
                  key={defect.id}
                  onMouseEnter={() => onHoverDefect?.(defect.id)}
                  onMouseLeave={() => onHoverDefect?.(null)}
                  className={`absolute rounded transition-all duration-150 cursor-pointer ${
                    styleColor.border
                  } ${styleColor.bg} border-2 ${
                    isActive ? `border-[3px] scale-[1.02] z-30 ${styleColor.glow}` : 'z-20 hover:scale-[1.01]'
                  }`}
                  style={{
                    left: `${defect.boundingBox.x}%`,
                    top: `${defect.boundingBox.y}%`,
                    width: `${defect.boundingBox.width}%`,
                    height: `${defect.boundingBox.height}%`,
                  }}
                >
                  {/* Bounding Box Header Tag */}
                  <div
                    className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 shadow-lg pointer-events-none whitespace-nowrap ${styleColor.text}`}
                  >
                    <Crosshair className="w-2.5 h-2.5" />
                    <span>
                      {defect.type.replace('_', ' ')} ({(defect.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Corner Crosshairs */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none"></div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Canvas Footer Note */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Normalized Coordinate Spatial Calibration (SVG Projection Matrix)</span>
        </span>
        <span className="font-mono text-slate-400">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
