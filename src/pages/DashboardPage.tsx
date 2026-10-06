import React, { useEffect, useState } from 'react';
import {
  InfrastructureAsset,
  AIAnalysisResult,
  WorkOrder,
  DashboardStatistics,
} from '../types';
import { api } from '../services/api';
import { getHealthStatusColor } from '../services/healthScore';
import { GISMap } from '../components/Map/GISMap';
import {
  ShieldAlert,
  Building2,
  Sparkles,
  Wrench,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ArrowUpRight,
  MapPin,
  Clock,
  Activity,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToMap: () => void;
  onNavigateToAnalysis: (assetId?: string) => void;
  onNavigateToMaintenance: () => void;
  onNavigateToAsset: (assetId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToMap,
  onNavigateToAnalysis,
  onNavigateToMaintenance,
  onNavigateToAsset,
}) => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<AIAnalysisResult[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, infraData, analysesData, ordersData] = await Promise.all([
          api.getDashboardStats(),
          api.getInfrastructure(),
          api.getAnalyses(),
          api.getWorkOrders(),
        ]);
        setStats(statsData);
        setAssets(infraData);
        setRecentAnalyses(analysesData.slice(0, 3));
        setWorkOrders(ordersData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-sm font-medium">Synthesizing Geospatial Health Telemetry...</span>
        </div>
      </div>
    );
  }

  // Sort critical priority assets
  const priorityAssets = [...assets]
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 4);

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 border border-slate-800 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Predictive Infrastructure Health Intelligence</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Metropolitan Corridor Infrastructure Status
          </h1>

          <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
            Real-time geospatial monitoring, deep learning defect recognition, and damage severity
            scoring across transportation corridors, bridges, and highway networks.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateToAnalysis()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Deep Learning Inspection</span>
            </button>

            <button
              onClick={onNavigateToMap}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Explore GIS Spatial Map</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Assets */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Assets</span>
            <Building2 className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats?.totalAssets || 0}</div>
          <p className="text-[10px] text-slate-400">Monitored corridor nodes</p>
        </div>

        {/* Average Health Score */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Health Index</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {stats?.averageHealthScore || 0}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[10px] text-slate-400">Application assessment</p>
        </div>

        {/* Healthy Assets */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/20 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Healthy</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{stats?.healthyCount || 0}</div>
          <p className="text-[10px] text-emerald-400/80">Score ≥ 90 (Nominal)</p>
        </div>

        {/* Moderate Deficiencies */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Moderate</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{stats?.moderateCount || 0}</div>
          <p className="text-[10px] text-amber-400/80">Score 40 - 69</p>
        </div>

        {/* Critical Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-500/30 shadow-lg space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/10 rounded-bl-full"></div>
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Critical</span>
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{stats?.criticalCount || 0}</div>
          <p className="text-[10px] text-rose-400/80">Urgent Intervention (Score &lt; 20)</p>
        </div>

        {/* Pending Work Orders */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Work Orders</span>
            <Wrench className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">{stats?.pendingWorkOrders || 0}</div>
          <p className="text-[10px] text-slate-400">Active maintenance tasks</p>
        </div>
      </div>

      {/* Main Grid: GIS Preview & High-Priority Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GIS Map Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-slate-200 text-sm">Geospatial Health Corridor Overview</h2>
            </div>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Screen GIS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <GISMap
            assets={assets}
            heightClass="h-[380px]"
            showFilters={false}
            onSelectAsset={(asset) => onNavigateToAsset(asset.id)}
            onInspectAsset={(asset) => onNavigateToAnalysis(asset.id)}
          />
        </div>

        {/* Priority Action Queue (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="font-bold text-slate-200 text-sm">High-Priority Maintenance Queue</h2>
            </div>
            <button
              onClick={onNavigateToMaintenance}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              View Queue
            </button>
          </div>

          <div className="space-y-2.5">
            {priorityAssets.map((asset) => {
              const color = getHealthStatusColor(asset.healthStatus);
              return (
                <div
                  key={asset.id}
                  onClick={() => onNavigateToAsset(asset.id)}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:translate-x-1 shadow-md flex items-center gap-3"
                >
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate">
                        {asset.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.badge}`}>
                        {asset.healthStatus}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-100 text-xs truncate mt-0.5">
                      {asset.name}
                    </h4>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className={`font-mono font-bold ${color.text}`}>
                        {asset.healthScore}/100 Score
                      </span>
                      <span>•</span>
                      <span>{asset.defectCount} Deficiencies</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Defect Class Distribution & Recent Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defect Distribution (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">Defect Class Breakdown</h3>
            <span className="text-xs text-slate-400 font-mono">CV Classes</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Potholes & Cavities</span>
                <span className="font-mono text-rose-400 font-bold">{stats?.defectDistribution.potholes || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats?.defectDistribution.potholes || 0) * 8)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Fatigue & Thermal Cracks</span>
                <span className="font-mono text-amber-400 font-bold">{stats?.defectDistribution.cracks || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats?.defectDistribution.cracks || 0) * 5)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Concrete Spalling</span>
                <span className="font-mono text-orange-400 font-bold">{stats?.defectDistribution.spalling || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats?.defectDistribution.spalling || 0) * 12)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Reinforcing Rebar Exposure</span>
                <span className="font-mono text-rose-500 font-bold">{stats?.defectDistribution.rebar || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${Math.min(100, (stats?.defectDistribution.rebar || 0) * 15)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Joint / Delamination</span>
                <span className="font-mono text-cyan-400 font-bold">{stats?.defectDistribution.delamination || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats?.defectDistribution.delamination || 0) * 18)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent AI Inspections Feed (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">Recent Deep Learning Inspections</h3>
            </div>
            <button
              onClick={() => onNavigateToAnalysis()}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              New Scan
            </button>
          </div>

          <div className="space-y-3">
            {recentAnalyses.map((analysis) => {
              const color = getHealthStatusColor(analysis.healthStatus);
              return (
                <div
                  key={analysis.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={analysis.imageUrl}
                      alt="Inspection Thumbnail"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-200 text-xs truncate">
                        {analysis.infrastructureName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{analysis.inspectorName}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono">
                          {analysis.defects.length} defect(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.badge}`}>
                      {analysis.healthStatus}
                    </span>
                    <span className={`block font-mono font-bold text-xs mt-1 ${color.text}`}>
                      Score: {analysis.healthScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
