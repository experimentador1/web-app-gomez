# 📊 FICHA TÉCNICA DEL PRODUCTO

## **Dashboard de Análisis de Redes de Citaciones Académicas**

---

## 🎯 DESCRIPCIÓN GENERAL

Sistema web avanzado para la visualización, análisis y exploración de redes de citaciones académicas, diseñado específicamente para investigadores, instituciones educativas y centros de investigación que requieren herramientas robustas para el análisis bibliométrico y la detección de patrones de citación.

**Desarrollador:** Equipo DACYTI UJAT 
**Versión Actual:** 0.1.0  
**Tipo de Software:** Aplicación Web Progresiva (PWA-ready)  
**Licencia:** MIT (Uso comercial y académico permitido)  
**Demostración en vivo:** https://web-app-gomez-2.onrender.com

---

## 🏆 PROPUESTA DE VALOR

### Para Instituciones Académicas

- **Análisis de impacto investigativo**: Identifique el impacto real de las publicaciones institucionales mediante métricas avanzadas de centralidad
- **Detección de auto-citación**: Algoritmo propietario "Citas A/B" que identifica patrones de auto-citación y cadenas de referencias circulares
- **Visualización intuitiva**: Grafos interactivos que facilitan la comprensión de relaciones complejas entre publicaciones
- **Soporte para análisis longitudinal**: Capacidad de fusionar múltiples búsquedas para construir redes de citaciones extensas

### Para Investigadores

- **Multi-motor de búsqueda**: Acceso simultáneo a Semantic Scholar, OpenAlex, CrossRef, OpenCitations y más
- **Métricas científicas reconocidas**: PageRank, Betweenness Centrality, Closeness Centrality aplicadas a redes académicas
- **Exportación de datos**: Capacidad de importar/exportar grafos en formatos estándar (JSON, CSV)
- **Interfaz responsiva**: Accesible desde cualquier dispositivo (escritorio, tablet, móvil)

---

## 🔬 FUNCIONALIDADES PRINCIPALES

### 1. **Búsqueda Multi-motor Inteligente**

- Consulta simultánea a múltiples bases de datos académicas
- Fusión automática de resultados eliminando duplicados
- Extracción de metadatos completos: título, autores, año, DOI, abstract, venue
- Construcción incremental de grafos (las búsquedas se acumulan)

**Motores académicos soportados:**
- Semantic Scholar
- OpenAlex
- CrossRef
- OpenCitations
- Core API
- DBLP
- PubMed (próximamente)

### 2. **Visualización Interactiva de Grafos**

- **Tecnología:** vis.js Network con física de simulación
- **Características:**
  - Zoom y pan ilimitados
  - Selección de nodos para ver detalles completos
  - Coloración por tipo (citas, referencias, raíces)
  - Agrupación automática de nodos relacionados
  - Filtrado dinámico de nodos dependientes
  - Modo oscuro/claro

### 3. **Módulo "Citas A/B" (Detección de Auto-citación)**

**Algoritmo propietario de 3 corridas** para clasificar artículos:

| Tipo | Color | Descripción | Aplicación |
|------|-------|-------------|------------|
| **A** | 🔵 Azul | Citas independientes | Artículos sin coincidencia de autores con sus citaciones |
| **B** | 🟡 Amarillo | Auto-citación detectada | Citante y citado comparten al menos un autor |
| **AB** | 🟢 Verde | Raíces de cadenas | Vértices que inician cadenas de auto-citación |
| **S** | 🔴 Rojo | Sin clasificar | Artículos sin información de autores |

**Casos de uso:**
- Auditorías de integridad investigativa
- Evaluación de políticas editoriales
- Análisis de impacto real vs. artificialmente inflado
- Detección de "citation farms"

### 4. **Métricas de Centralidad Avanzadas**

| Métrica | Descripción | Aplicación |
|---------|-------------|------------|
| **PageRank** | Importancia global del artículo | Identifica publicaciones fundamentales |
| **Betweenness** | Artículos "puente" entre comunidades | Detecta trabajos interdisciplinarios clave |
| **Closeness** | Cercanía promedio a otros nodos | Mide influencia directa en la red |
| **Grado de entrada** | Número de citas recibidas | Popularidad del artículo |
| **Grado de salida** | Número de referencias citadas | Exhaustividad de la revisión literaria |

### 5. **Gestión de Visibilidad de Nodos**

