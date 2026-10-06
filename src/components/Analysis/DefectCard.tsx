import React from 'react';
import { Defect } from '../../types';
import { AlertCircle, AlertTriangle, ShieldCheck, Ruler, ArrowRight, Wrench } from 'lucide-react';

interface DefectCardProps {
  defect: Defect;
  isActive?: boolean;
  onHover?: (id: string | null) => void;
  onClickAction?: (defect: Defect) => void;
}

export const DefectCard: React.FC<DefectCardProps> = ({
  defect,
  isActive = false,
  onHover,
  onClickAction,
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
        };
      default:
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
        };
    }
  };

  const badge = getSeverityBadge(defect.severity);

  return (
    <div
      onMouseEnter={() => onHover?.(defect.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`p-3.5 rounded-xl border transition-all duration-150 ${
        isActive
          ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40 translate-x-1'
          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100 text-sm capitalize">
            {defect.type.replace('_', ' ')}
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
            {(defect.confidence * 100).toFixed(0)}% conf
          </span>
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${badge.bg}`}
        >
          {badge.icon}
          <span>{defect.severity}</span>
        </span>
      </div>

      {/* Metric details */}
      <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/50 rounded border border-slate-800/60">
          <Ruler className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Dim:</span>
          <span className="font-mono font-medium text-slate-200">{defect.estimatedDimensions}</span>
        </div>

        {defect.depthEstimateMm && (
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/50 rounded border border-slate-800/60">
            <span className="text-slate-400">Est Depth:</span>
            <span className="font-mono font-medium text-amber-300">{defect.depthEstimateMm} mm</span>
          </div>
        )}
      </div>

      {/* Engineering Recommendation */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs">
        <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="text-slate-400 text-[11px] block">Recommended Remediation:</span>
          <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">{defect.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
};
