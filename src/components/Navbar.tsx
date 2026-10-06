import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Shield, Sparkles, User, LogOut, Activity, AlertTriangle, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenNewAssetModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewAssetModal }) => {
  const { user, loginAsDemo, logout, isAdmin, isEngineer } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loginAsDemo(e.target.value as Role);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/40">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                GeoInfra AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Geospatial Infrastructure Health Analysis • Deep Learning & GIS
            </p>
          </div>
        </div>

        {/* Center Corridor Status & Live Monitoring */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">GIS Network: Operational</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vision Engine: Gemini 3.8 Flash</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2 Critical Alerts</span>
          </div>
        </div>

        {/* User Profile & Demo Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Role:</span>
            <select
              value={user?.role || 'ENGINEER'}
              onChange={handleRoleChange}
              className="bg-transparent text-xs font-semibold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="ADMIN" className="bg-slate-900 text-slate-100">
                Admin (Dr. Sarah Lin)
              </option>
              <option value="ENGINEER" className="bg-slate-900 text-slate-100">
                Inspector (Marcus Vance)
              </option>
              <option value="VIEWER" className="bg-slate-900 text-slate-100">
                Viewer (Elena Rostova)
              </option>
            </select>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-semibold text-slate-200 block leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400 block leading-tight">{user?.organization}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
