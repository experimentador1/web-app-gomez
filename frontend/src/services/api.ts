// services/api.ts
// Cliente API para el backend

import axios from "axios";
import type {
  BusquedaRequest,
  BusquedaIniciadaResponse,
  VisJSData,
  ProgresoResponse,
  MetricasResponse,
  EstadisticasResponse,
  VerticeDetalleResponse,
  ArticuloInfo,
} from "../types/grafo";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== BÚSQUEDA ====================

/**
 * Inicia una búsqueda asíncrona de citas o referencias.
 * Retorna un task_id para consultar el progreso.
 */
export async function iniciarBusqueda(
  request: BusquedaRequest
): Promise<BusquedaIniciadaResponse> {
  const { data } = await api.post<BusquedaIniciadaResponse>("/buscar", request);
  return data;
}

/**
 * Realiza una búsqueda síncrona (espera el resultado).
 * Solo recomendado para búsquedas pequeñas (niveles <= 2).
 */
export async function buscarSincrono(
  request: BusquedaRequest
): Promise<VisJSData> {
  const { data } = await api.post<VisJSData>("/buscar/sync", request);
  return data;
}

/**
 * Obtiene el progreso de una búsqueda en curso.
 */
export async function obtenerProgreso(
  taskId: string
): Promise<ProgresoResponse> {
  const { data } = await api.get<ProgresoResponse>(
    `/buscar/progreso/${taskId}`
  );
  return data;
}

/**
 * Cancela una búsqueda en curso.
 */
export async function cancelarBusqueda(
  taskId: string
): Promise<{ mensaje: string }> {
  const { data } = await api.post<{ mensaje: string }>(
    `/buscar/cancelar/${taskId}`
  );
  return data;
}

/**
 * Obtiene el resultado de una búsqueda completada.
 */
export async function obtenerResultado(taskId: string): Promise<VisJSData> {
  const { data } = await api.get<VisJSData>(`/buscar/resultado/${taskId}`);
  return data;
}

// ==================== PAPER ====================

/**
 * Busca información de un artículo específico.
 */
export async function buscarPaper(
  titulo: string,
  motor?: string
): Promise<ArticuloInfo> {
  const { data } = await api.get<ArticuloInfo>("/paper", {
    params: { titulo, motor },
  });
  return data;
}

// ==================== GRAFO ====================

/**
 * Obtiene el grafo actual en formato vis.js.
 */
export async function obtenerGrafo(): Promise<VisJSData> {
  const { data } = await api.get<VisJSData>("/grafo");
  return data;
}

/**
 * Obtiene el grafo actual en formato JSON completo.
 */
export async function obtenerGrafoJSON(): Promise<unknown> {
  const { data } = await api.get("/grafo/json");
  return data;
}

/**
 * Limpia el grafo actual.
 */
export async function limpiarGrafo(): Promise<{ mensaje: string }> {
  const { data } = await api.delete<{ mensaje: string }>("/grafo");
  return data;
}

/**
 * Importa un grafo desde datos en formato vis.js.
 * @param grafoData - Datos del grafo con nodes y edges
 * @param merge - Si true, fusiona con el grafo existente; si false, reemplaza
 */
export async function importarGrafo(
  grafoData: VisJSData,
  merge = false
): Promise<{
  mensaje: string;
  estadisticas: {
    vertices_nuevos: number;
    vertices_actualizados?: number;
    aristas_nuevas: number;
    aristas_existentes?: number;
  };
  total_vertices: number;
  total_aristas: number;
}> {
  const { data } = await api.post("/grafo/importar", {
    nodes: grafoData.nodes,
    edges: grafoData.edges,
    merge,
  });
  return data;
}

// ==================== EXPORTAR (PRO / LITE / SUBGRAFO VISIBLE) ====================

export type ExportFormato =
  | "pro_json"
  | "pro_csv"
  | "lite_json"
  | "lite_csv"
  | "subgrafo_visible_pro_json"
  | "subgrafo_visible_pro_csv"
  | "subgrafo_visible_lite_json"
  | "subgrafo_visible_lite_csv";

const EXPORT_ENDPOINTS: Record<ExportFormato, { path: string; filename: string; json: boolean }> = {
  pro_json: { path: "/grafo/exportar/pro/json", filename: "grafo_pro.json", json: true },
  pro_csv: { path: "/grafo/exportar/pro/csv", filename: "grafo_pro.csv", json: false },
  lite_json: { path: "/grafo/exportar/lite/json", filename: "grafo_lite.json", json: true },
  lite_csv: { path: "/grafo/exportar/lite/csv", filename: "grafo_lite.csv", json: false },
  subgrafo_visible_pro_json: {
    path: "/grafo/exportar/subgrafo-visible/pro/json",
    filename: "subgrafo_visible_pro.json",
    json: true,
  },
  subgrafo_visible_pro_csv: {
    path: "/grafo/exportar/subgrafo-visible/pro/csv",
    filename: "subgrafo_visible_pro.csv",
    json: false,
  },
  subgrafo_visible_lite_json: {
    path: "/grafo/exportar/subgrafo-visible/lite/json",
    filename: "subgrafo_visible_lite.json",
    json: true,
  },
  subgrafo_visible_lite_csv: {
    path: "/grafo/exportar/subgrafo-visible/lite/csv",
    filename: "subgrafo_visible_lite.csv",
    json: false,
  },
};

/**
 * Exporta el grafo en el formato indicado. Descarga siempre un archivo (JSON o CSV)
 * con la estructura correcta: Pro incluye info (title, authors, year, venue, abstract,
 * references, etc.) y coordenadas x, y por nodo.
 */
