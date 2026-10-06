import React, { useState, useEffect } from 'react';
import { HealthScoreConfig, AuditLog } from '../types';
import { api } from '../services/api';
import { DEFAULT_HEALTH_CONFIG } from '../services/healthScore';
import {
  Sliders,
  Shield,
  Activity,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [config, setConfig] = useState<HealthScoreConfig>(DEFAULT_HEALTH_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [configData, logsData] = await Promise.all([
          api.getHealthConfig(),
          api.getAuditLogs(),
        ]);
        setConfig(configData);
        setAuditLogs(logsData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateHealthConfig(config);
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update scoring formula configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_HEALTH_CONFIG);
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Formula Calibration & System Audit
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure application health scoring formula weights and inspect complete system activity trail
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scoring Formula Configurator (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  Health Index Formula Weights (GHI v2.4)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Base Maximum Score
                  </label>
                  <input
                    type="number"
                    value={config.baseScore}
                    onChange={(e) =>
                      setConfig({ ...config, baseScore: parseFloat(e.target.value) || 100 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Maximum healthy score index</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Critical Defect Deduction
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.criticalPenalty}
                    onChange={(e) =>
                      setConfig({ ...config, criticalPenalty: parseFloat(e.target.value) || 22 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-rose-400 font-mono text-xs focus:outline-none focus:border-cyan-500 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Points subtracted per critical defect</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    High Defect Deduction
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.highPenalty}
                    onChange={(e) =>
                      setConfig({ ...config, highPenalty: parseFloat(e.target.value) || 12 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono text-xs focus:outline-none focus:border-cyan-500 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Points subtracted per high defect</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Medium Defect Deduction
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.mediumPenalty}
                    onChange={(e) =>
                      setConfig({ ...config, mediumPenalty: parseFloat(e.target.value) || 6 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-yellow-400 font-mono text-xs focus:outline-none focus:border-cyan-500 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Points subtracted per medium defect</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Low Defect Deduction
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.lowPenalty}
                    onChange={(e) =>
                      setConfig({ ...config, lowPenalty: parseFloat(e.target.value) || 2.5 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Points subtracted per low defect</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Age Degradation (per decade)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={config.ageDegradationFactor}
                    onChange={(e) =>
                      setConfig({ ...config, ageDegradationFactor: parseFloat(e.target.value) || 0.15 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Decay factor per 10 years of structure age</p>
                </div>
              </div>

              {/* Confidence Weighting Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">AI Confidence Scaling</span>
                  <span className="text-[10px] text-slate-400">
                    Scale defect impact dynamically by detection confidence probability
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.confidenceWeighting}
                  onChange={(e) => setConfig({ ...config, confidenceWeighting: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Scoring formula calibration updated successfully.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Formula Calibration'}</span>
              </button>
            </form>
          </div>

          {/* Role Permissions Matrix Card */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">Role-Based Access Control (RBAC)</h3>
            </div>

            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="font-bold text-cyan-300">ADMIN:</span> Full permissions to calibrate formulas, delete assets, configure users, and oversee all work orders.
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="font-bold text-cyan-300">ENGINEER / INSPECTOR:</span> Execute computer vision scans, register assets, and dispatch maintenance work orders.
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="font-bold text-cyan-300">VIEWER:</span> Read-only visibility into GIS map telemetry, condition reports, and dashboard statistics.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Audit Logs Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">System Activity & Audit Trail</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">{auditLogs.length} Records</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed">{log.details}</p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>User: <strong className="text-slate-300">{log.userName}</strong></span>
                    <span>•</span>
                    <span>Role: <strong className="text-slate-300">{log.userRole}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
