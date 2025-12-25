// components/StatsModal.tsx
// Modal de estadísticas detalladas

import { X, TrendingUp, Network, Target, Share2 } from "lucide-react";
import type { MetricasResponse } from "../types/grafo";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricas: MetricasResponse | null;
  numVertices: number;
  numAristas: number;
}

export default function StatsModal({
  isOpen,
  onClose,
  metricas,
  numVertices,
  numAristas,
}: StatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">
            Estadísticas del Grafo
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Métricas básicas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {numVertices}
              </div>
              <div className="text-sm text-slate-400 mt-1">Vértices</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {numAristas}
              </div>
              <div className="text-sm text-slate-400 mt-1">Aristas</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {((metricas?.densidad || 0) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-400 mt-1">Densidad</div>
            </div>
          </div>

          {/* Top PageRank */}
          {metricas?.top_10_pagerank && metricas.top_10_pagerank.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Top 10 PageRank
              </h3>
              <div className="space-y-2">
                {metricas.top_10_pagerank.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 bg-slate-900/30 rounded-lg"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-slate-300 text-sm truncate">
                      {item.titulo}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">
                      {item.valor.toFixed(6)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Centralidad */}
          {metricas?.top_10_centralidad &&
            metricas.top_10_centralidad.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Top 10 Centralidad de Grado
                </h3>
                <div className="space-y-2">
                  {metricas.top_10_centralidad.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-slate-900/30 rounded-lg"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-slate-300 text-sm truncate">
                        {item.titulo}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">
                        {item.valor.toFixed(6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Info adicional */}
          <div className="text-xs text-slate-500 text-center mt-4">
            Los valores de PageRank y Centralidad indican la importancia relativa
            de cada nodo en la red.
          </div>
        </div>
      </div>
    </div>
  );
}

