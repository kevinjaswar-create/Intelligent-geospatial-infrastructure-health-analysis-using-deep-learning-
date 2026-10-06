import React, { useState, useEffect } from 'react';
import { InfrastructureAsset, InfrastructureType, HealthStatus } from '../types';
import { api } from '../services/api';
import { getHealthStatusColor } from '../services/healthScore';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Sparkles,
  Wrench,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface InfrastructurePageProps {
  onInspectAsset: (assetId: string) => void;
  onNavigateToMapWithAsset: (assetId: string) => void;
  onCreateWorkOrder: (asset: InfrastructureAsset) => void;
  onOpenNewAssetModal: () => void;
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({
  onInspectAsset,
  onNavigateToMapWithAsset,
  onCreateWorkOrder,
  onOpenNewAssetModal,
}) => {
  const { isAdmin, canInspect } = useAuth();
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await api.getInfrastructure({
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      });
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [searchTerm, statusFilter, typeFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the infrastructure database?`)) {
      return;
    }
    try {
      await api.deleteInfrastructure(id);
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Infrastructure Asset Registry
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structural health conditions, inspection records, and geospatial indices across regional assets
          </p>
        </div>

        {canInspect && (
          <button
            onClick={onOpenNewAssetModal}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by asset name, code, or city..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Health Ratings</option>
            <option value="CRITICAL">Critical (&lt; 20)</option>
            <option value="POOR">Poor (20 - 39)</option>
            <option value="MODERATE">Moderate (40 - 69)</option>
            <option value="GOOD">Good (70 - 89)</option>
            <option value="HEALTHY">Healthy (90 - 100)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Structure Types</option>
            <option value="BRIDGE">Bridge / Viaduct</option>
            <option value="HIGHWAY">Highway / Freeway</option>
            <option value="OVERPASS">Overpass Flyover</option>
            <option value="TUNNEL">Tunnel Portal</option>
            <option value="PAVEMENT">Arterial Pavement</option>
            <option value="RETAINING_WALL">Retaining Wall</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const statusColor = getHealthStatusColor(asset.healthStatus);

          return (
            <div
              key={asset.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.01]"
            >
              <div>
                {/* Photo & Health Badge */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-950/80 text-white backdrop-blur-md border border-slate-700/80 shadow">
                      {asset.code}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md shadow ${statusColor.badge}`}>
                      {asset.healthStatus}
                    </span>
                  </div>

                  {/* Health Score Overlay */}
                  <div className="absolute bottom-3 left-3 flex items-baseline gap-1 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800">
                    <span className={`text-xl font-black font-mono ${statusColor.text}`}>
                      {asset.healthScore}
                    </span>
                    <span className="text-[10px] text-slate-400">/100 Health</span>
                  </div>

                  <div className="absolute bottom-3 right-3 text-[11px] font-medium text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
                    {asset.defectCount} Deficiencies
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm leading-snug">
                      {asset.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">
                        {asset.location.address}, {asset.location.city}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Class:</span>
                      <span className="text-slate-200 font-medium">{asset.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Traffic:</span>
                      <span className="text-slate-200 font-medium">{asset.trafficVolume || 'High'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Constructed:</span>
                      <span className="text-slate-200 font-medium">{asset.constructedYear}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Last Scan:</span>
                      <span className="text-slate-200 font-medium">{asset.lastInspectedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onInspectAsset(asset.id)}
                    className="py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onCreateWorkOrder(asset)}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 transition-colors border border-slate-700"
                  >
                    <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Order</span>
                  </button>

                  <button
                    onClick={() => onNavigateToMapWithAsset(asset.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Focus on GIS Map"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(asset.id, asset.name)}
                    className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
