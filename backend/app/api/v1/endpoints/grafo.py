# api/v1/endpoints/grafo.py
# Endpoints REST para el grafo de artículos académicos

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, UploadFile, File
from fastapi.responses import Response, StreamingResponse
from typing import Optional, Dict, Any, List
import asyncio
import csv
import io

from app.schemas.grafo import (
    BusquedaRequest,
    GrafoResponse,
    VisJSResponse,
    ProgresoResponse,
    MetricasRequest,
    MetricasResponse,
    MotorBusqueda,
    TipoBusqueda,
    ArticuloInfo,
    EstadisticasGrafo,
    VerticeResponse,
    AristaResponse
)
from app.services.grafo_service import grafo_service, TaskStatus

router = APIRouter()


# ==================== BÚSQUEDA ====================

@router.post("/buscar", response_model=Dict[str, Any])
async def iniciar_busqueda(
    request: BusquedaRequest,
    background_tasks: BackgroundTasks
):
    """
    Inicia una búsqueda de citas o referencias.
    Retorna un task_id para consultar el progreso.
    """
    task = grafo_service.crear_tarea()
    
    async def run_search():
        if request.tipo == TipoBusqueda.CITAS:
            await grafo_service.buscar_citas(
                titulo=request.titulo,
                motor=request.motor,
                niveles=request.niveles,
                max_hijos=request.max_hijos,
                api_key=request.api_key,
                task=task
            )
        elif request.tipo == TipoBusqueda.REFERENCIAS:
            await grafo_service.buscar_referencias(
                titulo=request.titulo,
                motor=request.motor,
                niveles=request.niveles,
                max_hijos=request.max_hijos,
                api_key=request.api_key,
                task=task
            )
    
    # Ejecutar en background
    background_tasks.add_task(run_search)
    
    return {
        "task_id": task.task_id,
        "mensaje": f"Búsqueda de {request.tipo.value} iniciada",
        "titulo": request.titulo,
        "motor": request.motor.value,
        "niveles": request.niveles
    }


