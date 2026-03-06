import React, { useState, useCallback } from 'react';
import {
  Search,
  History,
  ChevronRight,
  ShieldCheck,
  Scan,
  Microscope,
  Box,
  Eye,
  EyeOff,
  Play,
  Square,
} from 'lucide-react';
import { Viewport3D } from './components/Viewport3D';
import { HierarchyWidget } from './components/HierarchyWidget';
import { useViewport } from './hooks/useViewport';
import { LAYER_CONFIG } from './data/layerConfig';
import type { LayerDef } from './data/layerConfig';

// --- Components ---

const Header = () => (
  <header className="flex items-center justify-between px-6 py-3 bg-panel-matte border-b border-border-fine h-16 shrink-0">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <Box className="w-8 h-8" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight">SurginSight</h1>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Industrial Precision v4.2</span>
        </div>
      </div>
      <div className="h-6 w-[1px] bg-border-fine mx-2"></div>
      <nav className="flex items-center gap-6">
        <a className="text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-primary transition-colors" href="#">Dashboard</a>
        <a className="text-xs font-medium uppercase tracking-wider text-white border-b-2 border-primary pb-1 mt-1" href="#">3D Viewport</a>
        <a className="text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-primary transition-colors" href="#">Anatomy</a>
        <a className="text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-primary transition-colors" href="#">Simulation</a>
      </nav>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center bg-background-dark border border-border-fine rounded px-3 py-1.5 gap-2">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          className="bg-transparent border-none focus:ring-0 text-[10px] w-48 text-slate-300 placeholder:text-slate-600 font-mono outline-none"
          placeholder="COMMAND SEARCH..."
          type="text"
        />
      </div>
      <button className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded transition-all">
        Export Protocol
      </button>
      <div className="h-8 w-8 rounded-full bg-slate-800 border border-border-fine flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100"
          alt="User profile"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  </header>
);

