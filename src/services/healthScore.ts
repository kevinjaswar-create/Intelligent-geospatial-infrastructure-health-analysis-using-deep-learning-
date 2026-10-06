import { Defect, HealthStatus, HealthScoreConfig } from '../types';

export const DEFAULT_HEALTH_CONFIG: HealthScoreConfig = {
  baseScore: 100,
  criticalPenalty: 22,
  highPenalty: 12,
  mediumPenalty: 6,
  lowPenalty: 2.5,
  ageDegradationFactor: 0.15, // points deducted per decade of age
  confidenceWeighting: true,
};

export interface HealthScoreResult {
  score: number;
  status: HealthStatus;
  penaltyBreakdown: {
    criticalPenalty: number;
    highPenalty: number;
    mediumPenalty: number;
    lowPenalty: number;
    agePenalty: number;
    totalDeductions: number;
  };
  explanation: string;
  disclaimer: string;
}

export function calculateHealthScore(
  defects: Defect[],
  constructedYear?: number,
  config: HealthScoreConfig = DEFAULT_HEALTH_CONFIG
): HealthScoreResult {
  let criticalPenalty = 0;
  let highPenalty = 0;
  let mediumPenalty = 0;
  let lowPenalty = 0;

  for (const defect of defects) {
    // Confidence weighting: higher confidence defects exert their full calibrated penalty
    const weight = config.confidenceWeighting ? Math.max(0.6, defect.confidence) : 1.0;

    switch (defect.severity) {
      case 'CRITICAL':
        criticalPenalty += config.criticalPenalty * weight;
        break;
      case 'HIGH':
        highPenalty += config.highPenalty * weight;
        break;
      case 'MEDIUM':
        mediumPenalty += config.mediumPenalty * weight;
        break;
      case 'LOW':
        lowPenalty += config.lowPenalty * weight;
        break;
    }
  }

  // Age factor deduction (relative to current year ~ 2026)
  let agePenalty = 0;
  if (constructedYear && constructedYear > 1900 && constructedYear <= 2026) {
    const ageYears = 2026 - constructedYear;
    agePenalty = (ageYears / 10) * config.ageDegradationFactor;
  }

  const totalDeductions = criticalPenalty + highPenalty + mediumPenalty + lowPenalty + agePenalty;
  const rawScore = Math.max(0, Math.min(100, Math.round(config.baseScore - totalDeductions)));

  let status: HealthStatus = 'HEALTHY';
  if (rawScore < 20) {
    status = 'CRITICAL';
  } else if (rawScore < 40) {
    status = 'POOR';
  } else if (rawScore < 70) {
    status = 'MODERATE';
  } else if (rawScore < 90) {
    status = 'GOOD';
  } else {
    status = 'HEALTHY';
  }

  let explanation = '';
  if (defects.length === 0) {
    explanation = 'No surface or structural distress detected. Nominal serviceability index maintained.';
  } else {
    const defectTypes = Array.from(new Set(defects.map(d => d.type.replace('_', ' ')))).join(', ');
    explanation = `Identified ${defects.length} defect(s) (${defectTypes}) resulting in a total deduction of ${totalDeductions.toFixed(1)} points.`;
  }

  return {
    score: rawScore,
    status,
    penaltyBreakdown: {
      criticalPenalty: Math.round(criticalPenalty * 10) / 10,
      highPenalty: Math.round(highPenalty * 10) / 10,
      mediumPenalty: Math.round(mediumPenalty * 10) / 10,
      lowPenalty: Math.round(lowPenalty * 10) / 10,
      agePenalty: Math.round(agePenalty * 10) / 10,
      totalDeductions: Math.round(totalDeductions * 10) / 10,
    },
    explanation,
    disclaimer: 'Application-Generated Assessment (GeoInfra Index v2.4). Consult licensed civil/structural engineers for formal compliance certifications.',
  };
}

export function getHealthStatusColor(status: HealthStatus): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  dot: string;
} {
  switch (status) {
    case 'HEALTHY':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dot: 'bg-emerald-400',
      };
    case 'GOOD':
      return {
        bg: 'bg-teal-500/10',
        text: 'text-teal-400',
        border: 'border-teal-500/30',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        dot: 'bg-teal-400',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-400',
      };
    case 'POOR':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        dot: 'bg-orange-400',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-500 animate-pulse',
      };
  }
}
