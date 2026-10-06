import React, { useState, useEffect } from 'react';
import { InfrastructureAsset } from '../types';
import { api } from '../services/api';
import { GISMap } from '../components/Map/GISMap';
import { getHealthStatusColor } from '../services/healthScore';
import {
  MapPin,
  Sparkles,
  Wrench,
  Download,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Crosshair,
  Layers,
  X,
} from 'lucide-react';

interface MapPageProps {
  onInspectAsset: (assetId: string) => void;
  onCreateWorkOrder: (asset: InfrastructureAsset) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onInspectAsset, onCreateWorkOrder }) => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getInfrastructure();
        setAssets(data);
        if (data.length > 0 && !selectedAsset) {
          // Default to Nimitz or first critical
          const crit = data.find((a) => a.healthStatus === 'CRITICAL' || a.healthStatus === 'POOR') || data[0];
          setSelectedAsset(crit);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: assets.map((a) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [a.location.lng, a.location.lat],
        },
        properties: {
          id: a.id,
          code: a.code,
          name: a.name,
          type: a.type,
          healthScore: a.healthScore,
          healthStatus: a.healthStatus,
          priority: a.priority,
          defects: a.defectCount,
          lastInspected: a.lastInspectedDate,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geoinfra-corridor-gis-${new Date().toISOString().split('T')[0]}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedColor = selectedAsset ? getHealthStatusColor(selectedAsset.healthStatus) : null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden">
      {/* Subheader Toolbar */}
      <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-100 leading-tight">
              Geospatial Corridor GIS Visualizer
            </h1>
            <p className="text-[11px] text-slate-400">
              Interactive Leaflet GIS mapping with live health condition markers and OpenStreetMap basemap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGeoJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport with Floating Details Drawer */}
      <div className="relative flex-1 w-full overflow-hidden">
        <GISMap
          assets={assets}
          selectedAssetId={selectedAsset?.id}
          onSelectAsset={(asset) => setSelectedAsset(asset)}
          onInspectAsset={(asset) => onInspectAsset(asset.id)}
          heightClass="h-full"
          showFilters={true}
        />

        {/* Selected Asset Floating Card */}
        {selectedAsset && selectedColor && (
          <div className="absolute bottom-6 right-6 z-[400] w-80 lg:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-4 text-xs space-y-3 animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                {selectedAsset.code}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedColor.badge}`}>
                  {selectedAsset.healthStatus}
                </span>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Asset Thumbnail & Name */}
            <div className="flex gap-3">
              <img
                src={selectedAsset.thumbnailUrl}
                alt={selectedAsset.name}
                className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-100 text-sm leading-snug">
                  {selectedAsset.name}
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {selectedAsset.type} • {selectedAsset.location.city}, {selectedAsset.location.state}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{selectedAsset.location.lat.toFixed(4)}, {selectedAsset.location.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Health Score & Key Specs */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Health Score</span>
                <span className={`text-base font-extrabold font-mono ${selectedColor.text}`}>
                  {selectedAsset.healthScore}/100
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Active Defects</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">
                  {selectedAsset.defectCount} detected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500">Built:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedAsset.constructedYear}</span>
              </div>
              <div>
                <span className="text-slate-500">Last Scan:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedAsset.lastInspectedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => onInspectAsset(selectedAsset.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect AI</span>
              </button>

              <button
                onClick={() => onCreateWorkOrder(selectedAsset)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span>Work Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
