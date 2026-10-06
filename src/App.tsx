import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { NewAssetModal } from './components/Modal/NewAssetModal';
import { WorkOrderModal } from './components/Modal/WorkOrderModal';
import { InfrastructureAsset } from './types';
import { api } from './services/api';
import {
  LayoutDashboard,
  MapPin,
  Sparkles,
  Building2,
  Wrench,
  FileText,
  Sliders,
} from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [targetAssetIdForAnalysis, setTargetAssetIdForAnalysis] = useState<string | null>(null);

  // Modals state
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [selectedAssetForWorkOrder, setSelectedAssetForWorkOrder] = useState<InfrastructureAsset | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

  const handleNavigateToAnalysis = (assetId?: string) => {
    if (assetId) {
      setTargetAssetIdForAnalysis(assetId);
    }
    setCurrentTab('analysis');
  };

  const handleOpenWorkOrderForAsset = (asset: InfrastructureAsset) => {
    setSelectedAssetForWorkOrder(asset);
    setIsWorkOrderModalOpen(true);
  };

  const handleCreateAssetSubmit = async (assetData: any) => {
    await api.createInfrastructure(assetData);
    // Refresh or redirect to infrastructure
    setCurrentTab('infrastructure');
  };

  const handleCreateWorkOrderSubmit = async (orderData: any) => {
    await api.createWorkOrder(orderData);
    setCurrentTab('maintenance');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <Navbar onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950 pb-16 md:pb-0">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToMap={() => setCurrentTab('map')}
              onNavigateToAnalysis={handleNavigateToAnalysis}
              onNavigateToMaintenance={() => setCurrentTab('maintenance')}
              onNavigateToAsset={(assetId) => {
                setTargetAssetIdForAnalysis(assetId);
                setCurrentTab('map');
              }}
            />
          )}

          {currentTab === 'map' && (
            <MapPage
              onInspectAsset={(assetId) => handleNavigateToAnalysis(assetId)}
              onCreateWorkOrder={(asset) => handleOpenWorkOrderForAsset(asset)}
            />
          )}

          {currentTab === 'analysis' && (
            <AnalysisPage
              initialAssetId={targetAssetIdForAnalysis}
              onDispatchWorkOrder={(asset) => handleOpenWorkOrderForAsset(asset)}
            />
          )}

          {currentTab === 'infrastructure' && (
            <InfrastructurePage
              onInspectAsset={(assetId) => handleNavigateToAnalysis(assetId)}
              onNavigateToMapWithAsset={(assetId) => {
                setTargetAssetIdForAnalysis(assetId);
                setCurrentTab('map');
              }}
              onCreateWorkOrder={(asset) => handleOpenWorkOrderForAsset(asset)}
              onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
            />
          )}

          {currentTab === 'maintenance' && (
            <MaintenancePage
              onOpenWorkOrderModal={() => {
                setSelectedAssetForWorkOrder(null);
                setIsWorkOrderModalOpen(true);
              }}
            />
          )}

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'admin' && <AdminPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 py-2">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
            currentTab === 'map' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>GIS Map</span>
        </button>

        <button
          onClick={() => setCurrentTab('analysis')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
            currentTab === 'analysis' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Scan</span>
        </button>

        <button
          onClick={() => setCurrentTab('infrastructure')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
            currentTab === 'infrastructure' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Assets</span>
        </button>

        <button
          onClick={() => setCurrentTab('maintenance')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
            currentTab === 'maintenance' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setCurrentTab('reports')}
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
            currentTab === 'reports' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </button>
      </nav>

      {/* Global Modals */}
      <NewAssetModal
        isOpen={isNewAssetModalOpen}
        onClose={() => setIsNewAssetModalOpen(false)}
        onSubmit={handleCreateAssetSubmit}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        asset={selectedAssetForWorkOrder}
        onSubmit={handleCreateWorkOrderSubmit}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
