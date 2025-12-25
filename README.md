# Dashboard de Artículos Académicos - Gómez

Aplicación web para análisis de redes de citaciones académicas, construida con **FastAPI** (backend) y **React + vis.js** (frontend).

## 🚀 Características

- 🔍 **Búsqueda de artículos** en múltiples motores académicos (Semantic Scholar, CrossRef, OpenAlex, etc.)
- 📊 **Grafos interactivos** de citas y referencias con vis.js
- 📈 **Métricas de centralidad**: PageRank, Betweenness, Closeness
- 🔄 **Fusión de grafos**: las búsquedas se acumulan en el grafo existente
- 🎨 **Interfaz moderna** con Tailwind CSS y modo oscuro
- 🚀 **Listo para Render.com**

## 📁 Estructura del Proyecto

```
web-app-gomez/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── api/v1/endpoints/   # Endpoints REST
│   │   ├── core/               # Lógica de negocio (grafo)
│   │   ├── schemas/            # Modelos Pydantic
│   │   ├── services/           # Servicios y motores
│   │   └── main.py             # Punto de entrada
│   └── requirements.txt
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── services/           # Cliente API
│   │   ├── types/              # Tipos TypeScript
│   │   └── App.tsx             # Aplicación principal
│   └── package.json
│
└── render.yaml                 # Config Render.com
```

## 🛠️ Desarrollo Local

### Requisitos

- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en `http://localhost:8000`
- Documentación Swagger: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🌐 Despliegue en Render.com

### Opción 1: Despliegue automático con Blueprint

1. Subir este repositorio a GitHub
2. Crear cuenta en [Render.com](https://render.com)
3. Ir a Dashboard → **New** → **Blueprint**
4. Conectar el repositorio de GitHub
5. Render detectará el archivo `render.yaml` y creará los servicios automáticamente

### Opción 2: Despliegue manual

#### Backend (Web Service)

1. Crear nuevo "Web Service"
2. Conectar repositorio
3. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3

#### Frontend (Static Site)

1. Crear nuevo "Static Site"
2. Conectar repositorio
3. Configurar:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Agregar variable de entorno:
   - `VITE_API_URL`: URL del backend (ej: `https://grafo-gomez-api.onrender.com`)

## 📡 API Endpoints

### Búsqueda

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/buscar/sync` | Búsqueda síncrona (fusiona con grafo existente) |
| GET | `/api/v1/buscar/progreso/{task_id}` | Estado de búsqueda |

### Grafo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/grafo` | Grafo en formato vis.js |
| DELETE | `/api/v1/grafo` | Limpiar grafo |
| POST | `/api/v1/grafo/importar` | Importar grafo (JSON/CSV) |

### Métricas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/metricas` | Métricas del grafo |
| GET | `/api/v1/estadisticas` | Estadísticas básicas |

## 🔧 Variables de Entorno

### Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `8000` |
| `DEBUG` | Modo debug | `false` |
| `CORS_ORIGINS` | Orígenes permitidos | `https://grafo-gomez-web.onrender.com` |

### Frontend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend | `https://grafo-gomez-api.onrender.com` |

## 📚 Tecnologías

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Framework web moderno
- [Pydantic](https://pydantic.dev/) - Validación de datos
- [httpx](https://www.python-httpx.org/) - Cliente HTTP asíncrono

### Frontend
- [React 18](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [vis.js](https://visjs.org/) - Visualización de grafos
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool

## 📄 Licencia

MIT - Libre para uso comercial y personal.
