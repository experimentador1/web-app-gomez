# services/grafo_service.py
# Servicio principal que orquesta la construcción de grafos

import asyncio
import uuid
from typing import Optional, Dict, Any, Callable
from datetime import datetime
import logging

from app.core.grafo import Grafo
from app.services.engines.semantic_scholar import SemanticScholarEngine, SearchConfig
from app.schemas.grafo import MotorBusqueda, TipoBusqueda

logger = logging.getLogger(__name__)


class TaskStatus:
    """Estado de una tarea de búsqueda."""
    PENDING = "pendiente"
    IN_PROGRESS = "en_progreso"
    COMPLETED = "completado"
    CANCELLED = "cancelado"
    ERROR = "error"


class SearchTask:
    """Representa una tarea de búsqueda en progreso."""
    
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.status = TaskStatus.PENDING
        self.grafo: Optional[Grafo] = None
        self.progress = {
            "n_vertices": 0,
            "n_aristas": 0,
            "nivel_actual": 0,
            "nivel_max": 0,
            "pendientes": 0,
            "mensaje": ""
        }
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.error: Optional[str] = None
        self._cancel_requested = False
    
    def cancel(self):
        self._cancel_requested = True
    
    @property
    def is_cancelled(self) -> bool:
        return self._cancel_requested
    
    def elapsed_time(self) -> str:
        if not self.started_at:
            return "00:00"
        end = self.completed_at or datetime.now()
        delta = end - self.started_at
        minutes = int(delta.total_seconds() // 60)
        seconds = int(delta.total_seconds() % 60)
        return f"{minutes:02d}:{seconds:02d}"


class GrafoService:
    """
    Servicio principal para gestionar grafos de artículos académicos.
    Orquesta los motores de búsqueda y gestiona tareas asíncronas.
    """
    
    def __init__(self):
        # Grafo actual en memoria (para una sesión)
        self.grafo_actual: Optional[Grafo] = None
        
        # Tareas de búsqueda activas
        self.tareas: Dict[str, SearchTask] = {}
        
        # Motores disponibles
        self._engines = {
            MotorBusqueda.SEMANTIC_SCHOLAR: SemanticScholarEngine
        }
    
    def _get_engine(self, motor: MotorBusqueda, config: Optional[SearchConfig] = None):
        """Obtiene una instancia del motor de búsqueda."""
        engine_class = self._engines.get(motor)
        if not engine_class:
            raise ValueError(f"Motor no soportado: {motor}")
        return engine_class(config)
    
    def crear_tarea(self) -> SearchTask:
        """Crea una nueva tarea de búsqueda."""
        task_id = str(uuid.uuid4())
        task = SearchTask(task_id)
        self.tareas[task_id] = task
        return task
    
    def obtener_tarea(self, task_id: str) -> Optional[SearchTask]:
        """Obtiene una tarea por su ID."""
        return self.tareas.get(task_id)
    
    def cancelar_tarea(self, task_id: str) -> bool:
        """Cancela una tarea en progreso."""
        task = self.tareas.get(task_id)
        if task and task.status == TaskStatus.IN_PROGRESS:
            task.cancel()
            task.status = TaskStatus.CANCELLED
            return True
        return False
    
    async def buscar_citas(
        self,
        titulo: str,
        motor: MotorBusqueda = MotorBusqueda.SEMANTIC_SCHOLAR,
        niveles: int = 1,
        max_hijos: Optional[int] = None,
        api_key: Optional[str] = None,
        task: Optional[SearchTask] = None,
        merge: bool = False
    ) -> Grafo:
        """
        Busca citas de un artículo y construye el grafo.
        
        Args:
            merge: Si True, fusiona el nuevo grafo con el existente.
                   Si False (default), reemplaza el grafo existente.
        """
        config = SearchConfig(
            niveles=niveles,
            max_children=max_hijos,
            api_key=api_key
        )
        
        engine = self._get_engine(motor, config)
        
        if task:
            task.status = TaskStatus.IN_PROGRESS
            task.started_at = datetime.now()
            task.progress["nivel_max"] = niveles
        
        def progress_callback(data: Dict[str, Any]):
            if task:
                task.progress.update(data)
                if task.is_cancelled:
                    engine.cancel()
        
        try:
            grafo_nuevo = await engine.generar_grafo_citas(
                titulo=titulo,
                niveles=niveles,
                progress_callback=progress_callback
            )
            
            # Fusionar o reemplazar según el parámetro merge
            if merge and self.grafo_actual:
                stats = self.grafo_actual.merge(grafo_nuevo)
                logger.info(f"Grafo fusionado (citas): {stats}")
            else:
                self.grafo_actual = grafo_nuevo
            
            if task:
                task.grafo = self.grafo_actual
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.now()
            
            return self.grafo_actual
            
        except Exception as e:
            logger.error(f"Error en búsqueda de citas: {e}")
            if task:
                task.status = TaskStatus.ERROR
                task.error = str(e)
                task.completed_at = datetime.now()
            raise
    
    async def buscar_referencias(
        self,
        titulo: str,
        motor: MotorBusqueda = MotorBusqueda.SEMANTIC_SCHOLAR,
        niveles: int = 1,
        max_hijos: Optional[int] = None,
        api_key: Optional[str] = None,
        task: Optional[SearchTask] = None,
        merge: bool = False
    ) -> Grafo:
        """
        Busca referencias de un artículo y construye el grafo.
        
        Args:
            merge: Si True, fusiona el nuevo grafo con el existente.
                   Si False (default), reemplaza el grafo existente.
        """
        config = SearchConfig(
            niveles=niveles,
            max_children=max_hijos,
            api_key=api_key
        )
        
        engine = self._get_engine(motor, config)
        
        if task:
            task.status = TaskStatus.IN_PROGRESS
            task.started_at = datetime.now()
            task.progress["nivel_max"] = niveles
        
        def progress_callback(data: Dict[str, Any]):
            if task:
                task.progress.update(data)
                if task.is_cancelled:
                    engine.cancel()
        
        try:
            grafo_nuevo = await engine.generar_grafo_referencias(
                titulo=titulo,
                niveles=niveles,
                progress_callback=progress_callback
            )
            
            # Fusionar o reemplazar según el parámetro merge
            if merge and self.grafo_actual:
                stats = self.grafo_actual.merge(grafo_nuevo)
                logger.info(f"Grafo fusionado (referencias): {stats}")
            else:
                self.grafo_actual = grafo_nuevo
            
            if task:
                task.grafo = self.grafo_actual
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.now()
            
            return self.grafo_actual
            
        except Exception as e:
            logger.error(f"Error en búsqueda de referencias: {e}")
            if task:
                task.status = TaskStatus.ERROR
                task.error = str(e)
                task.completed_at = datetime.now()
            raise
    
    async def buscar_paper(
        self,
        titulo: str,
        motor: MotorBusqueda = MotorBusqueda.SEMANTIC_SCHOLAR,
        api_key: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Busca información de un paper específico."""
        config = SearchConfig(api_key=api_key)
        engine = self._get_engine(motor, config)
        return await engine.buscar_paper(titulo=titulo)
    
    def calcular_metricas(
        self,
        grafo: Optional[Grafo] = None,
        incluir_pagerank: bool = True,
        incluir_betweenness: bool = False,
        incluir_closeness: bool = False
    ) -> Dict[str, Any]:
        """
        Calcula métricas del grafo.
        """
        g = grafo or self.grafo_actual
        if not g:
            return {}
        
        metricas = {
            "densidad": g.calcular_densidad(),
            "num_vertices": g.num_vertices(),
            "num_aristas": g.num_aristas(),
            "centralidad_grado": g.calcular_centralidad_grado()
        }
        
        if incluir_pagerank:
            metricas["pagerank"] = g.calcular_pagerank()
        
        if incluir_betweenness:
            metricas["betweenness"] = g.calcular_betweenness()
        
        if incluir_closeness:
            metricas["closeness"] = g.calcular_closeness()
        
        # Top 10 por centralidad
        centralidad = metricas["centralidad_grado"]
        top_centralidad = sorted(
            centralidad.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        metricas["top_10_centralidad"] = [
            {"id": k, "valor": v, "titulo": self._get_titulo(g, k)}
            for k, v in top_centralidad
        ]
        
        # Top 10 por PageRank
        if incluir_pagerank:
            pagerank = metricas["pagerank"]
            top_pagerank = sorted(
                pagerank.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
            metricas["top_10_pagerank"] = [
                {"id": k, "valor": v, "titulo": self._get_titulo(g, k)}
                for k, v in top_pagerank
            ]
        
        return metricas
    
    def _get_titulo(self, grafo: Grafo, vertice_id: str) -> str:
        """Obtiene el título de un vértice."""
        vertice = grafo.busca_vertice(vertice_id)
        if vertice:
            return vertice.informacion.title
        return vertice_id
    
    def exportar_grafo(
        self,
        grafo: Optional[Grafo] = None,
        formato: str = "visjs"
    ) -> Dict[str, Any]:
        """
        Exporta el grafo en el formato especificado.
        """
        g = grafo or self.grafo_actual
        if not g:
            return {"nodes": [], "edges": []}
        
        if formato == "visjs":
            return g.to_visjs()
        elif formato == "json":
            return g.to_dict()
        else:
            return g.to_dict()
    
    def limpiar_grafo(self):
        """Limpia el grafo actual."""
        if self.grafo_actual:
            self.grafo_actual.limpiar()
        self.grafo_actual = None
    
    def obtener_estadisticas_tarea(self, task_id: str) -> Dict[str, Any]:
        """Obtiene estadísticas de una tarea."""
        task = self.tareas.get(task_id)
        if not task:
            return {}
        
        return {
            "task_id": task.task_id,
            "estado": task.status,
            "n_vertices": task.progress.get("n_vertices", 0),
            "n_aristas": task.progress.get("n_aristas", 0),
            "nivel_actual": task.progress.get("nivel_actual", 0),
            "nivel_max": task.progress.get("nivel_max", 0),
            "pendientes": task.progress.get("pendientes", 0),
            "tiempo_transcurrido": task.elapsed_time(),
            "mensaje": task.progress.get("mensaje", ""),
            "error": task.error
        }


# Instancia singleton del servicio
grafo_service = GrafoService()