@router.post("/buscar/sync")
async def buscar_sincrono(request: BusquedaRequest):
    """
    Realiza una búsqueda síncrona (espera a que termine).
    Recomendado solo para búsquedas pequeñas (niveles <= 1).
    
    Si merge=True (default), fusiona los nuevos resultados con el grafo existente.
    Si merge=False, reemplaza el grafo existente.
    """
    if request.niveles > 2:
        raise HTTPException(
            status_code=400,
            detail="Para búsquedas de más de 2 niveles, use el endpoint asíncrono /buscar"
        )
    
    try:
        if request.tipo == TipoBusqueda.CITAS:
            grafo = await grafo_service.buscar_citas(
                titulo=request.titulo,
                motor=request.motor,
                niveles=request.niveles,
                max_hijos=request.max_hijos,
                api_key=request.api_key,
                merge=request.merge
            )
        elif request.tipo == TipoBusqueda.AUTOR:
            limite_articulos = request.max_hijos if request.max_hijos is not None else 50
            grafo = await grafo_service.buscar_por_autor(
                nombre_autor=request.titulo,
                motor=request.motor,
                limite_articulos=min(limite_articulos, 500),
                api_key=request.api_key,
                merge=request.merge
            )
        else:
            grafo = await grafo_service.buscar_referencias(
                titulo=request.titulo,
                motor=request.motor,
                niveles=request.niveles,
                max_hijos=request.max_hijos,
                api_key=request.api_key,
                merge=request.merge
            )
        
        # Siempre retornar el grafo completo (con o sin merge)
        result = grafo_service.exportar_grafo(grafo, formato="visjs")
        return result
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/buscar/progreso/{task_id}", response_model=ProgresoResponse)
async def obtener_progreso(task_id: str):
    """
    Obtiene el progreso de una búsqueda en curso.
    """
    task = grafo_service.obtener_tarea(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    porcentaje = 0.0
    if task.progress.get("nivel_max", 0) > 0:
        porcentaje = (task.progress.get("nivel_actual", 0) / task.progress["nivel_max"]) * 100
    
    return ProgresoResponse(
        task_id=task.task_id,
        estado=task.status,
        n_vertices=task.progress.get("n_vertices", 0),
        n_aristas=task.progress.get("n_aristas", 0),
        nivel_actual=task.progress.get("nivel_actual", 0),
        nivel_max=task.progress.get("nivel_max", 0),
        pendientes=task.progress.get("pendientes", 0),
        tiempo_transcurrido=task.elapsed_time(),
        mensaje=task.progress.get("mensaje", ""),
        porcentaje=porcentaje
    )


@router.post("/buscar/cancelar/{task_id}")
async def cancelar_busqueda(task_id: str):
    """
    Cancela una búsqueda en curso.
    """
    if grafo_service.cancelar_tarea(task_id):
        return {"mensaje": "Búsqueda cancelada", "task_id": task_id}
    
    raise HTTPException(
        status_code=400,
        detail="No se pudo cancelar la tarea (no existe o ya terminó)"
    )


@router.get("/buscar/resultado/{task_id}", response_model=VisJSResponse)
async def obtener_resultado(task_id: str):
    """
    Obtiene el resultado de una búsqueda completada en formato vis.js.
    """
    task = grafo_service.obtener_tarea(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    if task.status == TaskStatus.IN_PROGRESS:
        raise HTTPException(status_code=202, detail="Búsqueda aún en progreso")
    
    if task.status == TaskStatus.ERROR:
        raise HTTPException(status_code=500, detail=task.error or "Error en la búsqueda")
    
    if task.status == TaskStatus.CANCELLED:
        # Retornar resultado parcial si existe
        if task.grafo:
            return grafo_service.exportar_grafo(task.grafo, formato="visjs")
        raise HTTPException(status_code=400, detail="Búsqueda cancelada sin resultados")
    
    if not task.grafo:
        raise HTTPException(status_code=404, detail="No hay resultados disponibles")
    
    return grafo_service.exportar_grafo(task.grafo, formato="visjs")


# ==================== PAPER ====================

@router.get("/paper")
async def buscar_paper(
    titulo: str = Query(..., min_length=3, description="Título o DOI del artículo"),
    motor: MotorBusqueda = Query(default=MotorBusqueda.SEMANTIC_SCHOLAR)
):
    """
    Busca información de un artículo específico.
    """
    paper = await grafo_service.buscar_paper(titulo=titulo, motor=motor)
    
    if not paper:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    return paper


# ==================== GRAFO ====================

@router.get("/grafo", response_model=VisJSResponse)
async def obtener_grafo():
    """
    Obtiene el grafo actual en formato vis.js.
    """
    if not grafo_service.grafo_actual:
        return {"nodes": [], "edges": []}
    
    return grafo_service.exportar_grafo(formato="visjs")


@router.get("/grafo/json")
async def obtener_grafo_json():
    """
    Obtiene el grafo actual en formato JSON completo.
    """
    if not grafo_service.grafo_actual:
        return {"vertices": [], "aristas": [], "estadisticas": {}}
    
    return grafo_service.exportar_grafo(formato="json")


# ==================== EXPORTAR (PRO / LITE / SUBGRAFO VISIBLE) ====================

@router.get("/grafo/exportar/pro/json")
async def exportar_grafo_pro_json():
    """Exporta el grafo en formato JSON PRO (info completa, compatible con escritorio)."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    return grafo_service.exportar_grafo(formato="pro_json")


@router.get("/grafo/exportar/pro/csv")
async def exportar_grafo_pro_csv():
    """Descarga el grafo como archivo CSV PRO."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    fieldnames, rows = grafo_service.exportar_grafo_csv(formato="pro")
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=buf.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=grafo_pro.csv"}
    )


@router.get("/grafo/exportar/lite/json")
async def exportar_grafo_lite_json():
    """Exporta el grafo en formato JSON LITE (info limpiada)."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    return grafo_service.exportar_grafo(formato="lite_json")


@router.get("/grafo/exportar/lite/csv")
async def exportar_grafo_lite_csv():
    """Descarga el grafo como archivo CSV LITE."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    fieldnames, rows = grafo_service.exportar_grafo_csv(formato="lite")
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=buf.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=grafo_lite.csv"}
    )


