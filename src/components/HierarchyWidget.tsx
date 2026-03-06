import React, { useRef, useEffect } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import type { LayerDef } from '../data/layerConfig';

interface HierarchyWidgetProps {
  layers: LayerDef[];
  visibilityState: Record<string, boolean>;
  activeLayerId: string | null;
  onToggleVisibility: (layerId: string, visible: boolean) => void;
  onSetActive: (layerId: string | null) => void;
}

export function HierarchyWidget({
  layers,
  visibilityState,
  activeLayerId,
  onToggleVisibility,
  onSetActive,
}: HierarchyWidgetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.stopPropagation();
    };
    el.addEventListener('wheel', handler, { passive: false, capture: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div className="absolute top-6 left-6 w-56 flex flex-col gap-1 z-20">
      <div ref={panelRef} className="bg-panel-matte/80 backdrop-blur-md border border-border-fine p-3 rounded">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Hierarchy
          </h3>
          <Layers className="w-4 h-4 text-slate-500" />
        </div>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {layers.map((layer) => {
            const visible = visibilityState[layer.id] ?? layer.defaultVisible;
            const active = activeLayerId === layer.id;

            return (
              <div
                key={layer.id}
                className="flex items-center justify-between group cursor-pointer py-0.5"
              >
                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  onClick={() => onSetActive(active ? null : layer.id)}
                >
                  <div
                    className={`w-1 h-3 rounded-full shrink-0 ${
                      active
                        ? 'bg-primary shadow-[0_0_8px_rgba(233,73,100,0.4)]'
                        : 'bg-slate-600 group-hover:bg-primary'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium truncate ${
                      active ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {layer.label}
                  </span>
                </div>
                <button
                  className="shrink-0 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id, !visible);
                  }}
                >
                  {visible ? (
                    <Eye
                      className={`w-3.5 h-3.5 ${
                        active ? 'text-primary' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-700 hover:text-slate-500" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