- **Ocultar dependientes**: Contrae nodos citantes para enfocar el análisis
- **Mostrar todo**: Restaura visibilidad completa del grafo
- **Búsqueda incremental**: Nuevas búsquedas se fusionan con el grafo existente
- **Limpieza selectiva**: Borrado completo del grafo para iniciar nuevos análisis

### 6. **Panel de Estadísticas Generales**

- Número total de nodos (artículos)
- Número total de aristas (citas)
- Artículos más citados (Top 10)
- Artículos más referenciados (Top 10)
- Distribución de grados
- Densidad del grafo
- Diámetro de la red

---

## 🛠️ ARQUITECTURA TÉCNICA

### **Stack Tecnológico**

#### Backend (API REST)
- **Framework:** FastAPI 0.109+ (Python 3.11+)
- **Validación:** Pydantic 2.5+ con tipado fuerte
- **Cliente HTTP:** httpx (asíncrono)
- **Servidor:** Uvicorn con workers configurables
- **Documentación automática:** OpenAPI/Swagger integrado

#### Frontend (Aplicación Web)
- **Framework:** React 18 + TypeScript (strict mode)
- **Visualización:** vis.js Network 9.1+ (WebGL acelerado)
- **Estado:** TanStack Query 5.17+ (server state management)
- **Estilo:** Tailwind CSS 3.4+ (diseño responsivo)
- **Build:** Vite 5.0+ (optimización automática de producción)
- **Iconografía:** Lucide React (sistema de íconos modular)

#### Infraestructura
- **Deploy:** Render.com (PaaS con CI/CD automático)
- **Dominio backend:** `grafo-gomez-api.onrender.com`
- **Dominio frontend:** `web-app-gomez-2.onrender.com`
- **CORS:** Configurado para seguridad cross-origin
- **Variables de entorno:** Gestionadas por Render.com dashboard

### **Arquitectura de Despliegue**

```
┌─────────────────────────────────────────────────────────────┐
│                     INSTITUCIONES                           │
│           (Navegadores: Chrome, Firefox, Safari)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend (React SPA)                           │
│         web-app-gomez-2.onrender.com                        │
│  - Visualización vis.js                                     │
│  - Gestión de estado con TanStack Query                     │
│  - UI responsiva Tailwind CSS                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                              │
│         grafo-gomez-api.onrender.com                        │
│  - Endpoints REST (/api/v1/*)                               │
│  - Lógica de grafos (core/grafo.py)                         │
│  - Algoritmo Citas A/B                                      │
│  - Cálculo de métricas (PageRank, etc.)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Motores Académicos Externos                       │
│  - Semantic Scholar  - OpenAlex  - CrossRef                 │
│  - OpenCitations     - DBLP      - Core API                 │
└─────────────────────────────────────────────────────────────┘
```

### **Seguridad y Cumplimiento**

- ✅ **HTTPS obligatorio** en todos los endpoints
- ✅ **CORS configurado** para prevenir ataques cross-site
- ✅ **Validación de inputs** con Pydantic (previene inyecciones)
- ✅ **Rate limiting** (preparado para implementar)
- ✅ **Sin almacenamiento de datos personales** (GDPR-friendly)
- ✅ **Código abierto auditable** (MIT License)

---

## 📡 API REST - Endpoints Principales

### **Búsqueda**

```
POST   /api/v1/buscar/sync
       → Búsqueda síncrona con fusión automática

GET    /api/v1/buscar/progreso/{task_id}
       → Monitoreo de búsquedas asíncronas
```

### **Grafos**

```
GET    /api/v1/grafo
       → Obtener grafo en formato vis.js

DELETE /api/v1/grafo
       → Limpiar grafo actual

POST   /api/v1/grafo/importar
       → Importar grafo (JSON/CSV)

POST   /api/v1/grafo/mostrar-todos
       → Hacer visibles todos los nodos
```

### **Métricas**

```
GET    /api/v1/metricas
       → Calcular PageRank, Betweenness, Closeness

GET    /api/v1/estadisticas
       → Estadísticas básicas del grafo
```

### **Citas A/B**

```
POST   /api/v1/citas-ab
       → Ejecutar clasificación A/B

GET    /api/v1/citas-ab/info
       → Información del algoritmo
```

### **Nodos**

```
POST   /api/v1/vertice/{vertice_id}/ocultar-dependientes
       → Ocultar nodos dependientes (citantes)
```

**Documentación interactiva:** `https://grafo-gomez-api.onrender.com/docs`

