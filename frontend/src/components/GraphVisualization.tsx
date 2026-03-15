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
  /** Llamado al soltar un nodo tras arrastrarlo; sirve para guardar x,y en el backend (Guardar Pro). */
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void | Promise<void>;
  /** Llamado con la posición x,y en vivo: al hacer click en el nodo (dragStart), mientras se mueve (dragging) y al soltar (dragEnd). Para mostrar en pantalla el valor actual. */
  onPositionLive?: (nodeId: string, x: number, y: number) => void;
  height?: string;
  className?: string;
}

/**
 * Si el grafo tiene al menos un nodo con coordenadas guardadas (x,y distintas de 0,0),
 * no usar Force Atlas (respetar posiciones, ej. Leer Pro). Si no hay ninguna posición
 * válida, activar Force Atlas para organizar el grafo al cargar.
 */
function graphHasSavedPositions(nodes: VisNode[]): boolean {
  if (!nodes?.length) return false;
  return nodes.some(
    (n) =>
      typeof n.x === "number" &&
      typeof n.y === "number" &&
      (n.x !== 0 || n.y !== 0)
  );
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
  onNodePositionChange,
  onPositionLive,
  height = "600px",
  className = "",
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<VisNode> | null>(null);
  const edgesRef = useRef<DataSet<VisEdge> | null>(null);
  // Refs estables para callbacks
  const onNodePositionChangeRef = useRef(onNodePositionChange);
  onNodePositionChangeRef.current = onNodePositionChange;
  const onPositionLiveRef = useRef(onPositionLive);
  onPositionLiveRef.current = onPositionLive;
  // Ref que almacena el nodo siendo arrastrado actualmente
  const draggingNodeRef = useRef<string | null>(null);
  // Refs directos al DOM del overlay HUD de coordenadas (sin pasar por React state = sin lag)
  const hudOverlayRef = useRef<HTMLDivElement | null>(null);
  const hudXRef = useRef<HTMLSpanElement | null>(null);
  const hudYRef = useRef<HTMLSpanElement | null>(null);
  const [isStabilizing, setIsStabilizing] = useState(true);
  const [stabilizationProgress, setStabilizationProgress] = useState(0);

  /**
   * Lee la posición del nodo desde vis.js y:
   * 1. Actualiza el overlay HUD directamente en el DOM (sin React state = instantáneo)
   * 2. Notifica via onPositionLive al panel de detalle (React state, puede llegar con lag)
   */
  const updatePositionDisplay = useCallback((nodeId: string) => {
    if (!networkRef.current) return;
    const pos = networkRef.current.getPositions([nodeId]);
    if (!pos?.[nodeId]) return;
    const { x, y } = pos[nodeId];
    // Actualización directa al DOM: sin re-render de React, completamente inmediata
    if (hudXRef.current) hudXRef.current.textContent = x.toFixed(2);
    if (hudYRef.current) hudYRef.current.textContent = y.toFixed(2);
    // También notificar al panel de detalle via React (eventual)
    onPositionLiveRef.current?.(nodeId, x, y);
  }, []);

  // Inicializar la red
  useEffect(() => {
    if (!containerRef.current) return;

    const hasPositions = graphHasSavedPositions(data.nodes);
    const options: Options = hasPositions
      ? { ...defaultOptions, physics: { enabled: false } }
      : defaultOptions;

    // Crear DataSets
    nodesRef.current = new DataSet<VisNode>(data.nodes);
    edgesRef.current = new DataSet<VisEdge>(data.edges);

    const networkData: Data = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
    };

    // Crear la red (con física desactivada si el grafo trae posiciones, ej. Pro)
    networkRef.current = new Network(
      containerRef.current,
      networkData,
      options
    );

    // Event handlers
    networkRef.current.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        // Al abrir el panel, mostrar la posición real del nodo en el canvas (no 0,0 del backend)
        updatePositionDisplay(nodeId);
        if (onNodeClick) onNodeClick(nodeId);
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
      // Desactivar física para que los nodos se queden donde el usuario los suelte
      networkRef.current?.setOptions({ physics: { enabled: false } });
      // Actualizar el tooltip (title) de cada nodo con la posición real asignada por Force Atlas,
      // para que al hacer hover se muestren las coordenadas correctas (no 0,0 del backend)
      if (nodesRef.current && networkRef.current) {
        const allIds = nodesRef.current.getIds() as string[];
        const positions = networkRef.current.getPositions(allIds);
        const updates: Array<Partial<VisNode> & { id: string; title: string }> = [];
        for (const id of allIds) {
          const pos = positions[id];
          if (!pos) continue;
          const node = nodesRef.current.get(id) as (VisNode & { title?: string }) | undefined;
          if (!node) continue;
          const base = (node.title ?? "").replace(/\nCoordenadas en canvas:.*$/s, "").trimEnd();
          updates.push({
            id,
            title: base + `\nCoordenadas en canvas: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}`,
          } as Partial<VisNode> & { id: string; title: string });
        }
        if (updates.length > 0) nodesRef.current.update(updates);
      }
    });

    // Si el grafo ya trae posiciones (Pro), no hay estabilización
    if (hasPositions) {
      setIsStabilizing(false);
      setStabilizationProgress(100);
    }

    // ── Arrastre de nodos ──────────────────────────────────────────────────────────
    // dragStart: registrar qué nodo se está arrastrando y mostrar HUD
    networkRef.current.on("dragStart", (params: { nodes: string[] }) => {
      if (params.nodes.length === 0) return;
      draggingNodeRef.current = params.nodes[0];
      if (hudOverlayRef.current) hudOverlayRef.current.style.display = "flex";
      updatePositionDisplay(params.nodes[0]);
    });

    // dragEnd: leer posición final exacta desde vis.js, actualizar tooltip y guardar en backend
    networkRef.current.on("dragEnd", (params: { nodes: string[] }) => {
      const nodeId = draggingNodeRef.current ?? params.nodes[0];
      draggingNodeRef.current = null;
      if (hudOverlayRef.current) hudOverlayRef.current.style.display = "none";
      if (!nodeId || !networkRef.current || !nodesRef.current) return;

      const pos = networkRef.current.getPositions([nodeId]);
      if (pos?.[nodeId]) {
        const x = pos[nodeId].x;
        const y = pos[nodeId].y;
        if (hudXRef.current) hudXRef.current.textContent = x.toFixed(2);
        if (hudYRef.current) hudYRef.current.textContent = y.toFixed(2);
        onPositionLiveRef.current?.(nodeId, x, y);
        // Actualizar tooltip del nodo con coordenadas finales
        const node = nodesRef.current.get(nodeId) as (VisNode & { title?: string }) | undefined;
        const baseTitle = node?.title ?? "";
        const coordsLine = `\nCoordenadas en canvas: x=${x.toFixed(2)}, y=${y.toFixed(2)}`;
        const newTitle = baseTitle.replace(/\nCoordenadas en canvas:.*$/s, "").trimEnd() + coordsLine;
        nodesRef.current.update({
          id: nodeId, x, y, title: newTitle,
        } as Partial<VisNode> & { id: string; title: string });
        onNodePositionChangeRef.current?.(nodeId, x, y);
      }
    });

    // ── Tracking de mouse via DOM nativo ──────────────────────────────────────────
    // vis.js crea un <canvas> dentro del contenedor. Escuchamos mousemove directamente
    // sobre ese canvas para obtener coordenadas DOM y convertirlas a canvas con DOMtoCanvas().
    // Esto es MÁS CONFIABLE que el evento "dragging" de vis.js en ciertos builds.
    const visCanvas = containerRef.current.querySelector("canvas");
    const onMouseMove = (e: MouseEvent) => {
      const nodeId = draggingNodeRef.current;
      if (!nodeId || !networkRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Coordenadas del puntero relativas al contenedor del grafo
      const domPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      // Convertir coordenadas DOM → coordenadas del canvas de vis.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvasPos = (networkRef.current as any).DOMtoCanvas(domPos) as { x: number; y: number };
      // Actualizar HUD directamente en el DOM (sin React state = sin lag)
      if (hudXRef.current) hudXRef.current.textContent = canvasPos.x.toFixed(2);
      if (hudYRef.current) hudYRef.current.textContent = canvasPos.y.toFixed(2);
      // Notificar al panel de detalle via React (asíncrono pero eventual)
      onPositionLiveRef.current?.(nodeId, canvasPos.x, canvasPos.y);
    };
    visCanvas?.addEventListener("mousemove", onMouseMove);

    // Cleanup
    return () => {
      visCanvas?.removeEventListener("mousemove", onMouseMove);
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [updatePositionDisplay]);

  // Actualizar datos cuando cambien
  useEffect(() => {
    if (!nodesRef.current || !edgesRef.current || !networkRef.current) return;

    const hasPositions = graphHasSavedPositions(data.nodes);

    if (hasPositions) {
      setIsStabilizing(false);
      setStabilizationProgress(100);
      networkRef.current.setOptions({ physics: { enabled: false } });
    } else {
      setIsStabilizing(true);
      setStabilizationProgress(0);
    }

    // Limpiar y agregar nuevos datos
    nodesRef.current.clear();
    edgesRef.current.clear();
    nodesRef.current.add(data.nodes);
    edgesRef.current.add(data.edges);

    // Re-estabilizar solo si hay física (sin posiciones guardadas)
    if (!hasPositions && networkRef.current) {
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

  // focusNode method removed - not currently used

  return (
    <div className={`relative ${className}`}>
      {/* ── HUD de coordenadas en vivo ──
          Se muestra SOLO mientras el usuario arrastra un nodo.
          Actualizado directamente via DOM refs (sin React state = sin lag de re-render).
          Se oculta automáticamente al soltar el mouse (dragEnd). */}
      <div
        ref={hudOverlayRef}
        style={{ display: "none" }}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none
                   bg-slate-950/95 border border-amber-500/70 rounded-xl
                   px-5 py-2.5 flex items-center gap-4 shadow-2xl shadow-black/60
                   backdrop-blur-sm"
      >
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Canvas</span>
        <span className="font-mono text-sm text-slate-300">
          x:{" "}
          <span
            ref={hudXRef}
            className="text-amber-400 font-bold text-base tabular-nums min-w-[70px] inline-block"
          >
            —
          </span>
        </span>
        <span className="font-mono text-sm text-slate-300">
          y:{" "}
          <span
            ref={hudYRef}
            className="text-amber-400 font-bold text-base tabular-nums min-w-[70px] inline-block"
          >
            —
          </span>
        </span>
      </div>

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

