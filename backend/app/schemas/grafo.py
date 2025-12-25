# schemas/grafo.py
# Modelos Pydantic para validación de datos en la API

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class MotorBusqueda(str, Enum):
    """Motores de búsqueda académica disponibles."""
    SEMANTIC_SCHOLAR = "semantic_scholar"
    OPEN_CITATIONS = "open_citations"
    CROSSREF = "crossref"
    OPENALEX = "openalex"
    EUROPE_PMC = "europe_pmc"
    LENS = "lens"
    OPENAIRE = "openaire"
    DATACITE = "datacite"
    ZENODO = "zenodo"
    ORCID = "orcid"


class TipoBusqueda(str, Enum):
    """Tipos de búsqueda disponibles."""
    CITAS = "citas"
    REFERENCIAS = "referencias"
    AUTOR = "autor"


# ==================== REQUEST SCHEMAS ====================

class BusquedaRequest(BaseModel):
    """Request para iniciar una búsqueda de artículos."""
    titulo: str = Field(..., min_length=3, description="Título o DOI del artículo")
    motor: MotorBusqueda = Field(default=MotorBusqueda.SEMANTIC_SCHOLAR)
    tipo: TipoBusqueda = Field(default=TipoBusqueda.CITAS)
    niveles: int = Field(default=1, ge=0, le=5, description="Profundidad de búsqueda")
    max_hijos: Optional[int] = Field(default=None, ge=1, le=100, description="Máximo de hijos por nodo")
    api_key: Optional[str] = Field(default=None, description="API key del motor (si aplica)")
    merge: bool = Field(default=True, description="Si True, fusiona con grafo existente; si False, reemplaza")


class BusquedaAutorRequest(BaseModel):
    """Request para buscar artículos por autor."""
    nombre_autor: str = Field(..., min_length=2, description="Nombre del autor")
    motor: MotorBusqueda = Field(default=MotorBusqueda.SEMANTIC_SCHOLAR)
    limite_articulos: int = Field(default=50, ge=1, le=500)
    niveles_citas: int = Field(default=1, ge=0, le=3)
    api_key: Optional[str] = Field(default=None)


class GrafoExportRequest(BaseModel):
    """Request para exportar el grafo."""
    formato: str = Field(default="json", pattern="^(json|csv|visjs)$")
    incluir_metricas: bool = Field(default=True)


# ==================== RESPONSE SCHEMAS ====================

class ArticuloInfo(BaseModel):
    """Información de un artículo académico."""
    title: str = "No disponible"
    authors: List[str] = []
    year: Optional[int] = None
    venue: str = "No disponible"
    doi: Optional[str] = None
    abstract: str = "No disponible"
    topics: List[str] = []
    citations: List[str] = []
    citationCount: int = 0
    references: List[str] = []
    url: Optional[str] = None
    categoria: str = "articulo"
    paperId: Optional[str] = None

    class Config:
        from_attributes = True


class VerticeResponse(BaseModel):
    """Respuesta con información de un vértice."""
    id: str
    informacion: ArticuloInfo
    x: float = 0.0
    y: float = 0.0
    grado_entrada: int = 0
    grado_salida: int = 0
    tipo_cita: Optional[str] = None
    color: Optional[str] = None
    capa: int = 0
    motor: Optional[str] = None
    visible: bool = True
    valor: float = 0.0


class AristaResponse(BaseModel):
    """Respuesta con información de una arista."""
    origen: str
    destino: str
    peso: float = 1.0


class EstadisticasGrafo(BaseModel):
    """Estadísticas del grafo."""
    num_vertices: int
    num_aristas: int
    densidad: float
    centralidad_grado: Optional[Dict[str, float]] = None
    pagerank: Optional[Dict[str, float]] = None
    betweenness: Optional[Dict[str, float]] = None
    closeness: Optional[Dict[str, float]] = None


class GrafoResponse(BaseModel):
    """Respuesta completa del grafo."""
    vertices: List[VerticeResponse]
    aristas: List[AristaResponse]
    estadisticas: EstadisticasGrafo


# ==================== VIS.JS SCHEMAS ====================

class VisNodeData(BaseModel):
    """Datos adicionales de un nodo vis.js."""
    year: Optional[int] = None
    citationCount: int = 0
    doi: Optional[str] = None
    authors: List[str] = []
    tipo: Optional[str] = None
    capa: int = 0


class VisNode(BaseModel):
    """Nodo en formato vis.js."""
    id: str
    label: str
    title: str  # tooltip HTML
    color: str
    size: int
    font: Dict[str, Any] = {"size": 12}
    shape: str = "dot"
    x: Optional[float] = None
    y: Optional[float] = None
    hidden: bool = False
    data: VisNodeData


class VisEdgeColor(BaseModel):
    """Color de arista vis.js."""
    color: str = "#848484"
    opacity: float = 0.6


class VisEdge(BaseModel):
    """Arista en formato vis.js."""
    id: int
    source: str = Field(..., alias="from")
    target: str = Field(..., alias="to")
    value: float = 1.0
    arrows: str = "to"
    color: VisEdgeColor = VisEdgeColor()

    class Config:
        populate_by_name = True


class VisJSResponse(BaseModel):
    """Respuesta del grafo en formato vis.js."""
    nodes: List[VisNode]
    edges: List[VisEdge]


# ==================== PROGRESS SCHEMAS ====================

class ProgresoResponse(BaseModel):
    """Estado de progreso de una búsqueda."""
    task_id: str
    estado: str  # "en_progreso", "completado", "error", "cancelado"
    n_vertices: int = 0
    n_aristas: int = 0
    nivel_actual: int = 0
    nivel_max: int = 0
    pendientes: int = 0
    tiempo_transcurrido: str = "00:00"
    mensaje: str = ""
    porcentaje: float = 0.0


class MetricasRequest(BaseModel):
    """Request para calcular métricas específicas."""
    calcular_pagerank: bool = True
    calcular_betweenness: bool = False
    calcular_closeness: bool = False
    damping_factor: float = Field(default=0.85, ge=0.0, le=1.0)
    iteraciones: int = Field(default=100, ge=1, le=1000)


class MetricasResponse(BaseModel):
    """Respuesta con métricas calculadas."""
    densidad: float
    centralidad_grado: Dict[str, float]
    pagerank: Optional[Dict[str, float]] = None
    betweenness: Optional[Dict[str, float]] = None
    closeness: Optional[Dict[str, float]] = None
    top_10_centralidad: List[Dict[str, Any]] = []
    top_10_pagerank: List[Dict[str, Any]] = []

