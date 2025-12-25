# services/engines/semantic_scholar.py
# Motor Semantic Scholar adaptado para web (sin tkinter)

import httpx
import asyncio
import logging
from typing import Optional, Dict, List, Any, Set, Callable
from dataclasses import dataclass, field

from app.core.grafo import Grafo, ArticuloInfo

logger = logging.getLogger(__name__)


@dataclass
class SearchConfig:
    """Configuración para la búsqueda."""
    niveles: int = 1
    pause: float = 0.3
    max_children: Optional[int] = None
    api_key: Optional[str] = None
    workers: int = 6
    timeout: int = 40
    retries: int = 5


class SemanticScholarEngine:
    """
    Motor de búsqueda Semantic Scholar adaptado para uso asíncrono en web.
    """
    
    # Endpoints Graph API v1
    S2_SEARCH_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
    S2_PAPER_URL = "https://api.semanticscholar.org/graph/v1/paper/{paperId}"
    AUTHOR_SEARCH_URL = "https://api.semanticscholar.org/graph/v1/author/search"
    AUTHOR_PAPERS_URL = "https://api.semanticscholar.org/graph/v1/author/{authorId}/papers"
    
    # Campos a solicitar
    S2_FIELDS = "paperId,title,year,authors,externalIds,venue,url,abstract,citationCount,citations,references"
    
    def __init__(self, config: Optional[SearchConfig] = None):
        self.config = config or SearchConfig()
        self.grafo = Grafo()
        self.visitados: Set[str] = set()
        self.nombre_motor = "Semantic Scholar"
        self._cancel_requested = False
        
        # Estadísticas
        self.stats = {
            "queries_search": 0,
            "queries_paper": 0,
            "errors": 0
        }
    
    def cancel(self):
        """Solicita cancelación de la búsqueda."""
        self._cancel_requested = True
    
    def reset(self):
        """Reinicia el estado del motor."""
        self.grafo = Grafo()
        self.visitados.clear()
        self._cancel_requested = False
        self.stats = {"queries_search": 0, "queries_paper": 0, "errors": 0}
    
    def _headers(self) -> Dict[str, str]:
        """Headers para las peticiones."""
        headers = {"Accept": "application/json"}
        if self.config.api_key:
            headers["x-api-key"] = self.config.api_key
        return headers
    
    async def _get_with_retry(
        self, 
        client: httpx.AsyncClient, 
        url: str, 
        params: Dict[str, Any],
        endpoint_tag: str
    ) -> Optional[Dict[str, Any]]:
        """Realiza petición GET con reintentos y backoff."""
        backoff = 1.0
        
        for attempt in range(self.config.retries):
            if self._cancel_requested:
                return None
            
            try:
                if self.config.pause > 0:
                    await asyncio.sleep(self.config.pause)
                
                response = await client.get(
                    url, 
                    params=params, 
                    headers=self._headers(),
                    timeout=self.config.timeout
                )
                
                self.stats[f"queries_{endpoint_tag}"] = self.stats.get(f"queries_{endpoint_tag}", 0) + 1
                
                if response.status_code == 200:
                    return response.json()
                
                if response.status_code in (429, 502, 503, 504):
                    retry_after = response.headers.get("Retry-After")
                    wait_time = float(retry_after) if retry_after else (2 ** attempt) + 0.5
                    logger.warning(f"Rate limit hit, waiting {wait_time}s (attempt {attempt + 1})")
                    await asyncio.sleep(wait_time)
                    continue
                
                if response.status_code == 404:
                    return None
                
                logger.error(f"Error {response.status_code} from {endpoint_tag}")
                return None
                
            except httpx.TimeoutException:
                logger.warning(f"Timeout on {endpoint_tag}, attempt {attempt + 1}")
                await asyncio.sleep(backoff)
                backoff *= 1.5
            except Exception as e:
                logger.error(f"Error on {endpoint_tag}: {e}")
                self.stats["errors"] += 1
                await asyncio.sleep(backoff)
                backoff *= 1.5
        
        return None
    
    def _map_paper_to_info(self, paper: Dict[str, Any]) -> Dict[str, Any]:
        """Mapea respuesta de S2 al esquema interno."""
        external_ids = paper.get("externalIds") or {}
        doi = external_ids.get("DOI") if isinstance(external_ids, dict) else paper.get("doi")
        
        authors = []
        for author in (paper.get("authors") or []):
            if isinstance(author, dict):
                name = author.get("name")
                if name:
                    authors.append(str(name))
            elif isinstance(author, str):
                authors.append(author)
        
        # Procesar citas (solo IDs/títulos básicos)
        citations = []
        for cita in (paper.get("citations") or []):
            if isinstance(cita, dict):
                citations.append(cita.get("paperId") or cita.get("title", ""))
            elif isinstance(cita, str):
                citations.append(cita)
        
        # Procesar referencias
        references = []
        for ref in (paper.get("references") or []):
            if isinstance(ref, dict):
                references.append(ref.get("paperId") or ref.get("title", ""))
            elif isinstance(ref, str):
                references.append(ref)
        
        return {
            "paperId": paper.get("paperId"),
            "title": paper.get("title") or "Sin título",
            "year": paper.get("year"),
            "venue": paper.get("venue") or "No disponible",
            "url": paper.get("url"),
            "doi": doi,
            "abstract": paper.get("abstract") or "No disponible",
            "citationCount": paper.get("citationCount") or 0,
            "authors": authors,
            "citations": citations,
            "references": references,
            "categoria": "articulo"
        }
    
    async def buscar_paper(
        self, 
        titulo: Optional[str] = None, 
        paper_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Busca un paper por título o ID.
        """
        async with httpx.AsyncClient() as client:
            # Si tenemos paper_id, buscar directamente
            if paper_id:
                url = self.S2_PAPER_URL.format(paperId=paper_id)
                params = {"fields": self.S2_FIELDS}
                data = await self._get_with_retry(client, url, params, "paper")
                return self._map_paper_to_info(data) if data else None
            
            # Buscar por título
            if titulo:
                params = {"query": titulo, "limit": 1, "fields": self.S2_FIELDS}
                data = await self._get_with_retry(client, self.S2_SEARCH_URL, params, "search")
                
                if data and data.get("data"):
                    paper = data["data"][0]
                    return self._map_paper_to_info(paper)
            
            return None
    
    async def generar_grafo_citas(
        self,
        titulo: str,
        niveles: int = 1,
        progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Grafo:
        """
        Genera un grafo de citas a partir de un artículo.
        """
        self.reset()
        self.config.niveles = niveles
        
        async with httpx.AsyncClient() as client:
            # Buscar artículo raíz
            paper_raiz = await self._buscar_paper_interno(client, titulo)
            if not paper_raiz:
                return self.grafo
            
            # Agregar vértice raíz
            titulo_raiz = paper_raiz.get("title", titulo)
            self.grafo.agregar_o_actualizar_vertice(titulo_raiz, paper_raiz)
            vertice_raiz = self.grafo.busca_vertice(titulo_raiz)
            if vertice_raiz:
                vertice_raiz.tipo_cita = "raiz"
                vertice_raiz.motor = self.nombre_motor
            
            self.visitados.add(titulo_raiz)
            
            # Procesar niveles
            cola = [(titulo_raiz, paper_raiz.get("paperId"), 0)]
            
            while cola and not self._cancel_requested:
                titulo_actual, paper_id, nivel = cola.pop(0)
                
                if nivel >= niveles:
                    continue
                
                # Obtener citas del paper
                citas = await self._obtener_citas(client, paper_id)
                
                for cita in citas:
                    if self._cancel_requested:
                        break
                    
                    cita_titulo = cita.get("title")
                    cita_id = cita.get("paperId")
                    
                    if not cita_titulo or cita_titulo in self.visitados:
                        continue
                    
                    # Agregar vértice de cita
                    info_cita = self._map_paper_to_info(cita)
                    self.grafo.agregar_o_actualizar_vertice(cita_titulo, info_cita)
                    vertice_cita = self.grafo.busca_vertice(cita_titulo)
                    if vertice_cita:
                        vertice_cita.tipo_cita = "cita"
                        vertice_cita.motor = self.nombre_motor
                    
                    # Crear arista: la cita apunta al artículo citado
                    self.grafo.agregar_arista(cita_titulo, titulo_actual)
                    
                    self.visitados.add(cita_titulo)
                    
                    # Agregar a cola para siguiente nivel
                    if nivel + 1 < niveles and cita_id:
                        cola.append((cita_titulo, cita_id, nivel + 1))
                    
                    # Reportar progreso
                    if progress_callback:
                        progress_callback({
                            "n_vertices": self.grafo.num_vertices(),
                            "n_aristas": self.grafo.num_aristas(),
                            "nivel": nivel + 1,
                            "pendientes": len(cola)
                        })
        
        return self.grafo
    
    async def generar_grafo_referencias(
        self,
        titulo: str,
        niveles: int = 1,
        progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Grafo:
        """
        Genera un grafo de referencias a partir de un artículo.
        """
        self.reset()
        self.config.niveles = niveles
        
        async with httpx.AsyncClient() as client:
            # Buscar artículo raíz
            paper_raiz = await self._buscar_paper_interno(client, titulo)
            if not paper_raiz:
                return self.grafo
            
            # Agregar vértice raíz
            titulo_raiz = paper_raiz.get("title", titulo)
            self.grafo.agregar_o_actualizar_vertice(titulo_raiz, paper_raiz)
            vertice_raiz = self.grafo.busca_vertice(titulo_raiz)
            if vertice_raiz:
                vertice_raiz.tipo_cita = "raiz"
                vertice_raiz.motor = self.nombre_motor
            
            self.visitados.add(titulo_raiz)
            
            # Procesar niveles
            cola = [(titulo_raiz, paper_raiz.get("paperId"), 0)]
            
            while cola and not self._cancel_requested:
                titulo_actual, paper_id, nivel = cola.pop(0)
                
                if nivel >= niveles:
                    continue
                
                # Obtener referencias del paper
                referencias = await self._obtener_referencias(client, paper_id)
                
                for ref in referencias:
                    if self._cancel_requested:
                        break
                    
                    ref_titulo = ref.get("title")
                    ref_id = ref.get("paperId")
                    
                    if not ref_titulo or ref_titulo in self.visitados:
                        continue
                    
                    # Agregar vértice de referencia
                    info_ref = self._map_paper_to_info(ref)
                    self.grafo.agregar_o_actualizar_vertice(ref_titulo, info_ref)
                    vertice_ref = self.grafo.busca_vertice(ref_titulo)
                    if vertice_ref:
                        vertice_ref.tipo_cita = "referencia"
                        vertice_ref.motor = self.nombre_motor
                    
                    # Crear arista: el artículo apunta a su referencia
                    self.grafo.agregar_arista(titulo_actual, ref_titulo)
                    
                    self.visitados.add(ref_titulo)
                    
                    # Agregar a cola para siguiente nivel
                    if nivel + 1 < niveles and ref_id:
                        cola.append((ref_titulo, ref_id, nivel + 1))
                    
                    # Reportar progreso
                    if progress_callback:
                        progress_callback({
                            "n_vertices": self.grafo.num_vertices(),
                            "n_aristas": self.grafo.num_aristas(),
                            "nivel": nivel + 1,
                            "pendientes": len(cola)
                        })
        
        return self.grafo
    
    async def _buscar_paper_interno(
        self, 
        client: httpx.AsyncClient, 
        titulo: str
    ) -> Optional[Dict[str, Any]]:
        """Búsqueda interna de paper."""
        params = {"query": titulo, "limit": 1, "fields": self.S2_FIELDS}
        data = await self._get_with_retry(client, self.S2_SEARCH_URL, params, "search")
        
        if data and data.get("data"):
            return data["data"][0]
        return None
    
    async def _obtener_citas(
        self, 
        client: httpx.AsyncClient, 
        paper_id: str
    ) -> List[Dict[str, Any]]:
        """Obtiene las citas de un paper."""
        if not paper_id:
            return []
        
        url = self.S2_PAPER_URL.format(paperId=paper_id)
        params = {"fields": "citations.paperId,citations.title,citations.year,citations.citationCount,citations.authors"}
        
        data = await self._get_with_retry(client, url, params, "paper")
        
        if data and data.get("citations"):
            citas = data["citations"]
            if self.config.max_children:
                citas = citas[:self.config.max_children]
            return [c for c in citas if c and c.get("title")]
        
        return []
    
    async def _obtener_referencias(
        self, 
        client: httpx.AsyncClient, 
        paper_id: str
    ) -> List[Dict[str, Any]]:
        """Obtiene las referencias de un paper."""
        if not paper_id:
            return []
        
        url = self.S2_PAPER_URL.format(paperId=paper_id)
        params = {"fields": "references.paperId,references.title,references.year,references.citationCount,references.authors"}
        
        data = await self._get_with_retry(client, url, params, "paper")
        
        if data and data.get("references"):
            refs = data["references"]
            if self.config.max_children:
                refs = refs[:self.config.max_children]
            return [r for r in refs if r and r.get("title")]
        
        return []
    
    async def buscar_autor(self, nombre: str) -> Optional[Dict[str, Any]]:
        """Busca un autor por nombre."""
        async with httpx.AsyncClient() as client:
            params = {"query": nombre, "limit": 1}
            data = await self._get_with_retry(client, self.AUTHOR_SEARCH_URL, params, "search")
            
            if data and data.get("data"):
                return data["data"][0]
            return None
    
    async def obtener_articulos_autor(
        self, 
        author_id: str, 
        limite: int = 50
    ) -> List[Dict[str, Any]]:
        """Obtiene los artículos de un autor."""
        async with httpx.AsyncClient() as client:
            url = self.AUTHOR_PAPERS_URL.format(authorId=author_id)
            params = {"fields": self.S2_FIELDS, "limit": limite}
            
            data = await self._get_with_retry(client, url, params, "paper")
            
            if data and data.get("data"):
                return [self._map_paper_to_info(p) for p in data["data"]]
            return []

