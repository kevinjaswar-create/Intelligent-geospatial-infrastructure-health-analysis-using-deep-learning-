import React, { useState, useEffect, useRef } from 'react';
import {
  InfrastructureAsset,
  AIAnalysisResult,
  Defect,
} from '../types';
import { api } from '../services/api';
import { SAMPLE_INFRASTRUCTURE_IMAGES, SampleImage } from '../data/sampleImages';
import { ImageDetectionCanvas } from '../components/Analysis/ImageDetectionCanvas';
import { DefectCard } from '../components/Analysis/DefectCard';
import { getHealthStatusColor } from '../services/healthScore';
import {
  Sparkles,
  Upload,
  Cpu,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Wrench,
  Activity,
  Layers,
  Info,
  Calendar,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface AnalysisPageProps {
  initialAssetId?: string | null;
  onDispatchWorkOrder: (asset: InfrastructureAsset) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  initialAssetId,
  onDispatchWorkOrder,
}) => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('inf-002');
  const [activeDefectId, setActiveDefectId] = useState<string | null>(null);

  // Input states
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(SAMPLE_INFRASTRUCTURE_IMAGES[0]);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [inferenceMode, setInferenceMode] = useState<'gemini' | 'mock'>('gemini');
  const [inspectionNotes, setInspectionNotes] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Result state
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadAssets() {
      try {
        const data = await api.getInfrastructure();
        setAssets(data);
        if (initialAssetId) {
          setSelectedAssetId(initialAssetId);
          const matchedSample = SAMPLE_INFRASTRUCTURE_IMAGES.find((s) => s.associatedAssetId === initialAssetId);
          if (matchedSample) {
            setSelectedSample(matchedSample);
          }
        }
      } catch (err) {
        console.error('Failed to load infrastructure list:', err);
      }
    }
    loadAssets();
  }, [initialAssetId]);

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomImageBase64(base64);
      setCustomImageUrl(URL.createObjectURL(file));
      setSelectedSample(null);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleImage) => {
    setSelectedSample(sample);
    setCustomImageBase64(null);
    setCustomImageUrl(null);
    setSelectedAssetId(sample.associatedAssetId);
    setAnalysisResult(null);
  };

  const currentPreviewUrl =
    customImageUrl ||
    customImageBase64 ||
    (selectedSample ? selectedSample.imageUrl : SAMPLE_INFRASTRUCTURE_IMAGES[0].imageUrl);

  // Run AI Defect Detection
  const handleRunDetection = async () => {
    setIsProcessing(true);
    setProgressPercent(15);
    setProcessingStage('Ingesting image & calibrating spatial coordinates...');

    try {
      const timer1 = setTimeout(() => {
        setProgressPercent(45);
        setProcessingStage('Running Multimodal Computer Vision defect extraction...');
      }, 400);

      const timer2 = setTimeout(() => {
        setProgressPercent(75);
        setProcessingStage('Detecting defect boundaries (potholes, cracks, spalling)...');
      }, 800);

      const payload: any = {
        infrastructureId: selectedAssetId,
        mode: inferenceMode,
        notes: inspectionNotes,
      };

      if (customImageBase64) {
        payload.imageBase64 = customImageBase64;
      } else if (selectedSample) {
        payload.imageUrl = selectedSample.imageUrl;
        // Also fetch as base64 so Gemini vision model can parse it if mode=gemini
        try {
          const resp = await fetch(selectedSample.imageUrl);
          const blob = await resp.blob();
          const b64 = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
          payload.imageBase64 = b64;
        } catch {
          // fallback to URL
        }
      }

      const result = await api.runDefectDetection(payload);

      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressPercent(100);
      setProcessingStage('Synthesizing Health Score & Engineering Assessment...');

      setTimeout(() => {
        setAnalysisResult(result);
        setIsProcessing(false);
      }, 350);
    } catch (err: any) {
      console.error('Detection error:', err);
      alert(`AI Defect Detection Failed: ${err.message || 'Network error'}`);
      setIsProcessing(false);
    }
  };

  const currentAsset = assets.find((a) => a.id === selectedAssetId);
  const statusColor = analysisResult ? getHealthStatusColor(analysisResult.healthStatus) : null;

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Deep Learning Infrastructure Health Analysis
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated computer vision defect detection, bounding box localization, and transparent health score calculation
          </p>
        </div>

        {/* Engine Switcher & Status */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-sm text-xs">
          <button
            onClick={() => setInferenceMode('gemini')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              inferenceMode === 'gemini'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini 3.8 Flash Vision</span>
          </button>

          <button
            onClick={() => setInferenceMode('mock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              inferenceMode === 'mock'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Benchmark YOLO Sim</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selection & Configuration (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Infrastructure Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Associate Infrastructure Asset
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.code} - {asset.name} ({asset.type})
                </option>
              ))}
            </select>

            {currentAsset && (
              <div className="flex items-center justify-between text-[11px] p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{currentAsset.location.city}, {currentAsset.location.state}</span>
                </span>
                <span className="font-mono">Current Score: {currentAsset.healthScore}/100</span>
              </div>
            )}
          </div>

          {/* Preset Sample Gallery */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Select Benchmark Test Image
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">1-Click Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_INFRASTRUCTURE_IMAGES.map((sample) => {
                const isSelected = selectedSample?.id === sample.id && !customImageBase64;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-16 object-cover rounded-lg border border-slate-800"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block truncate">
                        {sample.category}
                      </span>
                      <p className="text-[11px] font-medium leading-tight line-clamp-2 mt-0.5">
                        {sample.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Upload Dropzone */}
            <div className="pt-2 border-t border-slate-800/80">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  customImageBase64
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 bg-slate-950/40'
                }`}
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>
                  {customImageBase64 ? 'Custom Image Loaded (Click to Change)' : 'Or Upload Custom Infrastructure Image'}
                </span>
              </button>
            </div>
          </div>

          {/* Inspection Notes */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Field Inspection Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="e.g. Drone inspection captured during morning traffic closure. High humidity present."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={handleRunDetection}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Analyzing Image with Deep Learning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Deep Learning Defect Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Detection Canvas & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>{processingStage}</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Interactive Bounding Box Canvas */}
          <ImageDetectionCanvas
            imageUrl={currentPreviewUrl}
            defects={analysisResult ? analysisResult.defects : []}
            activeDefectId={activeDefectId}
            onHoverDefect={(id) => setActiveDefectId(id)}
            engineUsed={analysisResult?.engineUsed}
            isMock={analysisResult?.isMock}
          />

          {/* Analysis Results Dashboard */}
          {analysisResult && statusColor && (
            <div className="space-y-4 animate-in slide-in-from-bottom-3 duration-200">
              {/* Health Score Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Infrastructure Health Index (GHI v2.4)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor.badge}`}>
                      {analysisResult.healthStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {analysisResult.infrastructureName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Analysis Completed in {analysisResult.processingTimeMs}ms • Engine:{' '}
                    <span className="font-mono text-cyan-400">{analysisResult.engineUsed}</span>
                    {analysisResult.isMock && ' (Benchmark Sim)'}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Rating</span>
                    <div className={`text-3xl font-black font-mono leading-none ${statusColor.text}`}>
                      {analysisResult.healthScore}<span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>

                  {currentAsset && (
                    <button
                      onClick={() => onDispatchWorkOrder(currentAsset)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Dispatch Order</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Defect Cards Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Detected Defect Manifest ({analysisResult.defects.length})
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="text-rose-400 font-bold">
                      {analysisResult.defectSummary.critical} Critical
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">
                      {analysisResult.defectSummary.high} High
                    </span>
                    <span>•</span>
                    <span className="text-yellow-400 font-bold">
                      {analysisResult.defectSummary.medium} Medium
                    </span>
                  </div>
                </div>

                {analysisResult.defects.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                    No active surface or structural defects identified in this inspection.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysisResult.defects.map((defect) => (
                      <DefectCard
                        key={defect.id}
                        defect={defect}
                        isActive={activeDefectId === defect.id}
                        onHover={(id) => setActiveDefectId(id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Engineering Disclaimer */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Assessment Note:</strong> This assessment is an application-generated engineering estimation (GeoInfra Index v2.4).
                  Bounding boxes and severity classifications are computed using computer vision models to aid field prioritization. Consult a licensed civil or structural engineer before final sign-off.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
