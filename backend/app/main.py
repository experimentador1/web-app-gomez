# main.py
# Punto de entrada de la aplicación FastAPI

from fastapi import FastAPI
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

# Configurar CORS - Permitir todos los orígenes para producción
logger.info(f"CORS_ORIGINS configurado: {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=False,  # Debe ser False cuando allow_origins es "*"
    allow_methods=["*"],
    allow_headers=["*"],
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