@router.get("/grafo/exportar/subgrafo-visible/pro/json")
async def exportar_subgrafo_visible_pro_json():
    """Exporta solo los nodos visibles en formato JSON PRO."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    return grafo_service.exportar_grafo(formato="subgrafo_visible_pro_json")


@router.get("/grafo/exportar/subgrafo-visible/pro/csv")
async def exportar_subgrafo_visible_pro_csv():
    """Descarga solo nodos visibles como CSV PRO."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    fieldnames, rows = grafo_service.exportar_grafo_csv(formato="subgrafo_visible_pro")
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=buf.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=subgrafo_visible_pro.csv"}
    )


@router.get("/grafo/exportar/subgrafo-visible/lite/json")
async def exportar_subgrafo_visible_lite_json():
    """Exporta solo nodos visibles en formato JSON LITE."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    return grafo_service.exportar_grafo(formato="subgrafo_visible_lite_json")


@router.get("/grafo/exportar/subgrafo-visible/lite/csv")
async def exportar_subgrafo_visible_lite_csv():
    """Descarga solo nodos visibles como CSV LITE."""
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    fieldnames, rows = grafo_service.exportar_grafo_csv(formato="subgrafo_visible_lite")
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=buf.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=subgrafo_visible_lite.csv"}
    )


# ==================== IMPORTAR (PRO JSON / PRO CSV) ====================

@router.post("/grafo/importar/pro/json")
async def importar_grafo_pro_json(data: Dict[str, Any]):
    """
    Importa un grafo desde JSON.
    Body: { "nodes": [...], "edges": [...], "merge": false, "tipo": "lite" | "pro" }
    - tipo "pro": grafo completo (abstract, autores, citas, etc.).
    - tipo "lite": info mínima (artículo, autores, citas).
    """
    if not data:
        raise HTTPException(status_code=400, detail="Cuerpo vacío")
    merge = data.get("merge", False)
    tipo = (data.get("tipo") or "pro").lower()
    if tipo not in ("lite", "pro"):
        tipo = "pro"
    try:
        grafo_service.importar_grafo_pro_json(data, merge=merge, tipo=tipo)
    except Exception as e:
        import traceback, logging
        logging.getLogger(__name__).error("Error importar JSON:\n%s", traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Error al importar JSON: {str(e)}")
    return {
        "mensaje": f"Grafo importado correctamente (versión {tipo.upper()})",
        "total_vertices": grafo_service.grafo_actual.num_vertices() if grafo_service.grafo_actual else 0,
        "total_aristas": grafo_service.grafo_actual.num_aristas() if grafo_service.grafo_actual else 0,
    }


@router.post("/grafo/importar/pro/csv")
async def importar_grafo_pro_csv(
    merge: bool = Query(default=False, description="Fusionar con grafo existente"),
    tipo: str = Query(default="pro", description="Versión del archivo: lite (mínimo) o pro (completo)"),
    file: Optional[UploadFile] = File(None),
):
    """
    Importa un grafo desde archivo CSV.
    Envía el archivo como multipart/form-data con clave 'file'.
    tipo: "lite" (info mínima) o "pro" (grafo completo).
    """
    if not file:
        raise HTTPException(status_code=400, detail="Debe enviar un archivo CSV (form-data key 'file')")
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser .csv")
    tipo = (tipo or "pro").lower()
    if tipo not in ("lite", "pro"):
        tipo = "pro"
    try:
        content = (await file.read()).decode("utf-8-sig")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer el archivo: {str(e)}")
    try:
        grafo_service.importar_grafo_pro_csv(content, merge=merge, tipo=tipo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al importar CSV: {str(e)}")
    return {
        "mensaje": f"Grafo importado correctamente (versión {tipo.upper()})",
        "total_vertices": grafo_service.grafo_actual.num_vertices() if grafo_service.grafo_actual else 0,
        "total_aristas": grafo_service.grafo_actual.num_aristas() if grafo_service.grafo_actual else 0,
    }


@router.delete("/grafo")
async def limpiar_grafo():
    """
    Limpia el grafo actual.
    """
    grafo_service.limpiar_grafo()
    return {"mensaje": "Grafo limpiado correctamente"}


@router.post("/grafo/importar")
async def importar_grafo(data: Dict[str, Any]):
    """
    Importa un grafo desde formato vis.js (JSON).
    
    Formato esperado:
    {
        "nodes": [{"id": "...", "label": "...", ...}, ...],
        "edges": [{"from": "...", "to": "...", ...}, ...]
    }
    
    Opciones:
    - "merge": true → fusiona con el grafo existente
    - "merge": false (default) → reemplaza el grafo actual
    """
    from app.core.grafo import Grafo
    import logging
    logger = logging.getLogger(__name__)
    
    nodes = data.get("nodes", [])
    edges = data.get("edges", [])
    merge = data.get("merge", False)
    
    logger.info(f"[IMPORTAR] Recibido: {len(nodes)} nodos, {len(edges)} aristas, merge={merge}")
    
    # Log de algunas aristas para debug
    if edges:
        logger.info(f"[IMPORTAR] Primeras aristas: {edges[:3]}")
    
    if not nodes:
        raise HTTPException(status_code=400, detail="No se encontraron nodos en los datos")
    
    visjs_data = {"nodes": nodes, "edges": edges}
    
    try:
        if merge and grafo_service.grafo_actual:
            # Fusionar con grafo existente
            stats = grafo_service.grafo_actual.merge_from_visjs(visjs_data)
            logger.info(f"[IMPORTAR] Fusionado: {stats}")
            return {
                "mensaje": "Grafo fusionado correctamente",
                "estadisticas": stats,
                "total_vertices": grafo_service.grafo_actual.num_vertices(),
                "total_aristas": grafo_service.grafo_actual.num_aristas()
            }
        else:
            # Crear nuevo grafo
            grafo_service.grafo_actual = Grafo.from_visjs(visjs_data)
            actual_aristas = grafo_service.grafo_actual.num_aristas()
            logger.info(f"[IMPORTAR] Nuevo grafo: {grafo_service.grafo_actual.num_vertices()} vertices, {actual_aristas} aristas")
            return {
                "mensaje": "Grafo importado correctamente",
                "estadisticas": {
                    "vertices_nuevos": len(nodes),
                    "aristas_recibidas": len(edges),
                    "aristas_creadas": actual_aristas
                },
                "total_vertices": grafo_service.grafo_actual.num_vertices(),
                "total_aristas": actual_aristas
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al importar grafo: {str(e)}")


# ==================== MÉTRICAS ====================

@router.get("/metricas", response_model=MetricasResponse)
async def obtener_metricas(
    pagerank: bool = Query(default=True, description="Calcular PageRank"),
    betweenness: bool = Query(default=False, description="Calcular Betweenness"),
    closeness: bool = Query(default=False, description="Calcular Closeness")
):
    """
    Calcula y retorna métricas del grafo actual.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    
    metricas = grafo_service.calcular_metricas(
        incluir_pagerank=pagerank,
        incluir_betweenness=betweenness,
        incluir_closeness=closeness
    )
    
    return MetricasResponse(
        densidad=metricas.get("densidad", 0),
        centralidad_grado=metricas.get("centralidad_grado", {}),
        pagerank=metricas.get("pagerank"),
        betweenness=metricas.get("betweenness"),
        closeness=metricas.get("closeness"),
        top_10_centralidad=metricas.get("top_10_centralidad", []),
        top_10_pagerank=metricas.get("top_10_pagerank", [])
    )