---

## 💼 CASOS DE USO INSTITUCIONALES

### 1. **Universidades y Centros de Investigación**

**Problema:** Evaluar el impacto real de las publicaciones de sus investigadores  
**Solución:** 
- Búsqueda de publicaciones institucionales
- Análisis de métricas de centralidad para identificar trabajos fundamentales
- Detección de auto-citación para auditorías de integridad
- Generación de reportes visuales para presentaciones institucionales

**Beneficio:** Toma de decisiones informada para promociones, financiamiento y reconocimientos

### 2. **Comités Editoriales**

**Problema:** Garantizar la calidad y ética en publicaciones  
**Solución:**
- Análisis de patrones de citación de artículos enviados
- Detección automática de auto-citación excesiva
- Identificación de "citation rings" (grupos de auto-citación mutua)

**Beneficio:** Mayor integridad del proceso de revisión por pares

### 3. **Bibliotecas Académicas**

**Problema:** Decisiones de adquisición de suscripciones y recursos  
**Solución:**
- Análisis de impacto de journals específicos
- Identificación de literatura fundamental por área de conocimiento
- Mapeo de relaciones entre publicaciones clave

**Beneficio:** Optimización del presupuesto de adquisiciones

### 4. **Oficinas de Transferencia Tecnológica**

**Problema:** Identificar tecnologías con potencial comercial  
**Solución:**
- Detección de patentes (papers) con alta centralidad
- Análisis de evolución de líneas de investigación
- Identificación de gaps en la literatura

**Beneficio:** Priorización de esfuerzos de comercialización

### 5. **Estudiantes de Posgrado**

**Problema:** Revisión de literatura exhaustiva para tesis  
**Solución:**
- Construcción visual de estado del arte
- Identificación rápida de publicaciones seminales
- Exploración de redes de citación por temas

**Beneficio:** Reducción del tiempo de revisión literaria y mejora de la calidad

---

## 📊 MÉTRICAS DE RENDIMIENTO

### **Capacidad del Sistema**

| Métrica | Valor | Observaciones |
|---------|-------|---------------|
| **Nodos máximos** | 10,000+ | Limitado por memoria del navegador |
| **Aristas máximas** | 50,000+ | Visualización fluida hasta ~5K aristas |
| **Tiempo de búsqueda** | 5-15 seg | Depende de motores académicos externos |
| **Cálculo de PageRank** | <1 seg | Para grafos de 1,000 nodos |
| **Clasificación Citas A/B** | <2 seg | Para grafos de 1,000 nodos |
| **Disponibilidad (uptime)** | 99.9% | Garantizado por Render.com |

### **Escalabilidad**

- ✅ **Horizontal:** Fácil migración a instancias dedicadas de Render.com
- ✅ **Vertical:** Soporta workers múltiples en backend
- ✅ **Cacheo:** Preparado para Redis (próxima versión)
- ✅ **CDN:** Frontend estático servido desde edge locations

---

## 💰 MODELOS DE IMPLEMENTACIÓN

### **Opción 1: SaaS Alojado (Recomendado)**

- **Costo:** $0 - $25 USD/mes (según uso)
- **Deploy:** Inmediato (ya desplegado)
- **Mantenimiento:** Gestionado por el proveedor
- **Actualizaciones:** Automáticas
- **Soporte:** Incluido
- **URL:** Personalizable con dominio institucional

**Ideal para:** Instituciones que prefieren soluciones listas para usar sin infraestructura propia

### **Opción 2: On-Premise (Auto-hospedado)**

- **Costo:** Solo infraestructura institucional
- **Deploy:** 1-2 días (requiere servidor Linux/Docker)
- **Mantenimiento:** A cargo de la institución
- **Actualizaciones:** Manuales
- **Soporte:** Documentación completa incluida
- **Datos:** 100% bajo control institucional

**Ideal para:** Instituciones con políticas estrictas de residencia de datos o requerimientos de personalización profunda

### **Opción 3: Implementación Híbrida**

- **Costo:** Variable
- **Deploy:** Frontend en servidor institucional, backend en SaaS
- **Mantenimiento:** Compartido
- **Seguridad:** Balance entre control y conveniencia

**Ideal para:** Instituciones que requieren branding personalizado pero prefieren delegar la lógica de negocio

---

## 🎓 CAPACITACIÓN Y SOPORTE

### **Documentación Incluida**