export async function exportarGrafo(
  formato: ExportFormato
): Promise<void> {
  const { path, filename, json: isJson } = EXPORT_ENDPOINTS[formato];
  const response = await api.get<Blob | Record<string, unknown>>(path, {
    responseType: isJson ? "json" : "blob",
    validateStatus: () => true,
  });
  if (response.status !== 200) {
    const msg =
      response.status === 404
        ? "No hay grafo cargado. Realiza una búsqueda o importa un archivo."
        : `Error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }
  const a = document.createElement("a");
  if (isJson) {
    const data = response.data as Record<string, unknown>;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    a.href = URL.createObjectURL(blob);
  } else {
    a.href = URL.createObjectURL(response.data as Blob);
  }
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Importa grafo desde JSON. tipo: "lite" (info mínima) o "pro" (grafo completo).
 */
export async function importarGrafoProJson(payload: {
  nodes: unknown[];
  edges: unknown[];
  merge?: boolean;
  tipo?: "lite" | "pro";
}): Promise<{ mensaje: string; total_vertices: number; total_aristas: number }> {
  const { data } = await api.post<{
    mensaje: string;
    total_vertices: number;
    total_aristas: number;
  }>("/grafo/importar/pro/json", payload);
  return data;
}

/**
 * Importa grafo desde archivo CSV. tipo: "lite" (info mínima) o "pro" (grafo completo).
 */
export async function importarGrafoProCsv(
  file: File,
  merge = false,
  tipo: "lite" | "pro" = "pro"
): Promise<{ mensaje: string; total_vertices: number; total_aristas: number }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{
    mensaje: string;
    total_vertices: number;
    total_aristas: number;
  }>(`/grafo/importar/pro/csv?merge=${merge}&tipo=${tipo}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ==================== MÉTRICAS ====================

/**
 * Obtiene métricas del grafo actual.
 */
export async function obtenerMetricas(
  pagerank = true,
  betweenness = false,
  closeness = false
): Promise<MetricasResponse> {
  const { data } = await api.get<MetricasResponse>("/metricas", {
    params: { pagerank, betweenness, closeness },
  });
  return data;
}

// ==================== ESTADÍSTICAS ====================

/**
 * Obtiene estadísticas básicas del grafo.
 */
export async function obtenerEstadisticas(): Promise<EstadisticasResponse> {
  const { data } = await api.get<EstadisticasResponse>("/estadisticas");
  return data;
}

// ==================== VÉRTICES ====================

/**
 * Obtiene información detallada de un vértice.
 */
export async function obtenerVertice(
  verticeId: string
): Promise<VerticeDetalleResponse> {
  const { data } = await api.get<VerticeDetalleResponse>(
    `/vertice/${encodeURIComponent(verticeId)}`
  );
  return data;
}

/**
 * Lista vértices con paginación.
 */
export async function listarVertices(
  limite = 100,
  offset = 0
): Promise<{
  vertices: Array<{
    id: string;
    titulo: string;
    year: number | null;
    citationCount: number;
    tipo: string | null;
    grado_entrada: number;
    grado_salida: number;
  }>;
  total: number;
}> {
  const { data } = await api.get("/vertices", {
    params: { limite, offset },
  });
  return data;
}

// ==================== POSICIÓN ====================

/**
 * Actualiza la posición (x, y) de un nodo en el backend para que Guardar Pro exporte las coordenadas correctas.
 */
export async function setVerticePosicion(
  verticeId: string,
  x: number,
  y: number
): Promise<{ mensaje: string; x: number; y: number }> {
  const { data } = await api.post<{ mensaje: string; vertice_id: string; x: number; y: number }>(
    `/vertice/${encodeURIComponent(verticeId)}/posicion`,
    { x, y }
  );
  return { mensaje: data.mensaje, x: data.x, y: data.y };
}

// ==================== VISIBILIDAD ====================

/**
 * Establece si un nodo es visible u oculto. Retorna el grafo actualizado.
 */
export async function setVerticeVisible(
  verticeId: string,
  visible: boolean
): Promise<{ mensaje: string; visible: boolean; grafo: VisJSData }> {
  const { data } = await api.post<{
    mensaje: string;
    vertice_id: string;
    visible: boolean;
    grafo: VisJSData;
  }>(`/vertice/${encodeURIComponent(verticeId)}/visible`, { visible });
  return { mensaje: data.mensaje, visible: data.visible, grafo: data.grafo };
}

/**
 * Oculta todos los nodos dependientes (nodos que apuntan al nodo dado).
 */
export async function ocultarDependientes(
  verticeId: string
): Promise<{
  mensaje: string;
  referentes: string[];
  accion: string;
  ocultados: number;
  grafo: VisJSData;
}> {
  const { data } = await api.post<{
    mensaje: string;
    referentes: string[];
    accion: string;
    ocultados: number;
    grafo: VisJSData;
  }>(`/vertice/${encodeURIComponent(verticeId)}/ocultar-dependientes`);
  return data;
}

/**
 * Hace visibles todos los vértices del grafo.
 */
export async function mostrarTodosVertices(): Promise<{
  mensaje: string;
  vertices_mostrados: number;
  grafo: VisJSData;
}> {
  const { data} = await api.post<{
    mensaje: string;
    vertices_mostrados: number;
    grafo: VisJSData;
  }>("/grafo/mostrar-todos");
  return data;
}

// ==================== CLASIFICACIÓN CITAS A/B ====================

export interface CitasABResponse {
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
  grafo?: VisJSData; // Grafo actualizado con colores A/B
}

/**
 * Clasifica el grafo usando el algoritmo de Citas A/B.
 */
export async function clasificarCitasAB(): Promise<CitasABResponse> {
  const { data } = await api.post<CitasABResponse>("/citas-ab");
  return data;
}

export default api;

