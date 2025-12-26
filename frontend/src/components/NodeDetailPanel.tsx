// components/NodeDetailPanel.tsx
// Panel de detalle de un nodo seleccionado

import { useQuery } from "@tanstack/react-query";
import {
  X,
  ExternalLink,
  Users,
  Calendar,
  BookOpen,
  Hash,
  FileText,
} from "lucide-react";
import { obtenerVertice } from "../services/api";

interface NodeDetailPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

export default function NodeDetailPanel({
  nodeId,
  onClose,
}: NodeDetailPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vertice", nodeId],
    queryFn: () => (nodeId ? obtenerVertice(nodeId) : null),
    enabled: !!nodeId,
  });

  if (!nodeId) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-800/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100">
          Detalle del Artículo
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
            Error al cargar el artículo
          </div>
        )}

        {data && (
          <>
            {/* Título */}
            <div>
              <h4 className="text-xl font-medium text-slate-100 leading-tight">
                {data.informacion.title}
              </h4>
            </div>

            {/* Autores */}
            {data.informacion.authors && data.informacion.authors.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-slate-400">
                  {data.informacion.authors.map((author: unknown) => {
                    if (typeof author === 'string') return author;
                    if (typeof author === 'object' && author !== null) {
                      const a = author as { name?: string; nombre?: string };
                      return a.name || a.nombre || 'Desconocido';
                    }
                    return 'Desconocido';
                  }).join(", ")}
                </p>
              </div>
            )}

            {/* Año y Venue */}
            <div className="flex flex-wrap gap-3 text-sm">
              {data.informacion.year && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {data.informacion.year}
                </span>
              )}
              {data.informacion.venue &&
                data.informacion.venue !== "No disponible" && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <BookOpen className="w-4 h-4" />
                    {data.informacion.venue}
                  </span>
                )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-2xl font-bold text-cyan-400">
                  {data.informacion.citationCount}
                </div>
                <div className="text-xs text-slate-500">Citas</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-400">
                  {data.informacion.references.length || 0}
                </div>
                <div className="text-xs text-slate-500">Referencias</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-2xl font-bold text-blue-400">
                  {data.grado_entrada}
                </div>
                <div className="text-xs text-slate-500">Grado entrada</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="text-2xl font-bold text-purple-400">
                  {data.grado_salida}
                </div>
                <div className="text-xs text-slate-500">Grado salida</div>
              </div>
            </div>

            {/* DOI */}
            {data.informacion.doi && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400 font-mono">
                  {data.informacion.doi}
                </span>
              </div>
            )}

            {/* Abstract */}
            {data.informacion.abstract &&
              data.informacion.abstract !== "No disponible" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-300">
                      Abstract
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {data.informacion.abstract.length > 500
                      ? data.informacion.abstract.substring(0, 500) + "..."
                      : data.informacion.abstract}
                  </p>
                </div>
              )}

            {/* Enlaces */}
            <div className="pt-2 border-t border-slate-700/50">
              {data.informacion.url && (
                <a
                  href={data.informacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en fuente original
                </a>
              )}
              {data.informacion.doi && (
                <a
                  href={`https://doi.org/${data.informacion.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mt-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en DOI.org
                </a>
              )}
            </div>

            {/* Tipo de nodo */}
            <div className="pt-2 border-t border-slate-700/50">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  data.tipo === "raiz"
                    ? "bg-red-500/20 text-red-400"
                    : data.tipo === "cita"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : data.tipo === "referencia"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {data.tipo || "Sin tipo"}
              </span>
              {data.motor && (
                <span className="ml-2 text-xs text-slate-500">
                  vía {data.motor}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

