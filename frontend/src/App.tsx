// App.tsx
// Aplicación principal del Dashboard de Artículos Académicos

import { useState, useCallback, useRef } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { BookOpen, Download, Save, FolderOpen, RefreshCw, Users } from "lucide-react";

import GraphVisualization from "./components/GraphVisualization";
import SearchPanel from "./components/SearchPanel";
import NodeDetailPanel from "./components/NodeDetailPanel";
import StatsPanel from "./components/StatsPanel";
import Toolbar from "./components/Toolbar";
import ColorPanel from "./components/ColorPanel";
import StatsModal from "./components/StatsModal";
import CitasABModal from "./components/CitasABModal";
import TeamModal from "./components/TeamModal";

import {
  buscarSincrono,
  limpiarGrafo,
  obtenerMetricas,
  obtenerEstadisticas,
  importarGrafo,
  importarGrafoProJson,
  importarGrafoProCsv,
  exportarGrafo,
  obtenerGrafo,
  ocultarDependientes,
  mostrarTodosVertices,
  setVerticeVisible,
  setVerticePosicion,
} from "./services/api";
import { ejecutarCitasAB, type ReporteCitasAB } from "./utils/citasAB";
import type { BusquedaRequest, VisJSData, MetricasResponse } from "./types/grafo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Dashboard() {
  const localQueryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [grafoData, setGrafoData] = useState<VisJSData>({
    nodes: [],
    edges: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCitasABModal, setShowCitasABModal] = useState(false);
  const [citasABReport, setCitasABReport] = useState<ReporteCitasAB | null>(null);
  const [metricas, setMetricas] = useState<MetricasResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [exportFormatoPro, setExportFormatoPro] = useState<"pro_json" | "pro_csv">("pro_json");
  const [exportFormatoLite, setExportFormatoLite] = useState<"lite_json" | "lite_csv">("lite_json");
  const [importarComo, setImportarComo] = useState<"lite" | "pro">("pro");
  const [isExporting, setIsExporting] = useState(false);
  /** Posición x,y en vivo del nodo que se está moviendo (desde click hasta release). Para mostrar en pantalla. */
  const [posicionEnVivo, setPosicionEnVivo] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const grafoHistoryRef = useRef<VisJSData[]>([]);
  const MAX_HISTORY = 30;

  const hasData = grafoData.nodes.length > 0;

  const pushToHistory = useCallback((data: VisJSData) => {
    if (data.nodes.length === 0) return;
    const stack = grafoHistoryRef.current;
    stack.push(JSON.parse(JSON.stringify(data)));
    if (stack.length > MAX_HISTORY) stack.shift();
    setCanUndo(stack.length > 0);
  }, []);

  // Handlers de búsqueda: nuevas búsquedas se fusionan con el grafo actual
  const handleSearch = useCallback(async (request: BusquedaRequest) => {
    setIsSearching(true);
    setSearchError(null);
    setSelectedNode(null);

    try {
      if (grafoData.nodes.length > 0) {
        pushToHistory(grafoData);
      }
      const requestConMerge = {
        ...request,
        merge: true,
      };
      const data = await buscarSincrono(requestConMerge);
      setGrafoData(data);
      const stats = await obtenerMetricas(true, false, false);
      setMetricas(stats);
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setSearchError(
        error instanceof Error ? error.message : "Error en la búsqueda"
      );
    } finally {
      setIsSearching(false);
    }
  }, [grafoData, pushToHistory]);

  const handleClearGraph = useCallback(async () => {
    try {
      await limpiarGrafo();
      setGrafoData({ nodes: [], edges: [] });
      setSelectedNode(null);
      setMetricas(null);
      grafoHistoryRef.current = [];
      setCanUndo(false);
      queryClient.invalidateQueries({ queryKey: ["estadisticas"] });
    } catch (error) {
      console.error("Error al limpiar grafo:", error);
    }
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    // Un clic: mostrar panel de detalles
    setSelectedNode(nodeId);
  }, []);

  // Handlers de métricas
  const handleCalculateDensidad = useCallback(async () => {
    if (!hasData) return;
    setIsCalculating(true);
    try {
      const stats = await obtenerEstadisticas();
      alert(`Densidad del grafo: ${(stats.densidad * 100).toFixed(4)}%`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [hasData]);

  const handleCalculateCentralidad = useCallback(async () => {
    if (!hasData) return;
    setIsCalculating(true);
    try {
      const stats = await obtenerMetricas(false, false, false);
      setMetricas(stats);
      setShowStatsModal(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [hasData]);

  const handleCalculatePageRank = useCallback(async () => {
    if (!hasData) return;
    setIsCalculating(true);
    try {
      const stats = await obtenerMetricas(true, false, false);
      setMetricas(stats);
      setShowStatsModal(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [hasData]);

  const handleCalculateBetweenness = useCallback(async () => {
    if (!hasData) return;
    setIsCalculating(true);
    try {
      const stats = await obtenerMetricas(false, true, false);
      setMetricas(stats);
      alert("Betweenness calculado. Ver panel de estadísticas.");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [hasData]);

  const handleCalculateCloseness = useCallback(async () => {
    if (!hasData) return;
    setIsCalculating(true);
    try {
      const stats = await obtenerMetricas(false, false, true);
      setMetricas(stats);
      alert("Closeness calculado. Ver panel de estadísticas.");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [hasData]);

  const handleShowStats = useCallback(() => {
    if (hasData) {
      setShowStatsModal(true);
    }
  }, [hasData]);

  const handleCitasAB = useCallback(() => {
    if (!hasData) return;
    setIsCalculating(true);
    try {
      // Ejecutar las 3 corridas localmente (basado en Dashboard_articulos.py)
      const reporte = ejecutarCitasAB(grafoData);
      setCitasABReport(reporte);
      setShowCitasABModal(true);
      // Actualizar grafo con colores A/B del reporte
      setGrafoData(reporte.grafo);
    } catch (error) {
      console.error("Error al clasificar Citas A/B:", error);
      alert("Error al clasificar Citas A/B");
    } finally {
      setIsCalculating(false);
    }
  }, [hasData, grafoData]);

  const handleToggleLabels = useCallback(() => {
    setShowLabels((prev) => !prev);
    // Actualizar visibilidad de etiquetas en el grafo
    setGrafoData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => ({
        ...node,
        font: { ...node.font, size: showLabels ? 0 : 12 },
      })),
    }));
  }, [showLabels]);

  const handleApplyColors = useCallback(
    (palette: string, value: number) => {
      // Por ahora solo muestra un mensaje
      console.log("Aplicar colores:", palette, value);
    },
    []
  );

  const handleShowAll = useCallback(() => {
    setGrafoData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => ({ ...node, hidden: false })),
    }));
  }, []);

  const handleUndo = useCallback(async () => {
    const stack = grafoHistoryRef.current;
    if (stack.length === 0) return;
    const previous = stack.pop()!;
    setCanUndo(stack.length > 0);
    try {
      await importarGrafo(previous, false);
      setGrafoData(previous);
      setSelectedNode(null);
      if (previous.nodes.length > 0) {
        const stats = await obtenerMetricas(true, false, false);
        setMetricas(stats);
      } else {
        setMetricas(null);
      }
    } catch (error) {
      console.error("Error al deshacer:", error);
      stack.push(previous);
      setCanUndo(stack.length > 0);
    }
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Guardar-Pro: grafo completo (abstract, toda la info). Formatos JSON o CSV.
  const handleGuardarPro = useCallback(async () => {
    if (!hasData) return;
    setIsExporting(true);
    setSearchError(null);
    try {
      await exportarGrafo(exportFormatoPro);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error al exportar Pro";
      const isNetwork =
        /failed to fetch|network error|err_connection_refused/i.test(msg) ||
        (error as { code?: string })?.code === "ERR_NETWORK";
      setSearchError(
        isNetwork
          ? `No se pudo conectar con el servidor. ¿Está corriendo el backend en ${apiBase}?`
          : msg
      );
    } finally {
      setIsExporting(false);
    }
  }, [hasData, exportFormatoPro, apiBase]);

  // Guardar Lite: info básica (artículo, autores, citas). Formatos JSON o CSV.
  const handleGuardarLite = useCallback(async () => {
    if (!hasData) return;
    setIsExporting(true);
    setSearchError(null);
    try {
      await exportarGrafo(exportFormatoLite);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error al exportar Lite";
      const isNetwork =
        /failed to fetch|network error|err_connection_refused/i.test(msg) ||
        (error as { code?: string })?.code === "ERR_NETWORK";
      setSearchError(
        isNetwork
          ? `No se pudo conectar con el servidor. ¿Está corriendo el backend en ${apiBase}?`
          : msg
      );
    } finally {
      setIsExporting(false);
    }
  }, [hasData, exportFormatoLite, apiBase]);

  const handleLoad = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsSearching(true);
      setSearchError(null);
      try {
        if (grafoData.nodes.length > 0) {
          pushToHistory(grafoData);
        }
        let shouldMerge = false;
        try {
          const estadisticas = await obtenerEstadisticas();
          shouldMerge = estadisticas.num_vertices > 0;
        } catch {
          shouldMerge = false;
        }

        if (file.name.toLowerCase().endsWith(".csv")) {
          await importarGrafoProCsv(file, shouldMerge, importarComo);
        } else {
          const content = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res((reader.result as string) ?? "");
            reader.onerror = rej;
            reader.readAsText(file);
          });
          const parsed = JSON.parse(content) as { nodes?: unknown[]; edges?: unknown[] };
          if (!parsed?.nodes || !Array.isArray(parsed.nodes)) {
            throw new Error("El archivo no contiene nodos válidos");
          }
          // Con "Leer Pro" o "Leer Lite" siempre usar el endpoint Pro para que se lean x,y y el resto de atributos
          if (importarComo === "pro" || importarComo === "lite") {
            await importarGrafoProJson({
              nodes: parsed.nodes,
              edges: parsed.edges ?? [],
              merge: shouldMerge,
              tipo: importarComo,
            });
          } else {
            await importarGrafo(
              parsed as { nodes: never[]; edges: never[] },
              shouldMerge
            );
          }
        }

        const grafoActualizado = await obtenerGrafo();
        setGrafoData(grafoActualizado);
        try {
          const stats = await obtenerMetricas(true, false, false);
          setMetricas(stats);
        } catch {
          /* métricas opcionales */
        }
      } catch (error) {
        console.error("Error al importar grafo:", error);
        setSearchError(
          error instanceof Error ? error.message : "Error al importar el archivo"
        );
      } finally {
        setIsSearching(false);
      }
    };
    input.click();
  }, [grafoData, pushToHistory, importarComo]);

  // Función auxiliar para parsear CSV (soporta formato de escritorio)
  const parseCSV = (content: string): { nodes: unknown[]; edges: unknown[] } => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("El archivo CSV está vacío o no tiene datos");
    }

    // Detectar delimitador
    const firstLine = lines[0];
    let delimiter = ",";
    if (firstLine.includes("\t")) delimiter = "\t";
    else if (firstLine.includes(";")) delimiter = ";";
    else if (firstLine.includes("|")) delimiter = "|";

    // Parsear CSV respetando comillas
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/['"]/g, ""));
    const nodes: unknown[] = [];
    const edges: unknown[] = [];
    const nodeIds = new Set<string>();

    // Primera pasada: crear nodos
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = (values[index] || "").replace(/^["']|["']$/g, "").trim();
      });

      const rowType = (row["row_type"] || "").toLowerCase();

      if (rowType === "edge") {
        // Es una arista explícita
        const from = row["source"] || row["from"] || "";
        const to = row["target"] || row["to"] || "";
        if (from && to) {
          edges.push({
            from,
            to,
            weight: parseFloat(row["weight"] || "1") || 1,
          });
        }
      } else {
        // Es un nodo
        const nodeId = row["id"] || "";
        if (nodeId && !nodeIds.has(nodeId)) {
          nodeIds.add(nodeId);
          
          // Extraer información del nodo
          let infoData: Record<string, unknown> = {};
          if (row["info_json"]) {
            try {
              infoData = JSON.parse(row["info_json"]);
            } catch {
              // Ignorar error de parseo
            }
          }

          nodes.push({
            id: nodeId,
            label: row["label"] || row["title"] || infoData["title"] || nodeId,
            title: row["title"] || infoData["title"] || row["label"] || nodeId,
            year: row["year"] ? parseInt(row["year"]) : infoData["year"],
            citationCount: row["citationcount"] 
              ? parseInt(row["citationcount"]) 
              : (infoData["citationCount"] as number) || 0,
            authors: row["authors"] 
              ? row["authors"].split(";").map(a => a.trim())
              : (infoData["authors"] as string[]) || [],
            doi: row["doi"] || infoData["doi"],
            url: row["url"] || infoData["url"],
            color: row["color"],
            capa: row["capa"] ? parseInt(row["capa"]) : 0,
            motor: row["motor"],
            venue: infoData["venue"],
            abstract: infoData["abstract"],
          });

          // Extraer aristas desde columna adyacencias (formato escritorio)
          const adjStr = row["adyacencias"] || row["adjacencies"] || "";
          if (adjStr) {
            try {
              const adjs = JSON.parse(adjStr);
              if (Array.isArray(adjs)) {
                adjs.forEach((adj: unknown) => {
                  if (Array.isArray(adj) && adj.length >= 1) {
                    edges.push({
                      from: nodeId,
                      to: String(adj[0]),
                      weight: adj.length > 1 ? Number(adj[1]) || 1 : 1,
                    });
                  } else if (typeof adj === "object" && adj !== null) {
                    const adjObj = adj as Record<string, unknown>;
                    const dest = adjObj["to"] || adjObj["target"] || adjObj["dest"];
                    if (dest) {
                      edges.push({
                        from: nodeId,
                        to: String(dest),
                        weight: Number(adjObj["weight"] || adjObj["peso"] || 1),
                      });
                    }
                  }
                });
              }
            } catch {
              // Ignorar error de parseo de adyacencias
            }
          }
        }
      }
    }

    console.log(`CSV parseado: ${nodes.length} nodos, ${edges.length} aristas`);
    return { nodes, edges };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">
                  grafocitas.com
                </h1>
                <p className="text-sm text-slate-400">
                  Redes de citaciones y referencias
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors text-sm font-medium border border-slate-700"
                title="Equipo y cómo citar"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Acerca de</span>
              </button>
              <select
                value={importarComo}
                onChange={(e) => setImportarComo(e.target.value as "lite" | "pro")}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium focus:ring-2 focus:ring-cyan-500/50"
                title="Versión del archivo a importar"
              >
                <option value="lite">Lite (info mínima)</option>
                <option value="pro">Pro (grafo completo)</option>
              </select>
              <button
                onClick={handleLoad}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors text-sm font-medium border border-slate-700"
                title="Importar grafo (JSON o CSV). Elige Lite o Pro según el archivo."
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              {hasData && (
                <>
                  <select
                    value={exportFormatoPro}
                    onChange={(e) => setExportFormatoPro(e.target.value as "pro_json" | "pro_csv")}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium focus:ring-2 focus:ring-cyan-500/50"
                    title="Formato Pro (completo)"
                  >
                    <option value="pro_json">Pro JSON</option>
                    <option value="pro_csv">Pro CSV</option>
                  </select>
                  <button
                    onClick={handleGuardarPro}
                    disabled={!hasData || isExporting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors text-sm font-medium border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Guardar-Pro: grafo completo (abstract, autores, citas, referencias, etc.)"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Guardar-Pro</span>
                  </button>
                  <select
                    value={exportFormatoLite}
                    onChange={(e) => setExportFormatoLite(e.target.value as "lite_json" | "lite_csv")}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium focus:ring-2 focus:ring-cyan-500/50"
                    title="Formato Lite (básico: artículo, autores, citas)"
                  >
                    <option value="lite_json">Lite JSON</option>
                    <option value="lite_csv">Lite CSV</option>
                  </select>
                  <button
                    onClick={handleGuardarLite}
                    disabled={!hasData || isExporting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-colors text-sm font-medium border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Guardar Lite: info mínima (artículo, autores, citas)"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{isExporting ? "…" : "Guardar Lite"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar izquierdo */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <SearchPanel onSearch={handleSearch} isLoading={isSearching} />
            <ColorPanel
              hasData={hasData}
              onApplyColors={handleApplyColors}
              maxValue={grafoData.nodes.length}
            />
            <StatsPanel hasData={hasData} />
          </aside>

          {/* Área principal del grafo */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {/* Toolbar */}
            <Toolbar
              hasData={hasData}
              canUndo={canUndo}
              onCalculateDensidad={handleCalculateDensidad}
              onCalculateCentralidad={handleCalculateCentralidad}
              onCalculatePageRank={handleCalculatePageRank}
              onCalculateBetweenness={handleCalculateBetweenness}
              onCalculateCloseness={handleCalculateCloseness}
              onShowStats={handleShowStats}
              onCitasAB={handleCitasAB}
              onToggleLabels={handleToggleLabels}
              onApplyColors={() => {}}
              onShowAll={handleShowAll}
              onUndo={handleUndo}
              onClear={handleClearGraph}
              showLabels={showLabels}
              isCalculating={isCalculating}
            />

            {/* Mensajes de error */}
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {searchError}
              </div>
            )}

            {/* Grafo */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              {!hasData ? (
                <div className="h-[600px] flex flex-col items-center justify-center text-slate-500">
                  <BookOpen className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No hay datos para mostrar</p>
                  <p className="text-sm mt-1">
                    Realiza una búsqueda para visualizar el grafo
                  </p>
                </div>
              ) : (
                <GraphVisualization
                  data={grafoData}
                  onNodeClick={handleNodeClick}
                  onPositionLive={(nodeId, x, y) => setPosicionEnVivo({ nodeId, x, y })}
                  onNodePositionChange={async (nodeId, x, y) => {
                    try {
                      await setVerticePosicion(nodeId, x, y);
                      // Actualizar posición final en el indicador de pantalla
                      setPosicionEnVivo({ nodeId, x, y });
                      // Invalidar solo el query del vértice para que el panel muestre x,y actualizado
                      // NO recargar grafoData completo (eso resetearía posiciones en vis.js)
                      localQueryClient.invalidateQueries({ queryKey: ["vertice", nodeId] });
                    } catch {
                      /* fallo silencioso si el backend no está disponible */
                    }
                  }}
                  height="600px"
                />
              )}
            </div>

            {/* Info del grafo */}
            {hasData && (
              <div className="flex items-center justify-between text-sm text-slate-500 px-2">
                <span>
                  {grafoData.nodes.length} nodos • {grafoData.edges.length}{" "}
                  conexiones
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Clic en un nodo para ver detalles
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Paneles laterales y modales */}
      <NodeDetailPanel
        nodeId={selectedNode}
        onClose={() => {
          setSelectedNode(null);
          setPosicionEnVivo(null);
        }}
        posicionEnVivo={posicionEnVivo}
        onShowAll={async () => {
          try {
            const resultado = await mostrarTodosVertices();
            setGrafoData(resultado.grafo);
          } catch (error) {
            console.error("Error al mostrar todos:", error);
          }
        }}
        onOcultarDependientes={
          selectedNode
            ? async () => {
                try {
                  const resultado = await ocultarDependientes(selectedNode);
                  setGrafoData(resultado.grafo);
                } catch (error) {
                  console.error("Error al ocultar dependientes:", error);
                }
              }
            : undefined
        }
        onToggleVisible={
          selectedNode
            ? async (_nodeId, visible) => {
                try {
                  const resultado = await setVerticeVisible(selectedNode, visible);
                  setGrafoData(resultado.grafo);
                } catch (error) {
                  console.error("Error al cambiar visibilidad:", error);
                }
              }
            : undefined
        }
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        metricas={metricas}
        numVertices={grafoData.nodes.length}
        numAristas={grafoData.edges.length}
      />

      <CitasABModal
        isOpen={showCitasABModal}
        onClose={() => setShowCitasABModal(false)}
        reporte={citasABReport}
      />

      <TeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
