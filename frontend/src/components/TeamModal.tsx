import { useState } from "react";
import { X, Users, Mail, Copy, Check, BookOpen, Quote } from "lucide-react";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const teamMembers = [
  "Dr. José Luis Gómez Ramos",
  "Dr. Arturo Corona Ferreira",
  "Dra. Juana Magnolia Burelo Burelo",
  "Dr. Carlos Arturo Custodio Izquierdo",
  "Dr. Eduardo Cruces Gutiérrez",
  "Dr. Carlos González Zacarías",
  "Dr. José Manuel Rodríguez Hernández",
  "Dr. María Alejandrina Almeida Aguilar",
  "Dr. Rubén Jerónimo Yedra",
  "Dr. Eric Ramos Méndez",
  "Dr. Guillermo de los Santos Torres",
  "Dr. Gilberto Murillo González",
  "Dr. Pablo Payro Campos",
  "Dra. Karla Paola Martínez Rámila",
  "Dra. Karla Alejandra Zurita Cruz",
];

const citations = [
  {
    id: "apa",
    label: "Formato APA (7ª Edición)",
    color: "cyan",
    reference:
      'Gómez Ramos, J. L., Corona Ferreira, A., Burelo Burelo, J. M., Custodio Izquierdo, C. A., Cruces Gutiérrez, E., González Zacarías, C., Rodríguez Hernández, J. M., Almeida Aguilar, M. A., Jerónimo Yedra, R., Ramos Méndez, E., de los Santos Torres, G., Murillo González, G., Payro Campos, P., & Martinez Rámila, K. P. (2026). Grafocitas: Dashboard de análisis de redes de citaciones académicas (Versión 1.0.0) [Software]. https://grafocitas.com',
    extras: [
      {
        label: "Cita dentro del texto (Parentética)",
        text: "(Gómez Ramos et al., 2026)",
      },
      {
        label: "Cita narrativa",
        text: "Gómez Ramos et al. (2026)",
      },
    ],
  },
  {
    id: "vancouver",
    label: "Formato Vancouver",
    color: "green",
    reference:
      "Gómez Ramos JL, Corona Ferreira A, Burelo Burelo JM, Custodio Izquierdo CA, Cruces Gutiérrez E, González Zacarías C, et al. Grafocitas: Dashboard de análisis de redes de citaciones académicas [Internet]. Versión 1.0.0. México; 2026 [citado 2026 mar 2]. Disponible en: https://grafocitas.com",
    extras: [],
  },
  {
    id: "ieee",
    label: "Formato IEEE",
    color: "purple",
    reference:
      '[1] J. L. Gómez Ramos et al., "Grafocitas: Dashboard de análisis de redes de citaciones académicas," versión 1.0.0, 2026. [En línea]. Disponible: https://grafocitas.com. [Accedido: 02-mar-2026].',
    extras: [
      {
        label: "Cita en el texto",
        text: "[1] El número de cita que corresponda dentro del texto",
      },
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    icon: "text-cyan-400",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: "text-green-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    icon: "text-purple-400",
  },
};

export default function TeamModal({ isOpen, onClose }: TeamModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Equipo de Investigación y Desarrollo
              </h2>
              <p className="text-sm text-slate-400">grafocitas.com</p>
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
          {/* Team Members */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <div className="w-2 h-2 bg-cyan-500/60 rounded-full flex-shrink-0" />
                  <span className="text-sm text-slate-200 font-medium">
                    {member}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-400">
                  Informes y comentarios de la herramienta:
                </p>
                <a
                  href="mailto:jose.gomez@ujat.mx"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  jose.gomez@ujat.mx
                </a>
              </div>
            </div>
          </div>

          {/* Citation Formats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-200">
                Cómo citar esta herramienta
              </h3>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Se sugiere atender acorde al formato de su publicación la
              siguiente estructura:
            </p>

            <div className="space-y-5">
              {citations.map((cit) => {
                const colors = colorMap[cit.color];
                return (
                  <div
                    key={cit.id}
                    className={`rounded-xl border ${colors.border} overflow-hidden`}
                  >
                    <div
                      className={`flex items-center gap-2 px-4 py-3 ${colors.bg}`}
                    >
                      <Quote className={`w-4 h-4 ${colors.icon}`} />
                      <h4
                        className={`text-sm font-semibold ${colors.text}`}
                      >
                        {cit.label}
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Main reference */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">
                          Referencia bibliográfica completa
                        </p>
                        <div className="relative group">
                          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 rounded-lg p-3 pr-10">
                            {cit.reference}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(cit.reference, `${cit.id}-ref`)
                            }
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copiar referencia"
                          >
                            {copiedId === `${cit.id}-ref` ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Extra citation forms */}
                      {cit.extras.map((extra, i) => (
                        <div key={i}>
                          <p className="text-xs text-slate-500 mb-1.5 font-medium">
                            {extra.label}:
                          </p>
                          <div className="relative group">
                            <p className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 pr-10 font-mono">
                              {extra.text}
                            </p>
                            <button
                              onClick={() =>
                                handleCopy(
                                  extra.text,
                                  `${cit.id}-extra-${i}`
                                )
                              }
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                              title="Copiar cita"
                            >
                              {copiedId === `${cit.id}-extra-${i}` ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              grafocitas.com — Versión 1.0.0 — 2026
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