@router.post("/metricas/calcular")
async def calcular_metricas_personalizadas(request: MetricasRequest):
    """
    Calcula métricas personalizadas.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    
    metricas = grafo_service.calcular_metricas(
        incluir_pagerank=request.calcular_pagerank,
        incluir_betweenness=request.calcular_betweenness,
        incluir_closeness=request.calcular_closeness
    )
    
    return metricas


# ==================== ESTADÍSTICAS ====================

@router.get("/estadisticas")
async def obtener_estadisticas():
    """
    Obtiene estadísticas básicas del grafo actual.
    """
    if not grafo_service.grafo_actual:
        return {
            "num_vertices": 0,
            "num_aristas": 0,
            "densidad": 0,
            "grafo_vacio": True
        }
    
    g = grafo_service.grafo_actual
    return {
        "num_vertices": g.num_vertices(),
        "num_aristas": g.num_aristas(),
        "densidad": g.calcular_densidad(),
        "grafo_vacio": False
    }


# ==================== VÉRTICES ====================

@router.get("/vertice/{vertice_id}")
async def obtener_vertice(vertice_id: str):
    """
    Obtiene información detallada de un vértice.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    
    vertice = grafo_service.grafo_actual.busca_vertice(vertice_id)
    if not vertice:
        raise HTTPException(status_code=404, detail="Vértice no encontrado")
    
    info = vertice.informacion.to_dict()
    x = float(vertice.x) if vertice.x is not None else 0.0
    y = float(vertice.y) if vertice.y is not None else 0.0
    return {
        "id": vertice_id,
        "informacion": info,
        "grado_entrada": vertice.grado_entrada,
        "grado_salida": vertice.grado_salida,
        "tipo": vertice.tipo_cita,
        "capa": vertice.capa,
        "motor": vertice.motor,
        "visible": vertice.visible,
        "x": x,
        "y": y,
        "adyacencias": vertice.get_adyacencias()
    }


