# Dashboard de Artículos Académicos - Gómez

Aplicación web para análisis de redes de citaciones académicas, construida con **FastAPI** (backend) y **React + vis.js** (frontend).

**Demo en vivo:** https://web-app-gomez-2.onrender.com

## 🚀 Características

- 🔍 **Búsqueda de artículos** en múltiples motores académicos (Semantic Scholar, CrossRef, OpenAlex, etc.)
- 📊 **Grafos interactivos** de citas y referencias con vis.js
- 📈 **Métricas de centralidad**: PageRank, Betweenness, Closeness
- 🔄 **Fusión de grafos**: las búsquedas se acumulan en el grafo existente
- 🧬 **Clasificación Citas A/B**: detección de auto-citación por coincidencia de autores
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
└── render.yaml                 # Config Render.com (Blueprint)
```

---

## 🌐 Despliegue en Render.com

### Paso 1: Subir a GitHub

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/web-app-gomez.git
git push -u origin main
```

### Paso 2: Crear el Backend (Web Service)

1. Ve a [Render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:

| Campo | Valor |
|-------|-------|
| **Name** | `grafo-gomez-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

4. Agrega las **Variables de Entorno** (ver sección abajo)
5. Click en **Create Web Service**

### Paso 3: Crear el Frontend (Web Service)

1. **New +** → **Web Service**
2. Conecta el mismo repositorio
3. Configura:

| Campo | Valor |
|-------|-------|
| **Name** | `grafo-gomez-web` |
| **Root Directory** | `frontend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

4. Agrega las **Variables de Entorno** (ver sección abajo)
5. Click en **Create Web Service**

---

## 🔧 Variables de Entorno

### Backend (`grafo-gomez-api`)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `CORS_ORIGINS` | `https://TU-FRONTEND.onrender.com` | **IMPORTANTE:** URL exacta del frontend |
| `PYTHON_VERSION` | `3.11.0` | Versión de Python |
| `DEBUG` | `false` | Modo debug (false en producción) |

**⚠️ IMPORTANTE sobre CORS:**
- El valor de `CORS_ORIGINS` debe ser la URL exacta de tu frontend
- Sin barra `/` al final
- Ejemplo: `https://grafo-gomez-web.onrender.com`
- Si tu frontend tiene otro nombre (ej: `web-app-gomez-2`), usa esa URL

### Frontend (`grafo-gomez-web`)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://TU-BACKEND.onrender.com` | URL del backend |

**Ejemplo:**
- Si tu backend es `grafo-gomez-api.onrender.com`
- Entonces: `VITE_API_URL` = `https://grafo-gomez-api.onrender.com`

---

## ⚠️ Solución de Problemas Comunes

### Error: "Network Error" o "CORS blocked"

**Causa:** La variable `CORS_ORIGINS` del backend no coincide con el dominio del frontend.

**Solución:**
1. Ve al backend en Render → **Environment**
2. Verifica que `CORS_ORIGINS` tenga la URL exacta del frontend
3. Guarda y espera el redeploy

### El frontend muestra JSON en lugar de la app

**Causa:** Estás accediendo al backend, no al frontend.

**Solución:** Usa la URL del frontend, no del backend.

### Los cambios no se reflejan

**Solución:** 
1. Ve al servicio en Render
2. Click en **Manual Deploy** → **Clear build cache & deploy**

### El servicio se "duerme" (plan gratuito)

**Causa:** Los servicios gratuitos se suspenden tras 15 min de inactividad.

**Solución:** La primera visita tarda ~30 segundos en despertar. Es normal.

---

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

# Ejecutar servidor
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor
npm run dev
```

- App: http://localhost:5173

---

## 📡 API Endpoints

### Búsqueda

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/buscar/sync` | Búsqueda síncrona (fusiona con grafo existente) |
| `GET` | `/api/v1/buscar/progreso/{task_id}` | Estado de búsqueda |

### Grafo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/grafo` | Grafo en formato vis.js |
| `DELETE` | `/api/v1/grafo` | Limpiar grafo |
| `POST` | `/api/v1/grafo/importar` | Importar grafo (JSON/CSV) |

### Métricas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/metricas` | Métricas del grafo |
| `GET` | `/api/v1/estadisticas` | Estadísticas básicas |

### Citas A/B

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/citas-ab` | Clasificar artículos por coincidencia de autores |
| `GET` | `/api/v1/citas-ab/info` | Información del algoritmo |

---

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

---

## 🧬 Módulo Citas A/B

El módulo **Citas A/B** permite clasificar los artículos de un grafo según la coincidencia de autores entre citantes y citados. Es útil para identificar patrones de **auto-citación** en redes de citaciones académicas.

### ¿Cómo funciona?

El algoritmo ejecuta **3 corridas** sobre el grafo:

1. **Corrida 1 (Clasificación inicial):** Identifica artículos con y sin información de autores
2. **Corrida 2 (Detección de auto-citación):** Encuentra pares citante-citado que comparten al menos un autor
3. **Corrida 3 (Raíces de cadenas):** Marca las raíces de las cadenas de auto-citación

### Tipos de clasificación

| Tipo | Color | Descripción |
|------|-------|-------------|
| **A** | 🔵 Azul | Citas independientes - artículos con autores pero sin coincidencias con sus citados/citantes |
| **B** | 🟡 Amarillo | Auto-citación - artículos donde citante y citado comparten al menos un autor |
| **AB** | 🟢 Verde | Raíces de cadenas - vértices tipo B que son origen de cadenas de auto-citación |
| **S** | 🔴 Rojo | Sin clasificar - artículos sin información de autores disponible |

### Uso

1. Construye un grafo buscando artículos (botón "Buscar")
2. Haz clic en el botón **"Citas A/B"** (color ámbar) en la barra de herramientas
3. Los nodos del grafo se colorearán según su clasificación
4. Se mostrará un modal con el **reporte detallado** de la clasificación

### Interpretación de resultados

- **Alto % de tipo B (amarillo):** La red tiene mucha auto-citación
- **Vértices verdes (AB):** Son los artículos "raíz" que inician cadenas de auto-citación
- **Vértices rojos (S):** Artículos sin datos de autor (considerar mejorar los datos)

### API Endpoint

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/citas-ab` | Ejecuta clasificación A/B y retorna grafo actualizado con reporte |
| `GET` | `/api/v1/citas-ab/info` | Información sobre el algoritmo |

---

## 📄 Licencia

MIT - Libre para uso comercial y personal.

---

## 🎄 Historial de Versiones

- **navidad04** (25 dic 2025) - Módulo Citas A/B: clasificación por coincidencia de autores
- **navidad03** (25 dic 2025) - Deploy en Render.com completado, fix CORS y autores
- **navidad02** (25 dic 2025) - Búsqueda fusiona grafos en lugar de reemplazar
- **navidad01** (25 dic 2025) - Inicio del trabajo
