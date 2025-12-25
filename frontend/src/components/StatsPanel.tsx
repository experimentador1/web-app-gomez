// components/StatsPanel.tsx
// Panel compacto de estadísticas del grafo

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Network, GitFork, Percent } from "lucide-react";
import { obtenerEstadisticas } from "../services/api";

interface StatsPanelProps {
  hasData: boolean;
}

export default function StatsPanel({ hasData }: StatsPanelProps) {
  const { data: estadisticas, isLoading } = useQuery({
    queryKey: ["estadisticas"],
    queryFn: obtenerEstadisticas,
    enabled: hasData,
    refetchInterval: hasData ? 10000 : false,
  });

  if (!hasData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          Estadísticas
        </h2>
        <p className="text-base text-slate-500">
          Realiza una búsqueda para ver estadísticas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
      <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-green-400" />
        Estadísticas
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-xl p-4 text-center">
            <Network className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-100">
              {estadisticas?.num_vertices ?? 0}
            </div>
            <div className="text-sm text-slate-500 mt-1">Vértices</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 text-center">
            <GitFork className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-100">
              {estadisticas?.num_aristas ?? 0}
            </div>
            <div className="text-sm text-slate-500 mt-1">Aristas</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 text-center">
            <Percent className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-100">
              {((estadisticas?.densidad ?? 0) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-500 mt-1">Densidad</div>
          </div>
        </div>
      )}
    </div>
  );
}