@router.get("/vertices")
async def listar_vertices(
    limite: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """
    Lista los vértices del grafo con paginación.
    """
    if not grafo_service.grafo_actual:
        return {"vertices": [], "total": 0}
    
    all_vertices = grafo_service.grafo_actual.get_vertices()
    total = len(all_vertices)
    
    vertices_paginated = all_vertices[offset:offset + limite]
    
    result = []
    for vid in vertices_paginated:
        v = grafo_service.grafo_actual.busca_vertice(vid)
        if v:
            result.append({
                "id": vid,
                "titulo": v.informacion.title,
                "year": v.informacion.year,
                "citationCount": v.informacion.citation_count,
                "tipo": v.tipo_cita,
                "grado_entrada": v.grado_entrada,
                "grado_salida": v.grado_salida
            })
    
    return {
        "vertices": result,
        "total": total,
        "offset": offset,
        "limite": limite
    }


# ==================== POSICIÓN ====================

@router.post("/vertice/{vertice_id}/posicion")
async def set_vertice_posicion(
    vertice_id: str,
    payload: Dict[str, Any],
):
    """
    Establece la posición (x, y) del nodo en el canvas.
    Body: { "x": number, "y": number }
    Así Guardar Pro puede exportar las coordenadas donde el usuario dejó cada nodo.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    vertice = grafo_service.grafo_actual.busca_vertice(vertice_id)
    if not vertice:
        raise HTTPException(status_code=404, detail="Vértice no encontrado")
    try:
        x = float(payload.get("x", 0))
        y = float(payload.get("y", 0))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="x e y deben ser números")
    grafo_service.grafo_actual.set_posicion(vertice_id, x, y)
    return {"mensaje": "Posición actualizada", "vertice_id": vertice_id, "x": x, "y": y}


@router.post("/grafo/posiciones")
async def set_posiciones_batch(payload: Dict[str, Any]):
    """
    Actualiza las posiciones (x, y) de múltiples nodos en una sola llamada.
    Body: { "posiciones": { "<id_nodo>": { "x": number, "y": number }, ... } }
    Se usa tras Force Atlas o al finalizar un arrastre para sincronizar todas
    las coordenadas del canvas con el backend antes de exportar.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    posiciones: Dict[str, Any] = payload.get("posiciones") or {}
    if not isinstance(posiciones, dict) or not posiciones:
        raise HTTPException(status_code=400, detail="Se esperaba { posiciones: { id: {x, y} } }")
    actualizados = 0
    for nid, coords in posiciones.items():
        try:
            x = float(coords.get("x", 0))
            y = float(coords.get("y", 0))
        except (TypeError, ValueError):
            continue
        if grafo_service.grafo_actual.set_posicion(nid, x, y):
            actualizados += 1
    return {"mensaje": f"{actualizados} posiciones actualizadas", "actualizados": actualizados}


# ==================== VISIBILIDAD ====================

@router.post("/vertice/{vertice_id}/visible")
async def set_vertice_visible(
    vertice_id: str,
    payload: Dict[str, Any],
):
    """
    Establece si el nodo es visible u oculto.
    Body: { "visible": true | false }
    Retorna el grafo actualizado en formato vis.js.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    vertice = grafo_service.grafo_actual.busca_vertice(vertice_id)
    if not vertice:
        raise HTTPException(status_code=404, detail="Vértice no encontrado")
    visible = payload.get("visible", True)
    if not isinstance(visible, bool):
        visible = str(visible).lower() in ("true", "1", "yes")
    grafo_service.grafo_actual.set_visible(vertice_id, visible)
    grafo_actualizado = grafo_service.exportar_grafo(formato="visjs")
    return {
        "mensaje": "Nodo visible" if visible else "Nodo oculto",
        "vertice_id": vertice_id,
        "visible": visible,
        "grafo": grafo_actualizado
    }


@router.post("/vertice/{vertice_id}/ocultar-dependientes")
async def ocultar_dependientes(vertice_id: str):
    """
    Oculta todos los nodos dependientes/referentes (nodos que apuntan al nodo dado).
    
    Retorna el grafo actualizado en formato vis.js.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    
    vertice = grafo_service.grafo_actual.busca_vertice(vertice_id)
    if not vertice:
        raise HTTPException(status_code=404, detail="Vértice no encontrado")
    
    # Ocultar dependientes
    resultado = grafo_service.grafo_actual.ocultar_referentes(vertice_id)
    
    # Obtener grafo actualizado
    grafo_actualizado = grafo_service.exportar_grafo(formato="visjs")
    
    return {
        "mensaje": resultado["mensaje"],
        "referentes": resultado["referentes"],
        "accion": resultado["accion"],
        "ocultados": resultado.get("ocultados", 0),
        "grafo": grafo_actualizado
    }


@router.post("/grafo/mostrar-todos")
async def mostrar_todos_vertices():
    """
    Hace visibles todos los vértices del grafo.
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    
    count = grafo_service.grafo_actual.mostrar_todos()
    
    # Obtener grafo actualizado
    grafo_actualizado = grafo_service.exportar_grafo(formato="visjs")
    
    return {
        "mensaje": f"{count} vértices ahora son visibles",
        "vertices_mostrados": count,
        "grafo": grafo_actualizado
    }

# ==================== CLASIFICACIÓN CITAS A/B ====================

@router.post("/citas-ab")
async def clasificar_citas_ab():
    """
    Clasifica el grafo usando el algoritmo de Citas A/B.
    
    El algoritmo clasifica los vértices en:
    - A: Vértices que solo tienen citas (no referencias)
    - B: Vértices que tienen referencias
    - AB: Vértices raíz con referencias
    - S: Vértices sin clasificar
    """
    if not grafo_service.grafo_actual:
        raise HTTPException(status_code=404, detail="No hay grafo cargado")
    
    # Ejecutar clasificación
    resultado = grafo_service.grafo_actual.clasificar_citas_ab()
    
    # Obtener grafo actualizado con colores
    grafo_actualizado = grafo_service.exportar_grafo(formato="visjs")
    
    return {
        "mensaje": "Clasificación Citas A/B completada",
        "total_vertices": resultado["total_vertices"],
        "clasificados": resultado["clasificados"],
        "detalles": resultado["detalles"],
        "grafo": grafo_actualizado
    }

@router.get("/citas-ab/info")
async def obtener_info_citas_ab():
    """
    Obtiene información sobre el algoritmo de Citas A/B.
    """
    return {
        "nombre": "Clasificación Citas A/B",
        "descripcion": "Clasifica los vértices del grafo según su patrón de citas y referencias",
        "categorias": {
            "A": "Vértices que solo tienen citas (artículos citados)",
            "B": "Vértices que tienen referencias (citan a otros)",
            "AB": "Vértices raíz con referencias",
            "S": "Vértices sin clasificar"
        },
        "colores": {
            "A": "#FF6B6B",
            "B": "#4ECDC4",
            "AB": "#FFD93D",
            "S": "#95A5A6"
        }
    }

