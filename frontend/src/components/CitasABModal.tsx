// components/CitasABModal.tsx
// Modal para mostrar el reporte de clasificación Citas A/B

import { X, Circle, Users } from "lucide-react";

interface CitasABReporte {
  mensaje: string;
  total_vertices: number;
  clasificados: {
    A: number;
    B: number;
    AB: number;
    S: number;
  };
  detalles: {
    vertices_A: string[];
    vertices_B: string[];
    vertices_AB: string[];
    vertices_S: string[];
  };
}

interface CitasABModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: CitasABReporte | null;
}

export default function CitasABModal({
  isOpen,
  onClose,
  reporte,
}: CitasABModalProps) {
  if (!isOpen || !reporte) return null;

  const { clasificados, total_vertices } = reporte;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Reporte Citas A/B
              </h2>
              <p className="text-sm text-slate-400">
                Clasificación por coincidencia de autores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Resumen principal */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                <span className="text-sm font-medium text-red-400">Tipo A</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{clasificados.A}</p>
              <p className="text-xs text-slate-500 mt-1">Solo citas</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-cyan-500 text-cyan-500" />
                <span className="text-sm font-medium text-cyan-400">Tipo B</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{clasificados.B}</p>
              <p className="text-xs text-slate-500 mt-1">Con referencias</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-400">Tipo AB</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{clasificados.AB}</p>
              <p className="text-xs text-slate-500 mt-1">Raíz con refs</p>
            </div>

            <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-gray-500 text-gray-500" />
                <span className="text-sm font-medium text-gray-400">Tipo S</span>
              </div>
              <p className="text-2xl font-bold text-gray-400">{clasificados.S}</p>
              <p className="text-xs text-slate-500 mt-1">Sin clasificar</p>
            </div>
          </div>

          {/* Descripción del algoritmo */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Clasificación de vértices
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 font-medium">Tipo A (Solo citas)</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Vértices que solo reciben citas, no citan a otros (grado entrada &gt; 0, grado salida = 0)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 font-medium">Tipo B (Con referencias)</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Vértices que citan a otros artículos (grado salida &gt; 0)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 font-medium">Tipo AB (Raíz con referencias)</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Vértices raíz de la búsqueda que además citan a otros (tipo='raiz' y grado salida &gt; 0)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 font-medium">Tipo S (Sin clasificar)</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Vértices sin citas ni referencias (grado entrada = 0, grado salida = 0)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Distribución</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo A (Solo citas)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${(clasificados.A / total_vertices) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {((clasificados.A / total_vertices) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo B (Con referencias)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500" 
                      style={{ width: `${(clasificados.B / total_vertices) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {((clasificados.B / total_vertices) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo AB (Raíz+refs)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ width: `${(clasificados.AB / total_vertices) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {((clasificados.AB / total_vertices) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo S (Sin clasificar)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500" 
                      style={{ width: `${(clasificados.S / total_vertices) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {((clasificados.S / total_vertices) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Total artículos analizados: <span className="text-slate-300 font-medium">{total_vertices}</span>
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

