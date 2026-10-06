import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { InfrastructureAsset, HealthStatus, InfrastructureType } from '../../types';
import { getHealthStatusColor } from '../../services/healthScore';
import { Layers, ZoomIn, ZoomOut, Compass, MapPin, Eye, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface GISMapProps {
  assets: InfrastructureAsset[];
  selectedAssetId?: string | null;
  onSelectAsset?: (asset: InfrastructureAsset) => void;
  onInspectAsset?: (asset: InfrastructureAsset) => void;
  pickerMode?: boolean;
  onPickCoordinates?: (coords: { lat: number; lng: number }) => void;
  heightClass?: string;
  showFilters?: boolean;
}

export const GISMap: React.FC<GISMapProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  onInspectAsset,
  pickerMode = false,
  onPickCoordinates,
  heightClass = 'h-[600px]',
  showFilters = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [tileTheme, setTileTheme] = useState<'dark' | 'standard' | 'satellite'>('dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around SF Bay Area corridor
    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.36],
      zoom: 11,
      zoomControl: false,
    });

    const getTileUrl = (theme: 'dark' | 'standard' | 'satellite') => {
      if (theme === 'dark') {
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      } else if (theme === 'satellite') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    const tileLayer = L.tileLayer(getTileUrl(tileTheme), {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Click handler for coordinate picking
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (pickerMode && onPickCoordinates) {
        onPickCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });

        if (pickedMarkerRef.current) {
          pickedMarkerRef.current.setLatLng(e.latlng);
        } else {
          const pinIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          pickedMarkerRef.current = L.marker(e.latlng, { icon: pinIcon }).addTo(map);
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when tileTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const getTileUrl = (theme: 'dark' | 'standard' | 'satellite') => {
      if (theme === 'dark') {
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      } else if (theme === 'satellite') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    L.tileLayer(getTileUrl(tileTheme), {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [tileTheme]);

  // Update Markers based on assets & filters
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = assets.filter((asset) => {
      if (statusFilter !== 'ALL' && asset.healthStatus !== statusFilter) return false;
      if (typeFilter !== 'ALL' && asset.type !== typeFilter) return false;
      return true;
    });

    filtered.forEach((asset) => {
      const isSelected = selectedAssetId === asset.id;
      const statusColor = getHealthStatusColor(asset.healthStatus);

      // SVG Pin icon with health status color & pulsating ring for critical/poor
      let ringHtml = '';
      let markerColor = '#10b981'; // Green
      if (asset.healthStatus === 'GOOD') markerColor = '#14b8a6';
      else if (asset.healthStatus === 'MODERATE') markerColor = '#f59e0b';
      else if (asset.healthStatus === 'POOR') markerColor = '#f97316';
      else if (asset.healthStatus === 'CRITICAL') {
        markerColor = '#ef4444';
        ringHtml = `<span class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></span>`;
      }

      const iconHtml = `
        <div class="relative cursor-pointer group transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          ${ringHtml}
          <div style="background-color: ${markerColor};" class="w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
            ${asset.healthScore}
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${markerColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'infra-marker-icon',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([asset.location.lat, asset.location.lng], { icon: customIcon });

      // Interactive popup
      const popupContent = document.createElement('div');
      popupContent.className = 'w-64 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs shadow-2xl border border-slate-700';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <span class="text-[10px] uppercase font-mono tracking-wider text-slate-400">${asset.code}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColor.badge}">${asset.healthStatus}</span>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <img src="${asset.thumbnailUrl}" class="w-12 h-12 object-cover rounded border border-slate-700" alt="${asset.name}" />
          <div>
            <h4 class="font-semibold text-slate-200 text-sm leading-tight">${asset.name}</h4>
            <p class="text-slate-400 text-[11px] mt-0.5">${asset.type} • ${asset.location.city}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-950/60 rounded border border-slate-800/80">
          <div>
            <span class="text-[10px] text-slate-400 block">Health Index</span>
            <span class="text-sm font-bold ${statusColor.text}">${asset.healthScore}/100</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block">Active Defects</span>
            <span class="text-sm font-bold ${asset.defectCount > 0 ? 'text-amber-400' : 'text-slate-300'}">${asset.defectCount} detected</span>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button id="btn-select-${asset.id}" class="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-center font-medium transition-colors">
            Details
          </button>
          <button id="btn-inspect-${asset.id}" class="flex-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-center font-medium transition-colors shadow">
            Inspect AI
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'dark-leaflet-popup' });

      marker.on('popupopen', () => {
        const btnSelect = document.getElementById(`btn-select-${asset.id}`);
        const btnInspect = document.getElementById(`btn-inspect-${asset.id}`);
        if (btnSelect) {
          btnSelect.onclick = () => onSelectAsset?.(asset);
        }
        if (btnInspect) {
          btnInspect.onclick = () => onInspectAsset?.(asset);
        }
      });

      marker.on('click', () => {
        onSelectAsset?.(asset);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // If an asset is specifically selected, fly to it
    if (selectedAssetId) {
      const selected = assets.find((a) => a.id === selectedAssetId);
      if (selected && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([selected.location.lat, selected.location.lng], 14, {
          duration: 1.2,
        });
      }
    }
  }, [assets, selectedAssetId, statusFilter, typeFilter]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([37.7749, -122.36], 11);
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 ${heightClass} shadow-2xl`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Filter Bar */}
      {showFilters && (
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/80 shadow-2xl">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIS Corridor: SF Bay</span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Health Statuses</option>
            <option value="CRITICAL">Critical (0 - 19)</option>
            <option value="POOR">Poor (20 - 39)</option>
            <option value="MODERATE">Moderate (40 - 69)</option>
            <option value="GOOD">Good (70 - 89)</option>
            <option value="HEALTHY">Healthy (90 - 100)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Asset Types</option>
            <option value="BRIDGE">Bridges</option>
            <option value="HIGHWAY">Highways</option>
            <option value="OVERPASS">Overpasses</option>
            <option value="TUNNEL">Tunnels</option>
            <option value="PAVEMENT">Pavements</option>
            <option value="RETAINING_WALL">Retaining Walls</option>
          </select>
        </div>
      )}

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Reset Corridor View"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Tile Theme Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl flex flex-col gap-1">
          <button
            onClick={() => setTileTheme(tileTheme === 'dark' ? 'satellite' : tileTheme === 'satellite' ? 'standard' : 'dark')}
            title={`Basemap: ${tileTheme.toUpperCase()}`}
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom GIS Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-2xl flex items-center gap-4 text-[11px] text-slate-300">
        <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Health Legend</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>90-100 Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
          <span>70-89 Good</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>40-69 Mod</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>20-39 Poor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>0-19 Critical</span>
        </div>
      </div>

      {pickerMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] bg-cyan-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 border border-cyan-400 animate-pulse">
          <MapPin className="w-4 h-4" />
          <span>Click on the map to set infrastructure coordinates</span>
        </div>
      )}
    </div>
  );
};
