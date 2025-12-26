// components/Toolbar.tsx
// Barra de herramientas con métricas y acciones - Diseño mejorado

import {
  Calculator,
  BarChart3,
  Palette,
  Eye,
  EyeOff,
  Undo2,
  Trash2,
  Target,
  TrendingUp,
  Share2,
  Compass,
  Layers,
  Users,
} from "lucide-react";

interface ToolbarProps {
  hasData: boolean;
  onCalculateDensidad: () => void;
  onCalculateCentralidad: () => void;
  onCalculatePageRank: () => void;
  onCalculateBetweenness: () => void;
  onCalculateCloseness: () => void;
  onCitasAB: () => void;
  onShowStats: () => void;
  onToggleLabels: () => void;
  onApplyColors: () => void;
  onShowAll: () => void;
  onUndo: () => void;
  onClear: () => void;
  showLabels: boolean;
  isCalculating: boolean;
}

export default function Toolbar({
  hasData,
  onCalculateDensidad,
  onCalculateCentralidad,
  onCalculatePageRank,
  onCalculateBetweenness,
  onCalculateCloseness,
  onCitasAB,
  onShowStats,
  onToggleLabels,
  onShowAll,
  onUndo,
  onClear,
  showLabels,
  isCalculating,
}: ToolbarProps) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Grupo: Calcular Métricas */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Calcular
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCalculateDensidad}
              disabled={!hasData || isCalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Calcular densidad del grafo"
            >
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Densidad</span>
            </button>
            <button
              onClick={onCalculateCentralidad}
              disabled={!hasData || isCalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Calcular centralidad de grado"
            >
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Centralidad</span>
            </button>
            <button
              onClick={onCalculatePageRank}
              disabled={!hasData || isCalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Calcular PageRank"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">PageRank</span>
            </button>
            <button
              onClick={onCalculateBetweenness}
              disabled={!hasData || isCalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Calcular Betweenness"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Betweenness</span>
            </button>
            <button
              onClick={onCalculateCloseness}
              disabled={!hasData || isCalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Calcular Closeness"
            >
              <Compass className="w-4 h-4" />
              <span className="text-sm font-medium">Closeness</span>
            </button>
            <button
              onClick={onCitasAB}
              disabled={!hasData || isCalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Clasificar Citas A/B por autores"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Citas A/B</span>
            </button>
          </div>
        </div>

        {/* Separador visual */}
        <div className="h-8 w-px bg-slate-700/50" />

        {/* Grupo: Visualización */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Ver
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onShowStats}
              disabled={!hasData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Ver estadísticas completas"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Estadísticas</span>
            </button>
            <button
              onClick={onToggleLabels}
              disabled={!hasData}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                showLabels
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-slate-700/60 text-slate-200 border-slate-600/50"
              }`}
              title={showLabels ? "Ocultar etiquetas" : "Mostrar etiquetas"}
            >
              {showLabels ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Etiquetas</span>
            </button>
            <button
              onClick={onShowAll}
              disabled={!hasData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Mostrar todos los nodos"
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Mostrar todo</span>
            </button>
          </div>
        </div>

        {/* Separador visual */}
        <div className="h-8 w-px bg-slate-700/50" />

        {/* Grupo: Acciones */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Editar
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onUndo}
              disabled={!hasData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Deshacer última acción"
            >
              <Undo2 className="w-4 h-4" />
              <span className="text-sm font-medium">Deshacer</span>
            </button>
            <button
              onClick={onClear}
              disabled={!hasData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Borrar todo el grafo"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Borrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
