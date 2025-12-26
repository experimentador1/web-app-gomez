// components/CitasABModal.tsx
// Modal para mostrar el reporte de clasificación Citas A/B

import { X, Circle, Users, ArrowRight } from "lucide-react";

interface CitasABReporte {
  corrida1: {
    total_vertices: number;
    pintados_azul: number;
    omitidos_sin_autores: number;
  };
  corrida2: {
    aristas_evaluadas: number;
    pares_B: number;
    vertices_amarillo: number;
    muestras: Array<{ origen: string; destino: string }>;
  };
  corrida3: {
    raices_ab: number;
    vertices_verde: number;
  };
  resumen: {
    tipo_A: number;
    tipo_B: number;
    tipo_AB: number;
    tipo_S: number;
    total: number;
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

  const { corrida1, corrida2, corrida3, resumen } = reporte;

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
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-blue-500 text-blue-500" />
                <span className="text-sm font-medium text-blue-400">Tipo A</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{resumen.tipo_A}</p>
              <p className="text-xs text-slate-500 mt-1">Sin coincidencias</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-400">Tipo B</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{resumen.tipo_B}</p>
              <p className="text-xs text-slate-500 mt-1">Auto-citación</p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                <span className="text-sm font-medium text-green-400">Tipo AB</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{resumen.tipo_AB}</p>
              <p className="text-xs text-slate-500 mt-1">Raíces cadenas</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                <span className="text-sm font-medium text-red-400">Tipo S</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{resumen.tipo_S}</p>
              <p className="text-xs text-slate-500 mt-1">Sin autores</p>
            </div>
          </div>

          {/* Detalles de corridas */}
          <div className="space-y-4">
            {/* Corrida 1 */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs text-blue-400">
                  1
                </span>
                Corrida 1: Clasificación inicial
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Total vértices</p>
                  <p className="text-slate-200 font-medium">{corrida1.total_vertices}</p>
                </div>
                <div>
                  <p className="text-slate-500">Pintados azul</p>
                  <p className="text-blue-400 font-medium">{corrida1.pintados_azul}</p>
                </div>
                <div>
                  <p className="text-slate-500">Sin autores (rojo)</p>
                  <p className="text-red-400 font-medium">{corrida1.omitidos_sin_autores}</p>
                </div>
              </div>
            </div>

            {/* Corrida 2 */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xs text-yellow-400">
                  2
                </span>
                Corrida 2: Detección de auto-citación
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-slate-500">Aristas evaluadas</p>
                  <p className="text-slate-200 font-medium">{corrida2.aristas_evaluadas}</p>
                </div>
                <div>
                  <p className="text-slate-500">Pares tipo B</p>
                  <p className="text-yellow-400 font-medium">{corrida2.pares_B}</p>
                </div>
                <div>
                  <p className="text-slate-500">Vértices amarillo</p>
                  <p className="text-yellow-400 font-medium">{corrida2.vertices_amarillo}</p>
                </div>
              </div>

              {/* Muestras de pares B */}
              {corrida2.muestras.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-2">Ejemplos de auto-citación:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {corrida2.muestras.slice(0, 5).map((muestra, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded"
                      >
                        <span className="truncate max-w-[200px]" title={muestra.origen}>
                          {muestra.origen}
                        </span>
                        <ArrowRight className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        <span className="truncate max-w-[200px]" title={muestra.destino}>
                          {muestra.destino}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Corrida 3 */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center text-xs text-green-400">
                  3
                </span>
                Corrida 3: Raíces de cadenas A/B
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Raíces detectadas</p>
                  <p className="text-green-400 font-medium">{corrida3.raices_ab}</p>
                </div>
                <div>
                  <p className="text-slate-500">Vértices verde</p>
                  <p className="text-green-400 font-medium">{corrida3.vertices_verde}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Leyenda de colores</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-slate-300">A (Azul): Citas independientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-slate-300">B (Amarillo): Auto-citación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-slate-300">AB (Verde): Origen de cadenas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-slate-300">S (Rojo): Sin datos de autor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Total artículos analizados: <span className="text-slate-300 font-medium">{resumen.total}</span>
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

