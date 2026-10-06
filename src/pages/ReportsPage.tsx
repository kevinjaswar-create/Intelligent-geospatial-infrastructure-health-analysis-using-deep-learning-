import React, { useState, useEffect } from 'react';
import { InfrastructureAsset, AIAnalysisResult } from '../types';
import { api } from '../services/api';
import { getHealthStatusColor } from '../services/healthScore';
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [assetList, analysisList] = await Promise.all([
          api.getInfrastructure(),
          api.getAnalyses(),
        ]);
        setAssets(assetList);
        setAnalyses(analysisList);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportJSON = () => {
    const reportData = {
      reportTitle: 'Regional Transportation Infrastructure Health Analysis',
      generatedAt: new Date().toISOString(),
      corridor: 'San Francisco Bay Area Regional Transportation Corridor',
      corridorHealthSummary: {
        totalAssets: assets.length,
        averageHealthIndex: Math.round(
          assets.reduce((sum, a) => sum + a.healthScore, 0) / (assets.length || 1)
        ),
      },
      infrastructureAssets: assets,
      recentInspections: analyses,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geoinfra-engineering-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'Asset Code',
      'Asset Name',
      'Classification',
      'City',
      'Latitude',
      'Longitude',
      'Constructed Year',
      'Health Score',
      'Health Status',
      'Active Defects',
      'Last Inspected',
    ];

    const rows = assets.map((a) => [
      `"${a.code}"`,
      `"${a.name}"`,
      `"${a.type}"`,
      `"${a.location.city}"`,
      a.location.lat,
      a.location.lng,
      a.constructedYear,
      a.healthScore,
      `"${a.healthStatus}"`,
      a.defectCount,
      `"${a.lastInspectedDate}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geoinfra-asset-health-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Engineering Condition Reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Certified technical summary, defect logs, and spatial health assessments ready for export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Engineering Document Container */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-4">
        {/* Report Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 print:text-cyan-800">
              Department of Transportation • Structural Health Division
            </span>
            <h2 className="text-xl font-extrabold text-white print:text-black mt-1">
              Infrastructure Condition & Defect Evaluation Audit
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Corridor: San Francisco Metropolitan Transit & Highway Network
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-1">
            <div>
              Generated Date:{' '}
              <strong className="text-slate-200 print:text-black">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </strong>
            </div>
            <div>
              Evaluation Engine:{' '}
              <strong className="text-cyan-400 print:text-cyan-700 font-mono">GeoInfra AI v2.4 (GHI Formula)</strong>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 print:bg-slate-100 border border-slate-800/80 print:border-slate-300 text-xs">
          <div>
            <span className="text-slate-400 print:text-slate-600 block">Total Corridor Nodes</span>
            <span className="text-2xl font-black font-mono text-white print:text-black">
              {assets.length}
            </span>
          </div>

          <div>
            <span className="text-slate-400 print:text-slate-600 block">Average Health Index</span>
            <span className="text-2xl font-black font-mono text-cyan-400 print:text-cyan-700">
              {Math.round(assets.reduce((sum, a) => sum + a.healthScore, 0) / (assets.length || 1))}/100
            </span>
          </div>

          <div>
            <span className="text-slate-400 print:text-slate-600 block">Critical Deficiencies</span>
            <span className="text-2xl font-black font-mono text-rose-400 print:text-rose-700">
              {assets.filter((a) => a.healthStatus === 'CRITICAL').length} Structures
            </span>
          </div>

          <div>
            <span className="text-slate-400 print:text-slate-600 block">Total Logged Inspections</span>
            <span className="text-2xl font-black font-mono text-emerald-400 print:text-emerald-700">
              {analyses.length} Scans
            </span>
          </div>
        </div>

        {/* Detailed Asset Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-200 print:text-black">
            Asset Inventory Health Matrix
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-800">
              <thead className="bg-slate-950 text-slate-400 print:bg-slate-200 print:text-black uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Built</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Defects</th>
                  <th className="p-3">Last Inspected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-slate-300">
                {assets.map((asset) => {
                  const color = getHealthStatusColor(asset.healthStatus);
                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="p-3 font-mono font-bold text-cyan-400 print:text-cyan-800">
                        {asset.code}
                      </td>
                      <td className="p-3 font-semibold text-slate-100 print:text-black">
                        {asset.name}
                      </td>
                      <td className="p-3 text-slate-400 print:text-slate-600">{asset.type}</td>
                      <td className="p-3">{asset.location.city}</td>
                      <td className="p-3 font-mono">{asset.constructedYear}</td>
                      <td className={`p-3 font-mono font-bold ${color.text} print:text-black`}>
                        {asset.healthScore}/100
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.badge} print:border-slate-400`}>
                          {asset.healthStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-amber-400 print:text-black font-semibold">
                        {asset.defectCount}
                      </td>
                      <td className="p-3 font-mono text-slate-400 print:text-slate-600">
                        {asset.lastInspectedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800/80 print:border-slate-300 flex items-start gap-3 text-xs text-slate-400 print:text-slate-700">
          <Info className="w-5 h-5 text-cyan-400 print:text-cyan-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-200 print:text-black">
              Engineering Assessment Standards & Methodology
            </h4>
            <p className="leading-relaxed">
              This report is generated by the GeoInfra AI computer vision pipeline using multiscale deep learning defect localization and the GeoInfra Health Index (GHI v2.4).
              Calculations include calibrated defect deductions (Critical: -22 pts, High: -12 pts, Medium: -6 pts, Low: -2.5 pts) adjusted for structure age degradation and detection confidence weightings.
              This report serves as an assistive technical document and does not supersede statutory certified structural engineering stamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
