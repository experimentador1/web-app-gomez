# core/config.py
# Configuración de la aplicación usando Pydantic Settings

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os


class Settings(BaseSettings):
    """Configuración de la aplicación."""
    
    # Aplicación
    APP_NAME: str = "Dashboard Artículos Académicos"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS - Acepta string separado por comas o lista
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parsea CORS_ORIGINS desde string o lista."""
        if isinstance(v, str):
            # Si es string, separar por comas
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
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
