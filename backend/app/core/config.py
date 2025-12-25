# core/config.py
# Configuración de la aplicación usando Pydantic Settings

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Configuración de la aplicación."""
    
    # Aplicación
    APP_NAME: str = "Dashboard Artículos Académicos"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS - Incluye URLs de desarrollo y producción en Render
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://dashboard-articulos-web.onrender.com",
        "https://dashboard-articulos-frontend.onrender.com",
    ]
    
    # API Keys (opcionales)
    SEMANTIC_SCHOLAR_API_KEY: str = ""
    OPENALEX_API_KEY: str = ""
    
    # Límites
    MAX_SEARCH_LEVELS: int = 5
    MAX_CHILDREN_PER_NODE: int = 100
    DEFAULT_SEARCH_PAUSE: float = 0.3
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

