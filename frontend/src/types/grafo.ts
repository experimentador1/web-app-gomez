// types/grafo.ts
// Tipos TypeScript para el grafo de artículos

export type MotorBusqueda =
  | "semantic_scholar"
  | "open_citations"
  | "crossref"
  | "openalex"
  | "europe_pmc"
  | "lens"
  | "openaire"
  | "datacite"
  | "zenodo"
  | "orcid";

export type TipoBusqueda = "citas" | "referencias" | "autor";

export type EstadoTarea =
  | "pendiente"
  | "en_progreso"
  | "completado"
  | "cancelado"
  | "error";

// ==================== REQUESTS ====================

export interface BusquedaRequest {
  titulo: string;
  motor?: MotorBusqueda;
  tipo?: TipoBusqueda;
  niveles?: number;
  max_hijos?: number;
  api_key?: string;
  merge?: boolean; // Si true, fusiona con grafo existente; si false/undefined, reemplaza
}

// ==================== RESPONSES ====================

export interface ArticuloInfo {
  title: string;
  authors: string[];
  year: number | null;
  venue: string;
  doi: string | null;
  abstract: string;
  topics: string[];
  citations: string[];
  citationCount: number;
  references: string[];
  url: string | null;
  categoria: string;
  paperId: string | null;
}

export interface VisNodeData {
  year: number | null;
  citationCount: number;
  doi: string | null;
  authors: string[];
  tipo: string | null;
  capa: number;
}

export interface VisNode {
  id: string;
  label: string;
  title: string; // HTML tooltip
  color: string;
  size: number;
  font?: { size: number };
  shape?: string;
  x?: number;
  y?: number;
  hidden?: boolean;
  data: VisNodeData;
}

export interface VisEdge {
  id: number;
  from: string;
  to: string;
  value?: number;
  arrows?: string;
  color?: {
    color: string;
    opacity: number;
  };
}

export interface VisJSData {
  nodes: VisNode[];
  edges: VisEdge[];
}

export interface ProgresoResponse {
  task_id: string;
  estado: EstadoTarea;
  n_vertices: number;
  n_aristas: number;
  nivel_actual: number;
  nivel_max: number;
  pendientes: number;
  tiempo_transcurrido: string;
  mensaje: string;
  porcentaje: number;
}

export interface MetricasResponse {
  densidad: number;
  centralidad_grado: Record<string, number>;
  pagerank?: Record<string, number>;
  betweenness?: Record<string, number>;
  closeness?: Record<string, number>;
  top_10_centralidad: Array<{ id: string; valor: number; titulo: string }>;
  top_10_pagerank?: Array<{ id: string; valor: number; titulo: string }>;
}

export interface BusquedaIniciadaResponse {
  task_id: string;
  mensaje: string;
  titulo: string;
  motor: string;
  niveles: number;
}

export interface EstadisticasResponse {
  num_vertices: number;
  num_aristas: number;
  densidad: number;
  grafo_vacio: boolean;
}

export interface VerticeDetalleResponse {
  id: string;
  informacion: ArticuloInfo;
  grado_entrada: number;
  grado_salida: number;
  tipo: string | null;
  capa: number;
  motor: string | null;
  adyacencias: Array<[string, number]>;
}

