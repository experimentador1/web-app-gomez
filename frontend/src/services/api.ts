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

export default api;