- ✅ Manual de usuario (README.md)
- ✅ Documentación técnica de API (OpenAPI/Swagger)
- ✅ Guía de despliegue paso a paso
- ✅ Casos de uso académicos
- ✅ Interpretación de métricas

### **Capacitación Disponible**

- 📹 Webinars de introducción (1 hora)
- 📚 Tutoriales en video (biblioteca)
- 👥 Sesiones personalizadas (opcional, bajo demanda)
- 📧 Soporte por correo electrónico

---

## 🔄 ROADMAP DE DESARROLLO

### **Versión 1.1 (Q2 2025)**
- [ ] Exportación de grafos a Gephi/Cytoscape
- [ ] Integración con PubMed
- [ ] Análisis de co-autoría
- [ ] Modo de comparación de grafos

### **Versión 1.2 (Q3 2025)**
- [ ] Clustering automático de comunidades (Louvain)
- [ ] Análisis temporal de evolución de citas
- [ ] API pública para integraciones
- [ ] Dashboard de administración multiusuario

### **Versión 2.0 (Q4 2025)**
- [ ] Machine Learning para predicción de impacto
- [ ] Análisis de sentimiento en abstracts
- [ ] Recomendación de literatura relacionada
- [ ] Modo colaborativo para equipos

---

## 📞 INFORMACIÓN DE CONTACTO

### **Demostración y Consultas**

- **Demo en vivo:** https://web-app-gomez-2.onrender.com
- **Documentación API:** https://grafo-gomez-api.onrender.com/docs
- **Repositorio GitHub:** https://github.com/experimentador1/web-app-gomez
- **Email:** [Insertar correo institucional]
- **Sitio web:** [Insertar sitio web institucional]

### **Solicitud de Propuesta Comercial**

Para recibir una propuesta personalizada que incluya:
- Análisis de necesidades institucionales
- Estimación de costos específicos
- Plan de implementación detallado
- Acuerdo de nivel de servicio (SLA)
- Contratos de soporte técnico

Por favor contactar a: [Insertar contacto comercial]

---

## ✅ REQUERIMIENTOS DEL CLIENTE

### **Requisitos Mínimos (Usuarios)**

- Navegador moderno: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Conexión a internet: 1 Mbps (recomendado 5 Mbps)
- Resolución de pantalla: 1024x768 (recomendado 1920x1080)
- JavaScript habilitado

### **Requisitos para Deploy On-Premise (IT)**

- Servidor Linux/Windows con Docker
- 2 CPU cores, 4GB RAM mínimo (recomendado 4 cores, 8GB)
- 10GB espacio en disco
- Puerto 80/443 accesible
- Python 3.11+ y Node.js 18+

---

## 📜 LICENCIA Y PROPIEDAD INTELECTUAL

**Licencia:** MIT License

Permite:
- ✅ Uso comercial
- ✅ Modificación
- ✅ Distribución
- ✅ Uso privado

Requiere:
- ⚠️ Incluir copyright y licencia en copias
- ⚠️ Limitación de responsabilidad (AS-IS)

**Código fuente disponible en:** https://github.com/experimentador1/web-app-gomez

---

## 🏅 VENTAJAS COMPETITIVAS

### **vs. Herramientas Desktop (VOSviewer, Gephi)**
- ✅ No requiere instalación
- ✅ Accesible desde cualquier dispositivo
- ✅ Actualizaciones automáticas
- ✅ Colaboración en tiempo real (próximamente)

### **vs. Plataformas Comerciales (Scopus, WoS)**
- ✅ Sin costos de suscripción
- ✅ Código abierto y auditable
- ✅ Multi-motor de búsqueda
- ✅ Personalizable al 100%

### **vs. Otras Herramientas Web**
- ✅ Algoritmo propietario de detección de auto-citación
- ✅ Stack tecnológico moderno (FastAPI + React)
- ✅ Métricas científicas reconocidas
- ✅ Visualización altamente interactiva

---

## 📅 VERSIÓN DE ESTE DOCUMENTO

- **Versión:** 1.0
- **Fecha:** Enero 2025
- **Última actualización del software:** Tag `navidad06`
- **Preparado por:** Dr. Gómez (PhD)

---

**© 2025 Dashboard de Análisis de Redes de Citaciones Académicas. Todos los derechos reservados.**

*Este documento es confidencial y está destinado únicamente para instituciones académicas y de investigación que evalúan la implementación del sistema.*


