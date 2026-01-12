# main.py
# Punto de entrada de la aplicación FastAPI

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api.v1.endpoints import grafo
from app.core.config import settings

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle de la aplicación."""
    logger.info("🚀 Iniciando Dashboard de Artículos Académicos API")
    yield
    logger.info("👋 Cerrando aplicación")


app = FastAPI(
    title="Dashboard de Artículos Académicos",
    description="""
    API para análisis de redes de citaciones académicas.
    
    ## Características
    
    - 🔍 Búsqueda de artículos en múltiples motores académicos
    - 📊 Construcción de grafos de citas y referencias
    - 📈 Cálculo de métricas (PageRank, Centralidad, Betweenness)
    - 🎨 Exportación en formato vis.js para visualización
    
    ## Motores soportados
    
    - Semantic Scholar
    - OpenCitations
    - CrossRef
    - OpenAlex
    - Y más...
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


# Middleware personalizado para manejar OPTIONS ANTES de validación de body
@app.middleware("http")
async def cors_preflight_handler(request: Request, call_next):
    """
    Intercepta peticiones OPTIONS (CORS preflight) y las responde inmediatamente.
    Esto evita que FastAPI intente validar el body en peticiones OPTIONS.
    """
    if request.method == "OPTIONS":
        origin = request.headers.get("origin", "")
        
        # Verificar si el origen está permitido
        allowed = origin in settings.CORS_ORIGINS if origin else False
        
        if allowed or not origin:  # Permitir si no hay origin (testing)
            logger.info(f"✅ OPTIONS interceptado para {request.url.path} desde {origin}")
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": origin or "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin",
                    "Access-Control-Max-Age": "3600",
                    "Access-Control-Allow-Credentials": "true",
                    "Content-Length": "0",
                }
            )
        else:
            logger.warning(f"⚠️ OPTIONS rechazado para {request.url.path} desde {origin}")
    
    response = await call_next(request)
    return response


# Configurar CORS (middleware estándar de FastAPI)
logger.info(f"🔒 CORS configurado para: {settings.CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Registrar routers
app.include_router(
    grafo.router,
    prefix="/api/v1",
    tags=["Grafo de Artículos"]
)


@app.get("/", tags=["Health"])
async def root():
    """Endpoint de salud."""
    return {
        "mensaje": "Dashboard de Artículos Académicos API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check para monitoreo."""
    return {"status": "healthy"}

