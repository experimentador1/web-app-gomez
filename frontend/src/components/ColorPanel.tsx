// components/ColorPanel.tsx
// Panel de control de colores y visualización

import { useState } from "react";
import { Palette, Check } from "lucide-react";

interface ColorPanelProps {
  hasData: boolean;
  onApplyColors: (palette: string, value: number) => void;
  maxValue: number;
}

const PALETAS = [
  { value: "azul-amarillo", label: "Azul→Amarillo" },
  { value: "amarillo-azul", label: "Amarillo→Azul" },
  { value: "viridis", label: "Viridis" },
  { value: "inferno", label: "Inferno" },
  { value: "pastel", label: "Pastel" },
  { value: "calido", label: "Cálido" },
  { value: "frio", label: "Frío" },
];

export default function ColorPanel({
  hasData,
  onApplyColors,
  maxValue,
}: ColorPanelProps) {
  const [paleta, setPaleta] = useState("azul-amarillo");
  const [valor, setValor] = useState(1);
  const [modoAbsoluto, setModoAbsoluto] = useState(true);

  const handleApply = () => {
    onApplyColors(paleta, valor);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5">
      <h2 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-400" />
        Colores
      </h2>

      <div className="space-y-4">
        {/* Paleta de colores */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Paleta
          </label>
          <select
            value={paleta}
            onChange={(e) => setPaleta(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-base"
            disabled={!hasData}
          >
            {PALETAS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vista previa de paleta */}
        <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-400 to-yellow-400" />

        {/* Modo Absoluto/Relativo */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Modo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModoAbsoluto(true)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all text-base font-medium ${
                modoAbsoluto
                  ? "bg-purple-500/20 border-purple-500 text-purple-400"
                  : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
              disabled={!hasData}
            >
              {modoAbsoluto && <Check className="w-4 h-4" />}
              Absoluto
            </button>
            <button
              type="button"
              onClick={() => setModoAbsoluto(false)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all text-base font-medium ${
                !modoAbsoluto
                  ? "bg-purple-500/20 border-purple-500 text-purple-400"
                  : "bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
              disabled={!hasData}
            >
              {!modoAbsoluto && <Check className="w-4 h-4" />}
              Relativo
            </button>
          </div>
        </div>

        {/* Valor para colorear */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Valor: {valor}
          </label>
          <input
            type="range"
            min="1"
            max={Math.max(10, maxValue)}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="w-full accent-purple-500 h-2"
            disabled={!hasData}
          />
        </div>

        {/* Botón aplicar */}
        <button
          onClick={handleApply}
          disabled={!hasData}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-purple-500/20"
        >
          <Palette className="w-5 h-5" />
          Aplicar colores
        </button>
      </div>
    </div>
  );
}

