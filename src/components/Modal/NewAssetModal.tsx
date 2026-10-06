import React, { useState } from 'react';
import { InfrastructureType, PriorityLevel } from '../../types';
import { X, Building2, MapPin, Check, AlertCircle } from 'lucide-react';

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assetData: any) => Promise<void>;
}

export const NewAssetModal: React.FC<NewAssetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<InfrastructureType>('BRIDGE');
  const [lat, setLat] = useState('37.7749');
  const [lng, setLng] = useState('-122.4194');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [constructedYear, setConstructedYear] = useState('1995');
  const [roadLengthKm, setRoadLengthKm] = useState('2.5');
  const [lanes, setLanes] = useState('4');
  const [trafficVolume, setTrafficVolume] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'>('HIGH');
  const [material, setMaterial] = useState('Reinforced Concrete & Steel');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !lat || !lng) {
      setError('Please fill in required fields (Name, Asset Code, Latitude, Longitude)');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        name,
        code,
        type,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          address: address || `${name} Corridor`,
          city: city || 'San Francisco',
          state: state || 'CA',
        },
        constructedYear: parseInt(constructedYear, 10) || 2000,
        roadLengthKm: parseFloat(roadLengthKm) || 1.0,
        lanes: parseInt(lanes, 10) || 2,
        trafficVolume,
        material,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save infrastructure asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Register Infrastructure Asset</h3>
              <p className="text-xs text-slate-400">Add civil structure to geospatial monitoring registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Asset Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Central Expressway South Viaduct"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Asset Code / DOT ID *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EXP-280-S"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Infrastructure Classification</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InfrastructureType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="BRIDGE">Bridge / Viaduct</option>
                <option value="HIGHWAY">Highway / Freeway Segment</option>
                <option value="OVERPASS">Overpass / Interchange Flyover</option>
                <option value="TUNNEL">Tunnel Bore</option>
                <option value="PAVEMENT">Urban Arterial Pavement</option>
                <option value="RETAINING_WALL">Earth Retaining Wall</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Year Constructed</label>
              <input
                type="number"
                value={constructedYear}
                onChange={(e) => setConstructedYear(e.target.value)}
                min="1900"
                max="2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* GIS Coordinates */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>GIS Geospatial Coordinates</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Latitude (Decimal)</label>
                <input
                  type="text"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="37.7749"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Longitude (Decimal)</label>
                <input
                  type="text"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="-122.4194"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-slate-400 text-[11px] mb-1">Street Address / Milepost</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Milepost 4.8 Northbound"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Structural Details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Length (km)</label>
              <input
                type="number"
                step="0.1"
                value={roadLengthKm}
                onChange={(e) => setRoadLengthKm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lanes</label>
              <input
                type="number"
                value={lanes}
                onChange={(e) => setLanes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Traffic Volume</label>
              <select
                value={trafficVolume}
                onChange={(e) => setTrafficVolume(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs"
              >
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="VERY_HIGH">Very High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Construction Material</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Prestressed Concrete Box Girder"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
