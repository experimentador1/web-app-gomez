// components/GraphVisualization.tsx
// Componente principal de visualización del grafo con vis.js

import { useEffect, useRef, useCallback, useState } from "react";
import { Network, Options, Data } from "vis-network/standalone";
import { DataSet } from "vis-data/standalone";
import type { VisJSData, VisNode, VisEdge } from "../types/grafo";

interface GraphVisualizationProps {
  data: VisJSData;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  height?: string;
  className?: string;
}

const defaultOptions: Options = {
  nodes: {
    shape: "dot",
    scaling: {
      min: 10,
      max: 40,
      label: {
        enabled: true,
        min: 10,
        max: 24,
      },
    },
    font: {
      size: 12,
      color: "#ffffff",
      strokeWidth: 2,
      strokeColor: "#000000",
    },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
    color: { 
      color: "#64748b",
      opacity: 0.7,
      inherit: false 
    },
    smooth: {
      enabled: true,
      type: "continuous",
      roundness: 0.5,
    },
    arrows: {
      to: { enabled: false },
      from: { enabled: false },
    },
  },
  physics: {
    enabled: true,
    solver: "forceAtlas2Based",
    forceAtlas2Based: {
      gravitationalConstant: -50,
      centralGravity: 0.01,
      springLength: 150,
      springConstant: 0.08,
      damping: 0.4,
    },
    stabilization: {
      enabled: true,
      iterations: 200,
      updateInterval: 25,
    },
  },
  interaction: {
    hover: true,
    tooltipDelay: 100,
    navigationButtons: true,
    keyboard: true,
    multiselect: true,
  },
  layout: {
    improvedLayout: true,
  },
};

export default function GraphVisualization({
  data,
  onNodeClick,
  onNodeDoubleClick,
  height = "600px",
  className = "",
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<VisNode> | null>(null);
  const edgesRef = useRef<DataSet<VisEdge> | null>(null);
  const [isStabilizing, setIsStabilizing] = useState(true);
  const [stabilizationProgress, setStabilizationProgress] = useState(0);

  // Inicializar la red
  useEffect(() => {
    if (!containerRef.current) return;

    // Crear DataSets
    nodesRef.current = new DataSet<VisNode>(data.nodes);
    edgesRef.current = new DataSet<VisEdge>(data.edges);

    const networkData: Data = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
    };

    // Crear la red
    networkRef.current = new Network(
      containerRef.current,
      networkData,
      defaultOptions
    );

    // Event handlers
    networkRef.current.on("click", (params) => {
      if (params.nodes.length > 0 && onNodeClick) {
        onNodeClick(params.nodes[0] as string);
      }
    });

    networkRef.current.on("doubleClick", (params) => {
      if (params.nodes.length > 0 && onNodeDoubleClick) {
        onNodeDoubleClick(params.nodes[0] as string);
      }
    });

    networkRef.current.on("stabilizationProgress", (params) => {
      const progress = Math.round((params.iterations / params.total) * 100);
      setStabilizationProgress(progress);
    });

    networkRef.current.on("stabilizationIterationsDone", () => {
      setIsStabilizing(false);
      setStabilizationProgress(100);
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []);

  // Actualizar datos cuando cambien
  useEffect(() => {
    if (!nodesRef.current || !edgesRef.current) return;

    setIsStabilizing(true);
    setStabilizationProgress(0);

    // Limpiar y agregar nuevos datos
    nodesRef.current.clear();
    edgesRef.current.clear();
    nodesRef.current.add(data.nodes);
    edgesRef.current.add(data.edges);

    // Re-estabilizar
    if (networkRef.current) {
      networkRef.current.stabilize();
    }
  }, [data]);

  // Métodos expuestos
  const fitNetwork = useCallback(() => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuad",
        },
      });
    }
  }, []);

  const togglePhysics = useCallback((enabled: boolean) => {
    if (networkRef.current) {
      networkRef.current.setOptions({ physics: { enabled } });
    }
  }, []);

  const focusNode = useCallback((nodeId: string) => {
    if (networkRef.current) {
      networkRef.current.focus(nodeId, {
        scale: 1.5,
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuad",
        },
      });
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Barra de progreso de estabilización */}
      {isStabilizing && (
        <div className="absolute top-2 left-2 right-2 z-10">
          <div className="bg-slate-800/90 rounded-lg p-2 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <svg
                className="animate-spin h-4 w-4 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Estabilizando grafo... {stabilizationProgress}%</span>
            </div>
            <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                style={{ width: `${stabilizationProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Controles del grafo */}
      <div className="absolute bottom-2 left-2 z-10 flex gap-2">
        <button
          onClick={fitNetwork}
          className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg text-sm backdrop-blur-sm transition-colors"
          title="Ajustar vista"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <button
          onClick={() => togglePhysics(true)}
          className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg text-sm backdrop-blur-sm transition-colors"
          title="Activar física"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          onClick={() => togglePhysics(false)}
          className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg text-sm backdrop-blur-sm transition-colors"
          title="Pausar física"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* Leyenda */}
      <div className="absolute top-2 right-2 z-10 bg-slate-800/90 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-xs text-slate-400 font-medium mb-2">Leyenda</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300">Artículo raíz</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-300">Citas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-300">Referencias</span>
          </div>
        </div>
      </div>

      {/* Contenedor del grafo */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full bg-slate-900 rounded-xl border border-slate-700"
      />
    </div>
  );
}

