# core/grafo.py
# Lógica de negocio pura del grafo - Sin dependencias de UI
# Migrado desde tda_grafo.py y tda_lista_adyacencia.py

from __future__ import annotations
from typing import Optional, Dict, List, Any, Set, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json


@dataclass
class Arco:
    """Representa una arista/conexión entre dos vértices."""
    destino: str
    peso: float = 1.0
    evidencias_exactas: int = 0
    evidencias_parciales: int = 0
    componentes: Dict[str, int] = field(default_factory=lambda: {"C": 0, "Co": 0, "Ac": 0, "T": 0, "M": 0})
    proveniencias: Set[str] = field(default_factory=set)
    last_update: Optional[datetime] = None


@dataclass
class ArticuloInfo:
    """Información estructurada de un artículo académico."""
    title: str = "No disponible"
    authors: List[str] = field(default_factory=list)
    year: Optional[int] = None
    venue: str = "No disponible"
    doi: Optional[str] = None
    abstract: str = "No disponible"
    topics: List[str] = field(default_factory=list)
    citations: List[str] = field(default_factory=list)
    citation_count: int = 0
    references: List[str] = field(default_factory=list)
    url: Optional[str] = None
    categoria: str = "articulo"
    paper_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "authors": self.authors,
            "year": self.year,
            "venue": self.venue,
            "doi": self.doi,
            "abstract": self.abstract,
            "topics": self.topics,
            "citations": self.citations,
            "citationCount": self.citation_count,
            "references": self.references,
            "url": self.url,
            "categoria": self.categoria,
            "paperId": self.paper_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ArticuloInfo":
        return cls(
            title=data.get("title", "No disponible"),
            authors=data.get("authors", []) if isinstance(data.get("authors"), list) else [],
            year=data.get("year"),
            venue=data.get("venue", "No disponible"),
            doi=data.get("doi"),
            abstract=data.get("abstract", "No disponible"),
            topics=data.get("topics", []) if isinstance(data.get("topics"), list) else [],
            citations=data.get("citations", []) if isinstance(data.get("citations"), list) else [],
            citation_count=data.get("citationCount", 0) or 0,
            references=data.get("references", []) if isinstance(data.get("references"), list) else [],
            url=data.get("url"),
            categoria=data.get("categoria", "articulo"),
            paper_id=data.get("paperId")
        )


@dataclass
class Vertice:
    """Representa un nodo en el grafo (artículo o autor)."""
    id: str
    informacion: ArticuloInfo = field(default_factory=ArticuloInfo)
    adyacencias: Dict[str, Arco] = field(default_factory=dict)
    
    # Posición para visualización (puede ser calculada por el frontend)
    x: float = 0.0
    y: float = 0.0
    
    # Métricas calculadas
    grado_entrada: int = 0
    grado_salida: int = 0
    valor: float = 0.0
    valor_relativo: float = 0.0
    
    # Metadatos
    tipo_cita: Optional[str] = None  # 'cita', 'referencia', 'raiz'
    color: Optional[str] = None
    capa: int = 0  # 0 = artículo, >0 = autor/entidad
    motor: Optional[str] = None
    visible: bool = True
    
    def agregar_adyacencia(self, destino: str, peso: float = 1.0) -> bool:
        """Agrega una arista hacia otro vértice."""
        if destino not in self.adyacencias:
            self.adyacencias[destino] = Arco(destino=destino, peso=peso)
            self.grado_salida += 1
            return True
        return False
    
    def quitar_adyacencia(self, destino: str) -> bool:
        """Elimina una arista hacia otro vértice."""
        if destino in self.adyacencias:
            del self.adyacencias[destino]
            self.grado_salida -= 1
            return True
        return False
    
    def tiene_adyacencia(self, destino: str) -> bool:
        """Verifica si existe una arista hacia el destino."""
        return destino in self.adyacencias
    
    def get_adyacencias(self) -> List[Tuple[str, float]]:
        """Retorna lista de (destino, peso) de todas las adyacencias."""
        return [(arco.destino, arco.peso) for arco in self.adyacencias.values()]