const TimelineOverlay = () => (
  <div className="absolute bottom-6 left-6 right-6 z-20">
    <div className="bg-panel-matte/90 backdrop-blur-md border border-border-fine p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest">Procedural Narrative</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">SESSION: 04:12:88</span>
      </div>
      <div className="flex items-center gap-0 relative">
        <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-slate-800 -translate-y-1/2 z-0"></div>
        <div className="flex flex-1 justify-around items-center z-10">
          {[
            { label: 'Incision', time: 'T +00:12', status: 'completed' },
            { label: 'Targeting', time: 'T +02:45', status: 'active' },
            { label: 'Risk Scan', time: '--:--', status: 'pending' },
            { label: 'Verification', time: '--:--', status: 'pending' },
          ].map((step, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-2 group cursor-pointer ${step.status === 'pending' ? 'opacity-50 grayscale' : ''}`}>
              <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                step.status === 'completed' ? 'border-primary bg-primary shadow-[0_0_10px_rgba(233,73,100,0.3)]' :
                step.status === 'active' ? 'border-primary bg-background-dark group-hover:bg-primary' :
                'border-slate-700 bg-background-dark'
              }`}></div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase ${step.status === 'pending' ? 'text-slate-600' : 'text-white'}`}>{step.label}</p>
                <p className={`text-[9px] font-mono ${step.status === 'pending' ? 'text-slate-700' : 'text-slate-500'}`}>{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const WitnessLog = () => (
  <div className="h-32 border-t border-border-fine bg-background-dark p-4 font-mono text-[10px] shrink-0">
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
      <span className="text-slate-500 uppercase tracking-widest text-[9px]">System Digital Witness Status: VERIFIED</span>
    </div>
    <div className="overflow-y-auto h-16 space-y-1 pr-2">
      {[
        { time: '12:44:01', msg: 'Initializing 3D spatial mapping core...', status: 'DONE', color: 'text-green-500' },
        { time: '12:44:03', msg: 'Anatomy segments localized. Confidence interval 99.8%', status: 'DONE', color: 'text-green-500' },
        { time: '12:44:05', msg: 'Incision keyframe locked to procedural narrative timeline.', status: 'DONE', color: 'text-green-500' },
        { time: '12:44:08', msg: 'Risk Scan protocol initiated. Waiting for user confirmation...', status: 'WAITING', color: 'text-primary' },
      ].map((log, idx) => (
        <div key={idx} className="flex gap-4">
          <span className="text-slate-600">[{log.time}]</span>
          <span className="text-slate-400 uppercase">{log.msg}</span>
          <span className={`${log.color} ml-auto`}>{log.status}</span>
        </div>
      ))}
    </div>
  </div>
);

interface ControlPanelProps {
  tumorLoaded: boolean;
  tumorVisible: boolean;
  onToggleTumor: (visible: boolean) => void;
  demoRunning: boolean;
  demoStatus: string;
  onStartDemo: () => void;
  onStopDemo: () => void;
}

const ControlPanel = ({ tumorLoaded, tumorVisible, onToggleTumor, demoRunning, demoStatus, onStartDemo, onStopDemo }: ControlPanelProps) => (
  <aside className="w-[30%] bg-panel-matte flex flex-col overflow-y-auto border-l border-border-fine">
    {/* Step 1: Anatomy */}
    <div className="p-6 border-b border-border-fine">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">01</span>
        <h2 className="text-sm font-bold uppercase tracking-widest">Anatomy Visibility</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background-dark border border-border-fine rounded">
          <span className="text-xs text-slate-300">Global Transparency</span>
          <div className="flex gap-1">
            <div className="w-6 h-1 bg-primary"></div>
            <div className="w-6 h-1 bg-primary"></div>
            <div className="w-6 h-1 bg-primary/20"></div>
            <div className="w-6 h-1 bg-primary/20"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 bg-background-dark border border-primary rounded group transition-all">
            <Microscope className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold uppercase text-slate-300">Surface</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-background-dark border border-border-fine rounded group hover:border-primary transition-all">
            <Microscope className="w-5 h-5 text-slate-500 group-hover:text-primary" />
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-300">Internal</span>
          </button>
        </div>
      </div>
    </div>

    {/* Step 2: Procedure */}
    <div className="p-6 border-b border-border-fine bg-[#161616]">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">02</span>
        <h2 className="text-sm font-bold uppercase tracking-widest">Procedure Tools</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 p-3 bg-background-dark border border-border-fine rounded hover:border-slate-600 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <Scan className="w-4 h-4 text-slate-500 group-hover:text-primary" />
            <span className="text-xs font-medium text-slate-300">Port Placement Tool</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>

        <div className="p-4 bg-background-dark border border-border-fine rounded-lg relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
          <div className="absolute inset-0 honeycomb-pattern opacity-30"></div>
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Trauma Visualizer</span>
              <Microscope className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Map secondary impact zones across selected internal segments.</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold uppercase rounded border border-primary/20">Active: 4 zones</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Step 3: Tumor Display */}
    <div className="p-6 flex-1">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">03</span>
        <h2 className="text-sm font-bold uppercase tracking-widest">Tumor Display</h2>
      </div>
      <div className="space-y-4">
        {demoRunning ? (
          <button
            onClick={onStopDemo}
            className="w-full flex items-center justify-center gap-3 py-4 bg-primary/10 border-2 border-primary text-primary font-bold text-xs uppercase tracking-[0.2em] transition-all rounded shadow-inner hover:bg-primary/20"
          >
            <Square className="w-4 h-4" />
            Stop Demo
          </button>
        ) : (
          <button
            onClick={onStartDemo}
            className="w-full flex items-center justify-center gap-3 py-4 bg-background-dark border-2 border-slate-800 hover:border-primary text-slate-300 font-bold text-xs uppercase tracking-[0.2em] transition-all rounded shadow-inner"
          >
            <Play className="w-5 h-5 text-primary" />
            Layer Peel Demo
          </button>
        )}
        {demoStatus && (
          <div className="text-[10px] font-mono text-primary text-center animate-pulse uppercase tracking-widest">
            {demoStatus}
          </div>
        )}

        <div className="h-4"></div>

        <div className="bg-black/40 border border-border-fine p-5 rounded">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tumor Model</span>
            <span className={`text-[10px] font-mono ${tumorLoaded ? 'text-green-500' : 'text-primary animate-pulse'}`}>
              {tumorLoaded ? 'LOADED' : 'LOADING'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Visibility</span>
              <button
                onClick={() => onToggleTumor(!tumorVisible)}
                className="flex items-center gap-2"
              >
                {tumorVisible ? (
                  <Eye className="w-4 h-4 text-primary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-600" />
                )}
                <span className={`text-[10px] font-mono ${tumorVisible ? 'text-primary' : 'text-slate-600'}`}>
                  {tumorVisible ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="space-y-1 text-[9px] font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Position</span>
                <span className="text-slate-400">0.04, 1.38, 0.02</span>
              </div>
              <div className="flex justify-between">
                <span>Scale</span>
                <span className="text-slate-400">0.005</span>
              </div>
              <div className="flex justify-between">
                <span>Model</span>
                <span className="text-slate-400">tumor_V2.glb</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="p-4 border-t border-border-fine mt-auto bg-black">
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase">
        <span>Precision: 0.001mm</span>
        <span>Lat: 28.53 | Lon: -81.37</span>
      </div>
    </div>
  </aside>
);

// --- Main App ---

export default function App() {
  const {
    canvasRef,
    loading,
    tumorLoaded,
    setMeshVisible,
    setTumorVisible,
    startDemo,
    stopDemo,
    demoRunning,
    demoStatus,
  } = useViewport(`${import.meta.env.BASE_URL}models/V3.2.glb`);

  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    () => Object.fromEntries(LAYER_CONFIG.map((l) => [l.id, l.defaultVisible])),
  );
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [tumorVisible, setTumorVisibleState] = useState(true);

  const handleToggleLayer = useCallback(
    (layerId: string, visible: boolean) => {
      setLayerVisibility((prev) => ({ ...prev, [layerId]: visible }));
      const layer = LAYER_CONFIG.find((l) => l.id === layerId);
      if (layer) {
        layer.meshNames.forEach((name) => setMeshVisible(name, visible));
      }
    },
    [setMeshVisible],
  );

  const handleToggleTumor = useCallback(
    (visible: boolean) => {
      setTumorVisibleState(visible);
      setTumorVisible(visible);
    },
    [setTumorVisible],
  );

  return (
    <div className="flex flex-col h-screen bg-background-dark text-slate-100 overflow-hidden">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Viewport Section */}
        <section className="w-[70%] relative flex flex-col bg-black border-r border-border-fine">
          <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#121212]">
            {/* Background Grid/Pattern */}
            <div className="absolute inset-0 opacity-10 honeycomb-pattern"></div>

            {/* 3D Viewport */}
            <div className="absolute inset-0">
              <Viewport3D canvasRef={canvasRef} loading={loading} />
            </div>

            <HierarchyWidget
              layers={LAYER_CONFIG}
              visibilityState={layerVisibility}
              activeLayerId={activeLayerId}
              onToggleVisibility={handleToggleLayer}
              onSetActive={setActiveLayerId}
            />
            <TimelineOverlay />
          </div>

          <WitnessLog />
        </section>

        <ControlPanel
          tumorLoaded={tumorLoaded}
          tumorVisible={tumorVisible}
          onToggleTumor={handleToggleTumor}
          demoRunning={demoRunning}
          demoStatus={demoStatus}
          onStartDemo={startDemo}
          onStopDemo={stopDemo}
        />
      </main>
    </div>
  );
}
