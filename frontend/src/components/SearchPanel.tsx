// components/SearchPanel.tsx
// Panel de búsqueda de artículos con todas las opciones

import { useState } from "react";
import {
  Search,
  BookOpen,
  GitBranch,
  Loader2,
  User,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  BusquedaRequest,
  MotorBusqueda,
  TipoBusqueda,
} from "../types/grafo";

interface SearchPanelProps {
  onSearch: (request: BusquedaRequest) => void;
  isLoading: boolean;
}

const MOTORES: { value: MotorBusqueda; label: string }[] = [
  { value: "semantic_scholar", label: "Semantic Scholar" },
  { value: "open_citations", label: "Open Citations" },
  { value: "crossref", label: "CrossRef" },
  { value: "openalex", label: "OpenAlex" },
  { value: "europe_pmc", label: "Europe PMC" },
  { value: "lens", label: "Lens.org" },
  { value: "openaire", label: "OpenAIRE" },
  { value: "datacite", label: "DataCite" },
  { value: "zenodo", label: "Zenodo" },
  { value: "orcid", label: "ORCID" },
];

export default function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [titulo, setTitulo] = useState("");
  const [motor, setMotor] = useState<MotorBusqueda>("semantic_scholar");
  const [tipo, setTipo] = useState<TipoBusqueda>("citas");
  const [niveles, setNiveles] = useState(1);
  const [maxHijos, setMaxHijos] = useState<number>(20);
  const [sinLimite, setSinLimite] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Opciones avanzadas
  const [limiteArticulos, setLimiteArticulos] = useState(1000);
  const [pausa, setPausa] = useState(0.7);
  const [hilos, setHilos] = useState(6);
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onSearch({
      titulo: titulo.trim(),
      motor,
      tipo,
      niveles,
      max_hijos: sinLimite ? undefined : maxHijos,
      api_key: apiKey || undefined,
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
      <h2 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
        <Search className="w-5 h-5 text-cyan-400" />
        Buscar Artículos
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de título */}
        <div>
          <label
            htmlFor="titulo"
            className="block text-sm font-semibold text-slate-300 mb-2"
          >
            Nombre (Título o DOI)
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Deep Learning for NLP"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-base"
            disabled={isLoading}
          />
        </div>

        {/* Motor y Niveles en una fila */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Motores
            </label>
            <select
              value={motor}
              onChange={(e) => setMotor(e.target.value as MotorBusqueda)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-base"
              disabled={isLoading}
            >
              {MOTORES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Niveles
            </label>
            <select
              value={niveles}
              onChange={(e) => setNiveles(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-base"
              disabled={isLoading}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de búsqueda - 3 botones */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Buscar
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTipo("citas")}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all text-base font-medium ${
                tipo === "citas"
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                  : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
              disabled={isLoading}
            >
              <BookOpen className="w-5 h-5" />
              Citas
            </button>
            <button
              type="button"
              onClick={() => setTipo("referencias")}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all text-base font-medium ${
                tipo === "referencias"
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
              disabled={isLoading}
            >
              <GitBranch className="w-5 h-5" />
              Referencias
            </button>
            <button
              type="button"
              onClick={() => setTipo("autor")}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all text-base font-medium ${
                tipo === "autor"
                  ? "bg-purple-500/20 border-purple-500 text-purple-400"
                  : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
              disabled={isLoading}
            >
              <User className="w-5 h-5" />
              Autor
            </button>
          </div>
        </div>

        {/* Máx. hijos con checkbox Sin límite */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Máx. hijos
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={maxHijos}
              onChange={(e) => setMaxHijos(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 text-base disabled:opacity-50"
              disabled={isLoading || sinLimite}
            />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-3 text-base text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sinLimite}
                onChange={(e) => setSinLimite(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900/50 text-cyan-500 focus:ring-cyan-500/50 w-5 h-5"
                disabled={isLoading}
              />
              Sin límite
            </label>
          </div>
        </div>

        {/* Toggle opciones avanzadas */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          Opciones avanzadas
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Opciones avanzadas colapsables */}
        {showAdvanced && (
          <div className="space-y-3 p-3 bg-slate-900/30 rounded-xl border border-slate-700/50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Límite artículos
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={limiteArticulos}
                  onChange={(e) => setLimiteArticulos(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Pausa (s)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={pausa}
                  onChange={(e) => setPausa(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Hilos
                </label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={hilos}
                  onChange={(e) => setHilos(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 text-sm placeholder-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botón de búsqueda */}
        <button
          type="submit"
          disabled={isLoading || !titulo.trim()}
          className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:shadow-none text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar{" "}
              {tipo === "citas"
                ? "Citas"
                : tipo === "referencias"
                ? "Referencias"
                : "por Autor"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
