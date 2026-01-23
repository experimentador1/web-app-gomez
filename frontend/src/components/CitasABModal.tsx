// components/CitasABModal.tsx
// Modal para mostrar el reporte de clasificación Citas A/B
// Basado en Dashboard_articulos.py - 3 corridas del algoritmo

import { useState } from "react";
import { X, Circle, Users, ChevronDown, ChevronRight, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import type { ReporteCitasAB } from "../utils/citasAB";

interface CitasABModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: ReporteCitasAB | null;
}

export default function CitasABModal({
  isOpen,
  onClose,
  reporte,
}: CitasABModalProps) {
  const [expandedSections, setExpandedSections] = useState<{
    corrida1: boolean;
    corrida2: boolean;
    corrida3: boolean;
    A: boolean;
    B: boolean;
    AB: boolean;
    S: boolean;
  }>({
    corrida1: true,
    corrida2: true,
    corrida3: true,
    A: false,
    B: false,
    AB: false,
    S: false,
  });

  if (!isOpen || !reporte) return null;

  const { corrida1, corrida2, corrida3, resumen, grafo } = reporte;

  // Extraer listas de artículos por tipo desde el grafo
  const articulosPorTipo = {
    A: grafo.nodes.filter(n => n.data?.tipo === "A").map(n => n.label || n.id),
    B: grafo.nodes.filter(n => n.data?.tipo === "B").map(n => n.label || n.id),
    AB: grafo.nodes.filter(n => n.data?.tipo === "AB").map(n => n.label || n.id),
    S: grafo.nodes.filter(n => n.data?.tipo === "S").map(n => n.label || n.id),
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
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
                Clasificación por coincidencia de autores (3 corridas)
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          
          {/* RESUMEN PRINCIPAL - Colores según Dashboard */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Tipo A = Azules + Verdes (sin auto-citación) */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-blue-500 text-blue-500" />
                <span className="text-sm font-medium text-blue-400">Tipo A</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{resumen.tipo_A}</p>
              <p className="text-xs text-slate-500 mt-1">Sin auto-citación</p>
            </div>

            {/* Tipo B = Amarillos (auto-citación) */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-400">Tipo B</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{resumen.tipo_B}</p>
              <p className="text-xs text-slate-500 mt-1">Auto-citación</p>
            </div>

            {/* Tipo AB = Verdes (raíces de cadenas B) */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-green-500 text-green-500" />
                <span className="text-sm font-medium text-green-400">Tipo AB</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{resumen.tipo_AB}</p>
              <p className="text-xs text-slate-500 mt-1">Raíces cadenas B</p>
            </div>

            {/* Tipo S = Rojos (sin autores) */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                <span className="text-sm font-medium text-red-400">Tipo S</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{resumen.tipo_S}</p>
              <p className="text-xs text-slate-500 mt-1">Sin autores</p>
            </div>
          </div>

          {/* Las 3 CORRIDAS */}
          <div className="space-y-4 mb-6">
            
            {/* CORRIDA 1: Clasificación inicial */}
            <div className="bg-slate-800/30 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("corrida1")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-slate-200">Corrida 1: Clasificación Inicial</span>
                    <p className="text-xs text-slate-500">Vértices con autores → Azul (Tipo A)</p>
                  </div>
                </div>
                {expandedSections.corrida1 ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSections.corrida1 && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                      <p className="text-slate-500 text-xs">Total vértices</p>
                      <p className="text-lg font-bold text-slate-200">{corrida1.total_vertices}</p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg text-center">
                      <p className="text-blue-400 text-xs">Pintados Azul</p>
                      <p className="text-lg font-bold text-blue-400">{corrida1.pintados_azul}</p>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded-lg text-center">
                      <p className="text-red-400 text-xs">Sin autores</p>
                      <p className="text-lg font-bold text-red-400">{corrida1.omitidos_sin_autores}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CORRIDA 2: Detección de auto-citación */}
            <div className="bg-slate-800/30 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("corrida2")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-slate-200">Corrida 2: Detección Auto-citación</span>
                    <p className="text-xs text-slate-500">Autores en común → Amarillo (Tipo B)</p>
                  </div>
                </div>
                {expandedSections.corrida2 ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSections.corrida2 && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                      <p className="text-slate-500 text-xs">Aristas evaluadas</p>
                      <p className="text-lg font-bold text-slate-200">{corrida2.aristas_evaluadas}</p>
                    </div>
                    <div className="bg-yellow-500/10 p-3 rounded-lg text-center">
                      <p className="text-yellow-400 text-xs">Pares con auto-cita</p>
                      <p className="text-lg font-bold text-yellow-400">{corrida2.pares_B}</p>
                    </div>
                    <div className="bg-yellow-500/10 p-3 rounded-lg text-center">
                      <p className="text-yellow-400 text-xs">Vértices Amarillo</p>
                      <p className="text-lg font-bold text-yellow-400">{corrida2.vertices_amarillo}</p>
                    </div>
                  </div>
                  {corrida2.muestras.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-2">Ejemplos de auto-citación detectada:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {corrida2.muestras.slice(0, 6).map((m, i) => (
                          <div key={i} className="text-xs bg-slate-900/50 px-2 py-1 rounded">
                            <span className="text-yellow-400">{m.origen.substring(0, 40)}...</span>
                            <span className="text-slate-500"> → </span>
                            <span className="text-yellow-400">{m.destino.substring(0, 40)}...</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CORRIDA 3: Raíces de cadenas AB */}
            <div className="bg-slate-800/30 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("corrida3")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-slate-200">Corrida 3: Raíces de Cadenas AB</span>
                    <p className="text-xs text-slate-500">Vértices B sin salidas a otros B → Verde (Tipo AB)</p>
                  </div>
                </div>
                {expandedSections.corrida3 ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSections.corrida3 && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-green-500/10 p-3 rounded-lg text-center">
                      <p className="text-green-400 text-xs">Raíces AB detectadas</p>
                      <p className="text-lg font-bold text-green-400">{corrida3.raices_ab}</p>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded-lg text-center">
                      <p className="text-green-400 text-xs">Vértices Verde</p>
                      <p className="text-lg font-bold text-green-400">{corrida3.vertices_verde}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción del algoritmo */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Interpretación de Colores
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Azul (Tipo A)</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Artículos con autores que NO comparten autores con los que citan/son citados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Amarillo (Tipo B)</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Auto-citación detectada: comparten al menos un autor con artículos que citan/los citan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Verde (Tipo AB)</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Raíces de cadenas de auto-citación: vértices B que no tienen salidas hacia otros B.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Rojo (Tipo S)</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Sin clasificar: artículos sin información de autores disponible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución visual */}
          <div className="p-4 bg-slate-800/30 rounded-xl mb-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Distribución</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo A (Azul+Verde)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${resumen.total > 0 ? (resumen.tipo_A / resumen.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {resumen.total > 0 ? ((resumen.tipo_A / resumen.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo B (Amarillo)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ width: `${resumen.total > 0 ? (resumen.tipo_B / resumen.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {resumen.total > 0 ? ((resumen.tipo_B / resumen.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo AB (Verde)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${resumen.total > 0 ? (resumen.tipo_AB / resumen.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {resumen.total > 0 ? ((resumen.tipo_AB / resumen.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tipo S (Rojo)</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${resumen.total > 0 ? (resumen.tipo_S / resumen.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-medium w-12 text-right">
                    {resumen.total > 0 ? ((resumen.tipo_S / resumen.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Listas de artículos por tipo */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Artículos por Tipo</h4>
            
            {/* Tipo A - Azules (sin auto-citación) */}
            {articulosPorTipo.A.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("A")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Circle className="w-4 h-4 fill-blue-500 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Tipo A - Sin auto-citación ({articulosPorTipo.A.length} artículos)
                    </span>
                  </div>
                  {expandedSections.A ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {expandedSections.A && (
                  <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {articulosPorTipo.A.slice(0, 50).map((titulo, index) => (
                        <div
                          key={index}
                          className="text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded hover:bg-slate-900 transition-colors"
                        >
                          <span className="text-slate-500 mr-2">{index + 1}.</span>
                          <span className="text-blue-300">{titulo}</span>
                        </div>
                      ))}
                      {articulosPorTipo.A.length > 50 && (
                        <p className="text-xs text-slate-500 italic px-3 py-2">
                          ... y {articulosPorTipo.A.length - 50} artículos más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tipo B - Amarillos (auto-citación) */}
            {articulosPorTipo.B.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("B")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Tipo B - Auto-citación ({articulosPorTipo.B.length} artículos)
                    </span>
                  </div>
                  {expandedSections.B ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {expandedSections.B && (
                  <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {articulosPorTipo.B.slice(0, 50).map((titulo, index) => (
                        <div
                          key={index}
                          className="text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded hover:bg-slate-900 transition-colors"
                        >
                          <span className="text-slate-500 mr-2">{index + 1}.</span>
                          <span className="text-yellow-300">{titulo}</span>
                        </div>
                      ))}
                      {articulosPorTipo.B.length > 50 && (
                        <p className="text-xs text-slate-500 italic px-3 py-2">
                          ... y {articulosPorTipo.B.length - 50} artículos más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tipo AB - Verdes (raíces) */}
            {articulosPorTipo.AB.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("AB")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Circle className="w-4 h-4 fill-green-500 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Tipo AB - Raíces cadenas B ({articulosPorTipo.AB.length} artículos)
                    </span>
                  </div>
                  {expandedSections.AB ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {expandedSections.AB && (
                  <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {articulosPorTipo.AB.slice(0, 50).map((titulo, index) => (
                        <div
                          key={index}
                          className="text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded hover:bg-slate-900 transition-colors"
                        >
                          <span className="text-slate-500 mr-2">{index + 1}.</span>
                          <span className="text-green-300">{titulo}</span>
                        </div>
                      ))}
                      {articulosPorTipo.AB.length > 50 && (
                        <p className="text-xs text-slate-500 italic px-3 py-2">
                          ... y {articulosPorTipo.AB.length - 50} artículos más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tipo S - Rojos (sin autores) */}
            {articulosPorTipo.S.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("S")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Circle className="w-4 h-4 fill-red-500 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Tipo S - Sin autores ({articulosPorTipo.S.length} artículos)
                    </span>
                  </div>
                  {expandedSections.S ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {expandedSections.S && (
                  <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {articulosPorTipo.S.slice(0, 50).map((titulo, index) => (
                        <div
                          key={index}
                          className="text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded hover:bg-slate-900 transition-colors"
                        >
                          <span className="text-slate-500 mr-2">{index + 1}.</span>
                          <span className="text-red-300">{titulo}</span>
                        </div>
                      ))}
                      {articulosPorTipo.S.length > 50 && (
                        <p className="text-xs text-slate-500 italic px-3 py-2">
                          ... y {articulosPorTipo.S.length - 50} artículos más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
