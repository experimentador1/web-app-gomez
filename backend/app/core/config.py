# core/config.py
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

    # CORS
    ALLOW_ALL_ORIGINS: bool = False
    CORS_ALLOWED_ORIGINS: str = ""

    # API Keys (opcionales)
    SEMANTIC_SCHOLAR_API_KEY: str = ""
    OPENALEX_API_KEY: str = ""

    # Límites
    MAX_SEARCH_LEVELS: int = 5
    MAX_CHILDREN_PER_NODE: int = 100
    DEFAULT_SEARCH_PAUSE: float = 0.3

    @property
    def CORS_ORIGINS(self) -> List[str]:
        if self.ALLOW_ALL_ORIGINS:
            return ["*"]
        if self.CORS_ALLOWED_ORIGINS:
            return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",")]
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "https://web-app-gomez.onrender.com",
            "https://web-app-gomez-2.onrender.com",
            "https://grafo-gomez-web.onrender.com",
        ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