class Grafo:
    """
    Estructura de datos del grafo para artículos académicos.
    Implementación basada en diccionario para O(1) en búsquedas.
    """
    
    def __init__(self):
        self.vertices: Dict[str, Vertice] = {}
        self._num_aristas: int = 0
    
    # ==================== OPERACIONES BÁSICAS ====================
    
    def agregar_vertice(self, dato: str) -> bool:
        """Agrega un nuevo vértice si no existe."""
        if dato in self.vertices:
            return False
        self.vertices[dato] = Vertice(id=dato)
        return True
    
    def agregar_o_actualizar_vertice(self, dato: str, info: Optional[Dict[str, Any]] = None) -> Vertice:
        """Agrega vértice si no existe, o actualiza su información si existe."""
        if dato not in self.vertices:
            self.vertices[dato] = Vertice(id=dato)
        
        if info:
            self.set_informacion(dato, info)
        
        return self.vertices[dato]
    
    def quitar_vertice(self, dato: str) -> bool:
        """Elimina un vértice y todas sus conexiones."""
        if dato not in self.vertices:
            return False
        
        # Eliminar aristas entrantes desde otros vértices
        for vid, vertice in self.vertices.items():
            if dato in vertice.adyacencias:
                vertice.quitar_adyacencia(dato)
                self._num_aristas -= 1
        
        # Eliminar el vértice (y sus aristas salientes)
        self._num_aristas -= len(self.vertices[dato].adyacencias)
        del self.vertices[dato]
        return True
    
    def busca_vertice(self, dato: str) -> Optional[Vertice]:
        """Busca y retorna un vértice por su ID."""
        return self.vertices.get(dato)
    
    def existe_vertice(self, dato: str) -> bool:
        """Verifica si existe un vértice."""
        return dato in self.vertices
    
    def get_vertices(self) -> List[str]:
        """Retorna lista de IDs de todos los vértices."""
        return list(self.vertices.keys())
    
    def num_vertices(self) -> int:
        """Retorna el número de vértices."""
        return len(self.vertices)
    
    def num_aristas(self) -> int:
        """Retorna el número de aristas."""
        return self._num_aristas
    
    # ==================== ARISTAS ====================
    
    def agregar_arista(self, origen: str, destino: str, peso: float = 1.0) -> bool:
        """Agrega una arista dirigida entre dos vértices."""
        if origen not in self.vertices or destino not in self.vertices:
            return False
        
        if self.vertices[origen].agregar_adyacencia(destino, peso):
            self.vertices[destino].grado_entrada += 1
            self._num_aristas += 1
            return True
        return False
    
    def quitar_arista(self, origen: str, destino: str) -> bool:
        """Elimina una arista entre dos vértices."""
        if origen not in self.vertices:
            return False
        
        if self.vertices[origen].quitar_adyacencia(destino):
            if destino in self.vertices:
                self.vertices[destino].grado_entrada -= 1
            self._num_aristas -= 1
            return True
        return False
    
    def existe_arista(self, origen: str, destino: str) -> bool:
        """Verifica si existe una arista entre dos vértices."""
        if origen not in self.vertices:
            return False
        return self.vertices[origen].tiene_adyacencia(destino)
    
    def get_aristas(self) -> List[Tuple[str, str, float]]:
        """Retorna todas las aristas como lista de (origen, destino, peso)."""
        aristas = []
        for vid, vertice in self.vertices.items():
            for destino, peso in vertice.get_adyacencias():
                aristas.append((vid, destino, peso))
        return aristas
    
    # ==================== INFORMACIÓN ====================
    
    def get_informacion(self, dato: str) -> Optional[Dict[str, Any]]:
        """Obtiene la información de un vértice como diccionario."""
        vertice = self.busca_vertice(dato)
        if vertice:
            return vertice.informacion.to_dict()
        return None
    
    def set_informacion(self, dato: str, info: Dict[str, Any]) -> bool:
        """Establece la información de un vértice."""
        vertice = self.busca_vertice(dato)
        if vertice:
            vertice.informacion = ArticuloInfo.from_dict(info)
            return True
        return False
    
    # ==================== MÉTRICAS ====================
    
    def calcular_densidad(self) -> float:
        """
        Calcula la densidad del grafo.
        Densidad = E / (V * (V - 1)) para grafos dirigidos.
        """
        v = self.num_vertices()
        e = self.num_aristas()
        if v <= 1:
            return 0.0
        return e / (v * (v - 1))
    
    def calcular_grado_entrada(self, dato: str) -> int:
        """Calcula el grado de entrada de un vértice."""
        vertice = self.busca_vertice(dato)
        return vertice.grado_entrada if vertice else 0
    
    def calcular_grado_salida(self, dato: str) -> int:
        """Calcula el grado de salida de un vértice."""
        vertice = self.busca_vertice(dato)
        return vertice.grado_salida if vertice else 0
    
    def calcular_centralidad_grado(self) -> Dict[str, float]:
        """
        Calcula la centralidad de grado para todos los vértices.
        Centralidad = (grado_entrada + grado_salida) / (2 * (n - 1))
        """
        n = self.num_vertices()
        if n <= 1:
            return {v: 0.0 for v in self.vertices}
        
        centralidades = {}
        for vid, vertice in self.vertices.items():
            grado_total = vertice.grado_entrada + vertice.grado_salida
            centralidades[vid] = grado_total / (2 * (n - 1))
        
        return centralidades
    
    def calcular_pagerank(self, damping: float = 0.85, iteraciones: int = 100, tolerancia: float = 1e-6) -> Dict[str, float]:
        """
        Calcula PageRank para todos los vértices.
        """
        n = self.num_vertices()
        if n == 0:
            return {}
        
        # Inicializar PageRank uniforme
        pr = {vid: 1.0 / n for vid in self.vertices}
        
        for _ in range(iteraciones):
            pr_nuevo = {}
            diff = 0.0
            
            for vid in self.vertices:
                # Suma de contribuciones de vértices que apuntan a vid
                suma = 0.0
                for origen, vertice in self.vertices.items():
                    if vertice.tiene_adyacencia(vid):
                        out_degree = vertice.grado_salida
                        if out_degree > 0:
                            suma += pr[origen] / out_degree
                
                pr_nuevo[vid] = (1 - damping) / n + damping * suma
                diff += abs(pr_nuevo[vid] - pr[vid])
            
            pr = pr_nuevo
            
            if diff < tolerancia:
                break
        
        return pr
    
    def calcular_betweenness(self) -> Dict[str, float]:
        """
        Calcula la centralidad de intermediación (betweenness) para todos los vértices.
        Usa el algoritmo de Brandes.
        """
        betweenness = {v: 0.0 for v in self.vertices}
        
        for s in self.vertices:
            # BFS desde s
            stack = []
            pred = {v: [] for v in self.vertices}
            sigma = {v: 0 for v in self.vertices}
            sigma[s] = 1
            dist = {v: -1 for v in self.vertices}
            dist[s] = 0
            
            queue = [s]
            while queue:
                v = queue.pop(0)
                stack.append(v)
                
                for w, _ in self.vertices[v].get_adyacencias():
                    if dist[w] < 0:
                        queue.append(w)
                        dist[w] = dist[v] + 1
                    
                    if dist[w] == dist[v] + 1:
                        sigma[w] += sigma[v]
                        pred[w].append(v)
            
            # Acumulación
            delta = {v: 0.0 for v in self.vertices}
            while stack:
                w = stack.pop()
                for v in pred[w]:
                    delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
                if w != s:
                    betweenness[w] += delta[w]
        
        # Normalizar
        n = self.num_vertices()
        if n > 2:
            factor = 1.0 / ((n - 1) * (n - 2))
            betweenness = {v: b * factor for v, b in betweenness.items()}
        
        return betweenness
    
    def calcular_closeness(self) -> Dict[str, float]:
        """
        Calcula la centralidad de cercanía (closeness) para todos los vértices.
        """
        closeness = {}
        n = self.num_vertices()
        
        for s in self.vertices:
            # BFS para calcular distancias
            dist = {s: 0}
            queue = [s]
            
            while queue:
                v = queue.pop(0)
                for w, _ in self.vertices[v].get_adyacencias():
                    if w not in dist:
                        dist[w] = dist[v] + 1
                        queue.append(w)
            
            # Suma de distancias a nodos alcanzables
            total_dist = sum(dist.values())
            reachable = len(dist) - 1  # excluir el nodo mismo
            
            if reachable > 0 and total_dist > 0:
                closeness[s] = reachable / total_dist
            else:
                closeness[s] = 0.0
        
        return closeness
    
    # ==================== SERIALIZACIÓN ====================
    
    def to_dict(self) -> Dict[str, Any]:
        """Serializa el grafo completo a un diccionario."""
        return {
            "vertices": [
                {
                    "id": vid,
                    "informacion": vertice.informacion.to_dict(),
                    "x": vertice.x,
                    "y": vertice.y,
                    "grado_entrada": vertice.grado_entrada,
                    "grado_salida": vertice.grado_salida,
                    "tipo_cita": vertice.tipo_cita,
                    "color": vertice.color,
                    "capa": vertice.capa,
                    "motor": vertice.motor,
                    "visible": vertice.visible,
                    "valor": vertice.valor
                }
                for vid, vertice in self.vertices.items()
            ],
            "aristas": [
                {"origen": origen, "destino": destino, "peso": peso}
                for origen, destino, peso in self.get_aristas()
            ],
            "estadisticas": {
                "num_vertices": self.num_vertices(),
                "num_aristas": self.num_aristas(),
                "densidad": self.calcular_densidad()
            }
        }
    
    def to_visjs(self) -> Dict[str, Any]:
        """
        Exporta el grafo en formato compatible con vis.js.
        """
        nodes = []
        edges = []
        
        for vid, vertice in self.vertices.items():
            info = vertice.informacion
            
            # Asegurar que year y citation_count sean enteros o None
            year_val = None
            if info.year is not None and info.year != "No disponible":
                try:
                    year_val = int(info.year)
                except (ValueError, TypeError):
                    year_val = None
            
            citation_val = 0
            if info.citation_count is not None and info.citation_count != "No disponible":
                try:
                    citation_val = int(info.citation_count)
                except (ValueError, TypeError):
                    citation_val = 0
            
            nodes.append({
                "id": vid,
                "label": self._truncate_label(info.title, 40),
                "title": self._build_tooltip(info),
                "color": vertice.color or self._get_default_color(vertice),
                "size": self._calculate_node_size(vertice),
                "font": {"size": 12},
                "shape": "dot" if vertice.capa == 0 else "diamond",
                "x": vertice.x if vertice.x != 0 else None,
                "y": vertice.y if vertice.y != 0 else None,
                "hidden": not vertice.visible,
                # Datos adicionales para el frontend
                "data": {
                    "year": year_val,
                    "citationCount": citation_val,
                    "doi": info.doi if info.doi != "No disponible" else None,
                    "authors": info.authors,
                    "tipo": vertice.tipo_cita,
                    "capa": vertice.capa
                }
            })
        
        edge_id = 0
        for origen, destino, peso in self.get_aristas():
            edges.append({
                "id": edge_id,
                "from": origen,
                "to": destino,
                "value": peso,
                "arrows": "",
                "color": {"color": "#848484", "opacity": 0.7}
            })
            edge_id += 1
        
        return {"nodes": nodes, "edges": edges}
    
    def _truncate_label(self, text: str, max_len: int) -> str:
        """Trunca el texto para la etiqueta."""
        if not text or text == "No disponible":
            return "Sin título"
        if len(text) <= max_len:
            return text
        return text[:max_len - 3] + "..."
    
    def _build_tooltip(self, info: ArticuloInfo) -> str:
        """Construye el tooltip en texto plano para vis.js."""
        # Asegurar que los autores sean strings
        authors_list = []
        for a in (info.authors[:3] if info.authors else []):
            if isinstance(a, dict):
                authors_list.append(str(a.get("name", "")))
            else:
                authors_list.append(str(a))
        authors_str = ", ".join(authors_list) if authors_list else "No disponible"
        if len(info.authors) > 3:
            authors_str += f" (+{len(info.authors) - 3})"
        
        # Tooltip en texto plano (vis.js no interpreta HTML por defecto)
        lines = [
            info.title,
            f"Autores: {authors_str}",
            f"Año: {info.year or 'N/A'} | Citas: {info.citation_count}",
        ]
        if info.doi:
            lines.append(f"DOI: {info.doi}")
        
        return "\n".join(lines)
    
    def _get_default_color(self, vertice: Vertice) -> str:
        """Retorna color por defecto según el tipo de vértice."""
        if vertice.tipo_cita == "raiz":
            return "#e74c3c"  # Rojo para el artículo raíz
        elif vertice.tipo_cita == "cita":
            return "#3498db"  # Azul para citas
        elif vertice.tipo_cita == "referencia":
            return "#2ecc71"  # Verde para referencias
        elif vertice.capa > 0:
            return "#9b59b6"  # Púrpura para autores
        return "#95a5a6"  # Gris por defecto
    
    def _calculate_node_size(self, vertice: Vertice) -> int:
        """Calcula el tamaño del nodo basado en métricas."""
        base_size = 15
        try:
            citation_count = int(vertice.informacion.citation_count or 0)
        except (ValueError, TypeError):
            citation_count = 0
        
        if citation_count > 1000:
            return base_size + 20
        elif citation_count > 100:
            return base_size + 10
        elif citation_count > 10:
            return base_size + 5
        return base_size
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Grafo":
        """Deserializa un grafo desde un diccionario."""
        grafo = cls()
        
        # Primero crear todos los vértices
        for v_data in data.get("vertices", []):
            vid = v_data["id"]
            grafo.agregar_vertice(vid)
            vertice = grafo.vertices[vid]
            
            if "informacion" in v_data:
                vertice.informacion = ArticuloInfo.from_dict(v_data["informacion"])
            
            vertice.x = v_data.get("x", 0)
            vertice.y = v_data.get("y", 0)
            vertice.tipo_cita = v_data.get("tipo_cita")
            vertice.color = v_data.get("color")
            vertice.capa = v_data.get("capa", 0)
            vertice.motor = v_data.get("motor")
            vertice.visible = v_data.get("visible", True)
            vertice.valor = v_data.get("valor", 0)
        
        # Luego crear las aristas
        for a_data in data.get("aristas", []):
            grafo.agregar_arista(
                a_data["origen"],
                a_data["destino"],
                a_data.get("peso", 1.0)
            )
        
        return grafo
    
    def limpiar(self):
        """Elimina todos los vértices y aristas del grafo."""
        self.vertices.clear()
        self._num_aristas = 0
    
    def merge(self, otro_grafo: "Grafo") -> Dict[str, int]:
        """
        Fusiona otro grafo en este grafo existente.
        - Vértices nuevos se agregan
        - Vértices existentes se actualizan con información más completa
        - Aristas nuevas se agregan
        - Aristas existentes se ignoran (no duplicar)
        
        Returns:
            Estadísticas de la fusión
        """
        stats = {
            "vertices_nuevos": 0,
            "vertices_actualizados": 0,
            "aristas_nuevas": 0,
            "aristas_existentes": 0
        }
        
        # Fusionar vértices
        for vid, vertice in otro_grafo.vertices.items():
            if vid not in self.vertices:
                # Vértice nuevo: agregar
                self.agregar_vertice(vid)
                self.vertices[vid].informacion = vertice.informacion
                self.vertices[vid].x = vertice.x
                self.vertices[vid].y = vertice.y
                self.vertices[vid].tipo_cita = vertice.tipo_cita
                self.vertices[vid].color = vertice.color
                self.vertices[vid].capa = vertice.capa
                self.vertices[vid].motor = vertice.motor
                self.vertices[vid].visible = vertice.visible
                self.vertices[vid].valor = vertice.valor
                stats["vertices_nuevos"] += 1
            else:
                # Vértice existente: actualizar info si la nueva es más completa
                v_existente = self.vertices[vid]
                v_nuevo = vertice
                
                # Actualizar título si el existente no tiene o es genérico
                if v_existente.informacion.title in ("No disponible", "Sin título", "", vid):
                    if v_nuevo.informacion.title not in ("No disponible", "Sin título", "", vid):
                        v_existente.informacion.title = v_nuevo.informacion.title
                
                # Actualizar autores si el existente no tiene
                if not v_existente.informacion.authors and v_nuevo.informacion.authors:
                    v_existente.informacion.authors = v_nuevo.informacion.authors
                
                # Actualizar año si el existente no tiene
                if not v_existente.informacion.year and v_nuevo.informacion.year:
                    v_existente.informacion.year = v_nuevo.informacion.year
                
                # Actualizar citation_count si el nuevo es mayor
                if v_nuevo.informacion.citation_count > v_existente.informacion.citation_count:
                    v_existente.informacion.citation_count = v_nuevo.informacion.citation_count
                
                # Actualizar DOI si el existente no tiene
                if not v_existente.informacion.doi and v_nuevo.informacion.doi:
                    v_existente.informacion.doi = v_nuevo.informacion.doi
                
                # Actualizar URL si el existente no tiene
                if not v_existente.informacion.url and v_nuevo.informacion.url:
                    v_existente.informacion.url = v_nuevo.informacion.url
                
                # Actualizar abstract si el existente no tiene
                if v_existente.informacion.abstract in ("No disponible", "", None) and v_nuevo.informacion.abstract not in ("No disponible", "", None):
                    v_existente.informacion.abstract = v_nuevo.informacion.abstract
                
                stats["vertices_actualizados"] += 1
        
        # Fusionar aristas
        for origen, destino, peso in otro_grafo.get_aristas():
            # Asegurar que los vértices existen
            if origen not in self.vertices:
                self.agregar_vertice(origen)
                stats["vertices_nuevos"] += 1
            if destino not in self.vertices:
                self.agregar_vertice(destino)
                stats["vertices_nuevos"] += 1
            
            # Agregar arista si no existe
            if not self.existe_arista(origen, destino):
                self.agregar_arista(origen, destino, peso)
                stats["aristas_nuevas"] += 1
            else:
                stats["aristas_existentes"] += 1
        
        return stats
    
    @classmethod
    def from_visjs(cls, data: Dict[str, Any]) -> "Grafo":
        """
        Importa un grafo desde formato vis.js.
        Soporta tanto el formato vis.js puro como el formato de escritorio (con campo 'info' anidado).
        """
        grafo = cls()
        
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        
        # Mapeo de autores a artículos
        autor_articulos: Dict[str, List[str]] = {}
        
        # Crear vértices desde nodes
        for node in nodes:
            node_id = str(node.get("id", ""))
            if not node_id:
                continue
            
            grafo.agregar_vertice(node_id)
            vertice = grafo.vertices[node_id]
            
            # Extraer info del campo 'info' anidado (formato escritorio) o directamente
            info_nested = node.get("info", {}) or {}
            
            # Extraer título: prioridad info.title > label > title > id
            title = (
                info_nested.get("title") or 
                info_nested.get("titulo") or
                node.get("label") or 
                node.get("title") or 
                node_id
            )
            if title in ("No disponible", "Sin título", "", None):
                title = node_id
            
            # Extraer autores
            authors_raw = info_nested.get("authors") or info_nested.get("autores") or node.get("authors") or []
            if isinstance(authors_raw, str):
                authors = [a.strip() for a in authors_raw.split(";") if a.strip()]
            elif isinstance(authors_raw, list):
                authors = []
                for a in authors_raw:
                    if isinstance(a, dict):
                        name = a.get("name") or a.get("nombre") or ""
                        if name:
                            authors.append(name)
                    elif isinstance(a, str) and a.strip():
                        authors.append(a.strip())
            else:
                authors = []
            
            # Extraer información del nodo
            vertice.informacion = ArticuloInfo(
                title=title,
                authors=authors,
                year=info_nested.get("year") or info_nested.get("anio") or node.get("year"),
                venue=info_nested.get("venue") or node.get("venue", ""),
                doi=info_nested.get("doi") or node.get("doi"),
                abstract=info_nested.get("abstract") or node.get("abstract", ""),
                citation_count=info_nested.get("citationCount") or node.get("citationCount", 0) or node.get("citation_count", 0) or 0,
                url=info_nested.get("url") or node.get("url"),
                paper_id=info_nested.get("paperId") or node.get("paperId") or node.get("paper_id")
            )
            
            # Posición
            vertice.x = float(node.get("x", 0) or 0)
            vertice.y = float(node.get("y", 0) or 0)
            
            # Metadatos
            capa = node.get("capa") or info_nested.get("capa") or 0
            vertice.capa = int(capa) if capa else 0
            vertice.tipo_cita = node.get("tipo") or node.get("tipo_cita") or info_nested.get("tipo_cita")
            vertice.color = node.get("color")
            vertice.motor = node.get("motor") or info_nested.get("motor")
            vertice.visible = node.get("hidden", False) != True
            vertice.valor = float(node.get("valor", 0) or 0)
            
            # Registrar autores para conexión (solo para artículos, capa 0)
            if vertice.capa == 0 and authors:
                for autor in authors:
                    autor_norm = autor.strip()
                    if autor_norm:
                        if autor_norm not in autor_articulos:
                            autor_articulos[autor_norm] = []
                        if node_id not in autor_articulos[autor_norm]:
                            autor_articulos[autor_norm].append(node_id)
        
        # Crear aristas desde edges
        aristas_creadas = 0
        aristas_omitidas = 0
        for edge in edges:
            # Soportar múltiples formatos: from/to, source/target
            origen = str(edge.get("from") or edge.get("source") or "")
            destino = str(edge.get("to") or edge.get("target") or "")
            peso = float(edge.get("weight", 1.0) or edge.get("value", 1.0) or 1.0)
            
            if not origen or not destino:
                aristas_omitidas += 1
                continue
            
            # Verificar que ambos nodos existan
            if origen not in grafo.vertices:
                grafo.agregar_vertice(origen)
            if destino not in grafo.vertices:
                grafo.agregar_vertice(destino)
            
            grafo.agregar_arista(origen, destino, peso)
            aristas_creadas += 1
        
        # Crear nodos de autores (capa 1) y conectar artículos a través de ellos
        autores_creados = 0
        conexiones_autor = 0
        for autor, articulos in autor_articulos.items():
            if len(articulos) >= 1:
                autor_id = autor
                
                if autor_id not in grafo.vertices:
                    grafo.agregar_vertice(autor_id)
                    grafo.vertices[autor_id].informacion = ArticuloInfo(
                        title=autor,
                        categoria="autor"
                    )
                    grafo.vertices[autor_id].capa = 1
                    autores_creados += 1
                
                # Conectar cada artículo al autor
                for articulo_id in articulos:
                    if articulo_id in grafo.vertices:
                        if autor_id not in grafo.vertices[articulo_id].adyacencias:
                            grafo.agregar_arista(articulo_id, autor_id, 1.0)
                            conexiones_autor += 1
        
        print(f"[from_visjs] Nodos: {len(nodes)}, Aristas: {aristas_creadas}, Autores: {autores_creados}, Conexiones autor: {conexiones_autor}")
        return grafo
    
    def merge_from_visjs(self, data: Dict[str, Any]) -> Dict[str, int]:
        """
        Fusiona datos en formato vis.js al grafo existente.
        - Extrae información de campo 'info' anidado (formato escritorio)
        - Crea nodos de autores (capa 1) y conecta artículos a través de ellos
        - Detecta nodos comunes por autores compartidos
        """
        stats = {
            "vertices_nuevos": 0,
            "vertices_actualizados": 0,
            "aristas_nuevas": 0,
            "aristas_existentes": 0,
            "autores_creados": 0,
            "conexiones_por_autor": 0
        }
        
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        
        # Mapeo de autores a artículos para conectar por autores comunes
        autor_articulos: Dict[str, List[str]] = {}
        
        # Procesar nodos
        for node in nodes:
            node_id = str(node.get("id", ""))
            if not node_id:
                continue
            
            # Extraer info del campo 'info' anidado (formato escritorio) o directamente
            info_nested = node.get("info", {}) or {}
            
            es_nuevo = node_id not in self.vertices
            
            if es_nuevo:
                self.agregar_vertice(node_id)
                stats["vertices_nuevos"] += 1
            else:
                stats["vertices_actualizados"] += 1
            
            vertice = self.vertices[node_id]
            
            # Extraer título: prioridad info.title > label > title > id
            title = (
                info_nested.get("title") or 
                info_nested.get("titulo") or
                node.get("label") or 
                node.get("title") or 
                vertice.informacion.title or
                node_id
            )
            if title in ("No disponible", "Sin título", "", None):
                title = node_id
            
            # Extraer autores
            authors_raw = info_nested.get("authors") or info_nested.get("autores") or node.get("authors") or []
            if isinstance(authors_raw, str):
                authors = [a.strip() for a in authors_raw.split(";") if a.strip()]
            elif isinstance(authors_raw, list):
                # Puede ser lista de strings o lista de dicts
                authors = []
                for a in authors_raw:
                    if isinstance(a, dict):
                        name = a.get("name") or a.get("nombre") or ""
                        if name:
                            authors.append(name)
                    elif isinstance(a, str) and a.strip():
                        authors.append(a.strip())
            else:
                authors = []
            
            # Actualizar información del vértice
            vertice.informacion = ArticuloInfo(
                title=title,
                authors=authors if authors else vertice.informacion.authors,
                year=info_nested.get("year") or info_nested.get("anio") or node.get("year") or vertice.informacion.year,
                venue=info_nested.get("venue") or node.get("venue") or vertice.informacion.venue,
                doi=info_nested.get("doi") or node.get("doi") or vertice.informacion.doi,
                abstract=info_nested.get("abstract") or node.get("abstract") or vertice.informacion.abstract,
                citation_count=info_nested.get("citationCount") or node.get("citationCount") or vertice.informacion.citation_count or 0,
                url=info_nested.get("url") or node.get("url") or vertice.informacion.url,
                paper_id=info_nested.get("paperId") or node.get("paperId") or node.get("paper_id") or vertice.informacion.paper_id
            )
            
            # Actualizar posición si viene en los datos
            if "x" in node:
                vertice.x = float(node["x"] or 0)
            if "y" in node:
                vertice.y = float(node["y"] or 0)
            
            # Metadatos
            capa = node.get("capa") or info_nested.get("capa") or 0
            vertice.capa = int(capa) if capa else 0
            
            if "tipo" in node or "tipo_cita" in node or "tipo_cita" in info_nested:
                vertice.tipo_cita = node.get("tipo") or node.get("tipo_cita") or info_nested.get("tipo_cita")
            if "color" in node:
                vertice.color = node["color"]
            if "motor" in node or "motor" in info_nested:
                vertice.motor = node.get("motor") or info_nested.get("motor")
            
            # Registrar autores para conexión (solo para artículos, capa 0)
            if vertice.capa == 0 and authors:
                for autor in authors:
                    autor_norm = autor.strip()
                    if autor_norm:
                        if autor_norm not in autor_articulos:
                            autor_articulos[autor_norm] = []
                        if node_id not in autor_articulos[autor_norm]:
                            autor_articulos[autor_norm].append(node_id)
        
        # Procesar aristas explícitas
        for edge in edges:
            origen = str(edge.get("from") or edge.get("source") or "")
            destino = str(edge.get("to") or edge.get("target") or "")
            peso = float(edge.get("weight", 1.0) or edge.get("value", 1.0) or 1.0)
            
            if not origen or not destino:
                continue
            
            # Crear nodos si no existen
            if origen not in self.vertices:
                self.agregar_vertice(origen)
                stats["vertices_nuevos"] += 1
            if destino not in self.vertices:
                self.agregar_vertice(destino)
                stats["vertices_nuevos"] += 1
            
            # Verificar si la arista ya existe
            vertice_origen = self.vertices[origen]
            if destino in vertice_origen.adyacencias:
                stats["aristas_existentes"] += 1
            else:
                self.agregar_arista(origen, destino, peso)
                stats["aristas_nuevas"] += 1
        
        # Crear nodos de autores (capa 1) y conectar artículos a través de ellos
        for autor, articulos in autor_articulos.items():
            if len(articulos) >= 1:  # Crear nodo de autor si tiene al menos 1 artículo
                autor_id = autor
                
                if autor_id not in self.vertices:
                    self.agregar_vertice(autor_id)
                    self.vertices[autor_id].informacion = ArticuloInfo(
                        title=autor,
                        categoria="autor"
                    )
                    self.vertices[autor_id].capa = 1  # Capa de autores
                    stats["autores_creados"] += 1
                
                # Conectar cada artículo al autor
                for articulo_id in articulos:
                    if articulo_id in self.vertices:
                        # Arista de artículo a autor
                        if autor_id not in self.vertices[articulo_id].adyacencias:
                            self.agregar_arista(articulo_id, autor_id, 1.0)
                            stats["conexiones_por_autor"] += 1
        
        print(f"[merge_from_visjs] Stats: {stats}")
        print(f"[merge_from_visjs] Autores encontrados: {list(autor_articulos.keys())[:5]}...")
        return stats

    # ==================== CLASIFICACIÓN CITAS A/B ====================
    
    def _autores_a_set(self, autores: Any) -> Set[str]:
        """
        Convierte una lista de autores a un set normalizado de strings en minúsculas.
        Maneja diferentes formatos: string, lista de strings, lista de dicts con 'name'.
        """
        import re
        resultado = set()
        
        if not autores or autores == "No disponible":
            return resultado
        
        if isinstance(autores, str):
            # Dividir por coma, punto y coma, pipe, " y " o " and "
            for part in re.split(r"\s*(?:,|;|\|| y | and )\s*", autores):
                part = part.strip().lower()
                if part:
                    resultado.add(part)
            return resultado
        
        if isinstance(autores, dict):
            # Un solo autor como dict
            name = autores.get("name") or autores.get("author") or autores.get("fullName") or autores.get("display_name")
            if name:
                resultado.add(str(name).strip().lower())
            return resultado
        
        if isinstance(autores, list):
            for autor in autores:
                if isinstance(autor, str):
                    resultado.add(autor.strip().lower())
                elif isinstance(autor, dict):
                    name = autor.get("name") or autor.get("author") or autor.get("fullName") or autor.get("display_name")
                    if name:
                        resultado.add(str(name).strip().lower())
        
        return resultado
    
    def clasificar_citas_ab(self) -> Dict[str, Any]:
        """
        Clasifica los artículos del grafo según el algoritmo de Citas A/B.
        
        El algoritmo ejecuta tres corridas:
        1. Azul: Pintar de azul los artículos que tienen autores definidos.
        2. Amarillo (B): Degradar a amarillo los artículos donde citante y citado
           comparten al menos un autor (auto-citación).
        3. Verde (AB): Marcar como verdes las raíces de las cadenas de auto-citación.
        
        Tipos resultantes:
        - A (azul): Artículos con autores, sin coincidencias con citados/citantes
        - B (amarillo): Artículos con autores en común entre citante y citado
        - AB (verde): Raíces de cadenas de auto-citación
        - S (rojo): Artículos sin autores (no clasificados)
        
        Returns:
            Dict con el reporte de la clasificación:
            - corrida1: stats de la primera corrida (azul)
            - corrida2: stats de la segunda corrida (amarillo)
            - corrida3: stats de la tercera corrida (verde)
            - resumen: conteo final por tipo/color
        """
        reporte = {
            "corrida1": {"total_vertices": 0, "pintados_azul": 0, "omitidos_sin_autores": 0},
            "corrida2": {"aristas_evaluadas": 0, "pares_B": 0, "vertices_amarillo": 0, "muestras": []},
            "corrida3": {"raices_ab": 0, "vertices_verde": 0},
            "resumen": {"tipo_A": 0, "tipo_B": 0, "tipo_AB": 0, "tipo_S": 0, "total": 0}
        }
        
        if not self.vertices:
            return reporte
        
        # Corrida 1: Pintar de azul o rojo según tengan autores
        reporte["corrida1"] = self._corrida1_pintar_azul()
        
        # Corrida 2: Degradar a B (amarillo) por autores en común
        reporte["corrida2"] = self._corrida2_degradar_a_b()
        
        # Corrida 3: Marcar raíces de cadenas como AB (verde)
        reporte["corrida3"] = self._corrida3_marcar_ab()
        
        # Calcular resumen final
        reporte["resumen"] = self._calcular_resumen_ab()
        
        return reporte
    
    def _corrida1_pintar_azul(self) -> Dict[str, Any]:
        """
        Corrida 1: Pintar de azul los artículos con autores, rojo los sin autores.
        """
        stats = {
            "total_vertices": len(self.vertices),
            "pintados_azul": 0,
            "omitidos_sin_autores": 0
        }
        
        for vertice_id, vertice in self.vertices.items():
            # Solo procesar artículos (capa 0)
            if vertice.capa != 0:
                continue
            
            autores = vertice.informacion.authors
            tiene_autores = bool(self._autores_a_set(autores))
            
            if tiene_autores:
                vertice.color = "blue"
                vertice.tipo_cita = "A"
                stats["pintados_azul"] += 1
            else:
                vertice.color = "red"
                vertice.tipo_cita = "S"
                stats["omitidos_sin_autores"] += 1
        
        return stats
    
    def _corrida2_degradar_a_b(self) -> Dict[str, Any]:
        """
        Corrida 2: Degradar a B (amarillo) los artículos con autores en común.
        Una arista (citante -> citado) es tipo B si comparten al menos un autor.
        """
        stats = {
            "aristas_evaluadas": 0,
            "pares_B": 0,
            "vertices_amarillo": 0,
            "muestras": []
        }
        
        # Cache de autores por vértice
        autores_map = {}
        for vertice_id, vertice in self.vertices.items():
            autores_map[vertice_id] = self._autores_a_set(vertice.informacion.authors)
        
        vertices_pintados = set()
        
        # Recorrer todas las aristas
        for origen_id, vertice in self.vertices.items():
            # Solo procesar artículos (capa 0)
            if vertice.capa != 0:
                continue
            
            # Solo evaluar si el origen tiene autores
            autores_origen = autores_map.get(origen_id, set())
            if not autores_origen:
                continue
            
            for destino_id in vertice.adyacencias.keys():
                # Solo procesar si destino es artículo
                destino_vertice = self.vertices.get(destino_id)
                if not destino_vertice or destino_vertice.capa != 0:
                    continue
                
                autores_destino = autores_map.get(destino_id, set())
                if not autores_destino:
                    continue
                
                stats["aristas_evaluadas"] += 1
                
                # Verificar intersección de autores
                if autores_origen & autores_destino:
                    # Marcar ambos vértices como B (amarillo)
                    for vid in (origen_id, destino_id):
                        v = self.vertices.get(vid)
                        if v and v.tipo_cita != "B":
                            v.color = "yellow"
                            v.tipo_cita = "B"
                            vertices_pintados.add(vid)
                    
                    stats["pares_B"] += 1
                    
                    # Guardar muestras (máximo 12)
                    if len(stats["muestras"]) < 12:
                        stats["muestras"].append({
                            "origen": origen_id[:50],
                            "destino": destino_id[:50]
                        })
        
        stats["vertices_amarillo"] = len(vertices_pintados)
        return stats
    
    def _corrida3_marcar_ab(self) -> Dict[str, Any]:
        """
        Corrida 3: Dentro del subgrafo de vértices B (amarillos), 
        identificar como AB (verde) los vértices que NO tienen salidas hacia otros B.
        Estos son las raíces de las cadenas de auto-citación.
        """
        stats = {
            "raices_ab": 0,
            "vertices_verde": 0
        }
        
        # Recolectar vértices B (amarillos)
        amarillos = set()
        for vertice_id, vertice in self.vertices.items():
            if vertice.tipo_cita == "B" or (vertice.color and vertice.color.lower() == "yellow"):
                amarillos.add(vertice_id)
        
        if not amarillos:
            return stats
        
        # Calcular out-degree dentro del subgrafo amarillo
        outdeg_amarillo = {n: 0 for n in amarillos}
        
        for vertice_id in amarillos:
            vertice = self.vertices.get(vertice_id)
            if not vertice:
                continue
            
            for destino_id in vertice.adyacencias.keys():
                if destino_id in amarillos:
                    outdeg_amarillo[vertice_id] += 1
        
        # Raíces = vértices B sin salidas a otros B
        raices = [vid for vid, deg in outdeg_amarillo.items() if deg == 0]
        
        # Marcar como AB (verde)
        for vid in raices:
            vertice = self.vertices.get(vid)
            if vertice:
                vertice.color = "green"
                vertice.tipo_cita = "AB"
                stats["vertices_verde"] += 1
        
        stats["raices_ab"] = len(raices)
        return stats
    
    def _calcular_resumen_ab(self) -> Dict[str, int]:
        """Calcula el resumen final de la clasificación A/B."""
        resumen = {
            "tipo_A": 0,   # Azul: sin coincidencias
            "tipo_B": 0,   # Amarillo: con coincidencias
            "tipo_AB": 0,  # Verde: raíces de cadenas
            "tipo_S": 0,   # Rojo: sin autores
            "total": 0
        }
        
        for vertice in self.vertices.values():
            # Solo contar artículos (capa 0)
            if vertice.capa != 0:
                continue
            
            resumen["total"] += 1
            color = (vertice.color or "").lower()
            tipo = vertice.tipo_cita
            
            if tipo == "AB" or color == "green":
                resumen["tipo_AB"] += 1
            elif tipo == "B" or color == "yellow":
                resumen["tipo_B"] += 1
            elif tipo == "A" or color == "blue":
                resumen["tipo_A"] += 1
            elif tipo == "S" or color == "red":
                resumen["tipo_S"] += 1
            else:
                resumen["tipo_S"] += 1  # No clasificado
        
        return resumen

