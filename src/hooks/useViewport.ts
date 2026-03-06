import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ViewportEngine } from '../engine/ViewportEngine';
import { DemoSequence } from '../engine/DemoSequence';
import { TUMOR_CONFIG } from '../data/layerConfig';

export function useViewport(modelUrl: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ViewportEngine | null>(null);
  const tumorRef = useRef<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [meshNames, setMeshNames] = useState<string[]>([]);
  const [tumorLoaded, setTumorLoaded] = useState(false);
  const demoRef = useRef<DemoSequence | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStatus, setDemoStatus] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement!;
    const { clientWidth: w, clientHeight: h } = parent;

    const engine = new ViewportEngine(canvas, w, h);
    engineRef.current = engine;

    engine
      .loadModel(modelUrl)
      .then(() => {
        setLoading(false);
        setMeshNames(engine.getMeshNames());

        // Auto-load tumor
        return engine.loadAdditionalModel(
          TUMOR_CONFIG.url,
          TUMOR_CONFIG.position,
          TUMOR_CONFIG.scale,
        );
      })
      .then((tumorGroup) => {
        tumorRef.current = tumorGroup;
        setTumorLoaded(true);
        console.log('[Viewport] Tumor loaded, position:', tumorGroup.position, 'scale:', tumorGroup.scale);
      })
      .catch((err) => console.error('[ViewportEngine] Load error:', err));

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        engine.resize(width, height);
      }
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
      tumorRef.current = null;
    };
  }, [modelUrl]);

  const setMeshVisible = useCallback((name: string, visible: boolean) => {
    engineRef.current?.setMeshVisible(name, visible);
  }, []);

  const setMeshOpacity = useCallback((name: string, opacity: number) => {
    engineRef.current?.setMeshOpacity(name, opacity);
  }, []);

  const setTumorVisible = useCallback((visible: boolean) => {
    if (tumorRef.current) tumorRef.current.visible = visible;
  }, []);

  const startDemo = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || demoRunning) return;

    const demo = new DemoSequence(engine, tumorRef.current);
    demoRef.current = demo;
    setDemoRunning(true);
    setDemoStatus('Starting...');

    demo
      .run((_layerId, action) => setDemoStatus(action))
      .then(() => {
        setDemoRunning(false);
        setDemoStatus('');
        demoRef.current = null;
      });
  }, [demoRunning]);

  const stopDemo = useCallback(() => {
    demoRef.current?.stop();
    demoRef.current = null;
    setDemoRunning(false);
    setDemoStatus('');
  }, []);

  return {
    canvasRef,
    loading,
    meshNames,
    tumorLoaded,
    setMeshVisible,
    setMeshOpacity,
    setTumorVisible,
    startDemo,
    stopDemo,
    demoRunning,
    demoStatus,
  };
}
