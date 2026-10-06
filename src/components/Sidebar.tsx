import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Sparkles,
  Building2,
  Wrench,
  FileText,
  Sliders,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 
  | 'dashboard' 
  | 'map' 
  | 'analysis' 
  | 'infrastructure' 
  | 'maintenance' 
  | 'reports' 
  | 'admin';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, isAdmin, isEngineer } = useAuth();

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    restrictedTo?: 'ADMIN' | 'ENGINEER';
  }> = [
    {
      id: 'dashboard',
      label: 'Overview & KPIs',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'map',
      label: 'GIS Spatial Map',
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      id: 'analysis',
      label: 'Deep Learning Scan',
      icon: <Sparkles className="w-4 h-4" />,
      badge: 'Vision AI',
    },
    {
      id: 'infrastructure',
      label: 'Asset Inventory',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'maintenance',
      label: 'Maintenance Queue',
      icon: <Wrench className="w-4 h-4" />,
      badge: '3 Orders',
    },
    {
      id: 'reports',
      label: 'Engineering Reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Formula & Audit Logs',
      icon: <Sliders className="w-4 h-4" />,
      restrictedTo: 'ADMIN',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/90 border-r border-slate-800/80 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.restrictedTo === 'ADMIN' && !isAdmin) return null;

              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Corridor Health Summary Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">San Francisco Corridor</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Avg: 60/100
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Monitored Assets:</span>
              <span className="font-mono text-slate-200 font-bold">7 Major Hubs</span>
            </div>
            <div className="flex justify-between">
              <span>Critical Deficiencies:</span>
              <span className="font-mono text-rose-400 font-bold">2 Assets</span>
            </div>
            <div className="flex justify-between">
              <span>Next Scheduled Cycle:</span>
              <span className="font-mono text-slate-300">Oct 12, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role & Access Info Footer */}
      <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Role: <strong className="text-slate-200">{user?.role}</strong></span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          {isAdmin
            ? 'Full administrative control over assets, users & formulas.'
            : isEngineer
            ? 'Authorized for AI defect inspection & work orders.'
            : 'Read-only viewer access to spatial dashboards & reports.'}
        </p>
      </div>
    </aside>
  );
};
