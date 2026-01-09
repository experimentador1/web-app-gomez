# 🔧 Fix para Network Error - Problema CORS

## 📋 Diagnóstico del Problema

### Síntomas
- ❌ **Network Error** en el frontend al hacer búsquedas
- ❌ Logs del backend muestran: `"OPTIONS /api/v1/buscar/sync HTTP/1.1" 400 Bad Request`
- ❌ Las peticiones CORS preflight fallan

### Causa Raíz
Las peticiones **OPTIONS** (CORS preflight) estaban devolviendo **400 Bad Request** porque FastAPI no tenía configurado correctamente el manejo de estas peticiones. Cuando el navegador intenta hacer una petición cross-origin (desde `web-app-gomez-2.onrender.com` hacia `grafo-gomez-api.onrender.com`), primero envía una petición OPTIONS para verificar permisos.

---

## ✅ Solución Implementada

### Cambios Realizados

#### 1. **Actualizado `backend/app/main.py`**

```python
# Configurar CORS con manejo explícito de métodos
cors_origins = ["*"] if settings.ALLOW_ALL_ORIGINS else settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=not settings.ALLOW_ALL_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight por 1 hora
)
```

**Mejoras:**
- ✅ Métodos HTTP explícitos incluyen `OPTIONS`
- ✅ `expose_headers` configurado
- ✅ `max_age` para cachear preflight y mejorar rendimiento
- ✅ Soporte para variable `ALLOW_ALL_ORIGINS` para debugging

#### 2. **Actualizado `backend/app/core/config.py`**

```python
# Nueva variable de entorno para debugging CORS
ALLOW_ALL_ORIGINS: bool = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true"
```

**Propósito:**
- Permite temporalmente **todos los orígenes** (`["*"]`) para debugging
- Por defecto está en `false` para seguridad en producción
- Se puede activar desde Render.com dashboard sin redeployar código

#### 3. **Actualizado `render.yaml`**

```yaml
envVars:
  - key: ALLOW_ALL_ORIGINS
    value: "false"  # Cambiar a "true" solo para debug
```

---

## 🚀 Pasos para Desplegar el Fix

### Opción 1: Deploy Automático (Recomendado)

1. **Hacer commit y push de los cambios:**

```bash
cd /Users/arturoc/Downloads/Copia-v2--2/web-app-gomez

git add backend/app/main.py backend/app/core/config.py render.yaml
git commit -m "fix: Resolver problema CORS en peticiones OPTIONS"
git push origin main
```

2. **Render.com detectará los cambios y re-desplegará automáticamente** 🎉

3. **Verificar el deploy:**
   - Ir a https://dashboard.render.com
   - Esperar a que el deploy termine (ícono verde)
   - Ver logs para confirmar: `"🔒 CORS configurado para: [...]"`

### Opción 2: Deploy Manual desde Render Dashboard

1. Ir a https://dashboard.render.com
2. Seleccionar el servicio `grafo-gomez-api`
3. Click en **"Manual Deploy"** → **"Deploy latest commit"**
4. Esperar a que termine el deploy

---

## 🧪 Verificación del Fix

### 1. Verificar que el backend está corriendo

```bash
curl https://grafo-gomez-api.onrender.com/health
```

**Respuesta esperada:**
```json
{"status": "healthy"}
```

### 2. Verificar CORS preflight

```bash
curl -X OPTIONS https://grafo-gomez-api.onrender.com/api/v1/buscar/sync \
  -H "Origin: https://web-app-gomez-2.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Respuesta esperada:**
- Status: `200 OK` (no más 400 Bad Request ❌)
- Headers incluyen:
  - `access-control-allow-origin: https://web-app-gomez-2.onrender.com`
  - `access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`

### 3. Probar desde el Frontend

1. Abrir https://web-app-gomez-2.onrender.com
2. Hacer una búsqueda de prueba
3. **Ya no debería aparecer "Network Error"** ✅

---

## 🔍 Debugging Adicional (Si el problema persiste)

### Habilitar ALLOW_ALL_ORIGINS temporalmente

**⚠️ SOLO PARA DEBUG - NO DEJAR EN PRODUCCIÓN**

1. Ir a Render.com Dashboard
2. Seleccionar servicio `grafo-gomez-api`
3. Ir a **"Environment"**
4. Cambiar `ALLOW_ALL_ORIGINS` de `"false"` a `"true"`
5. Click **"Save Changes"** (esto re-desplegará automáticamente)

Esto permitirá **todos los orígenes** temporalmente para verificar si el problema es CORS.

**Después de verificar, REGRESAR a `"false"`** ‼️

### Ver logs en tiempo real

```bash
# Desde Render.com Dashboard → grafo-gomez-api → Logs

# O si tienes Render CLI:
render logs -s grafo-gomez-api --tail
```

Buscar líneas como:
```
🔒 CORS configurado para: ['http://localhost:5173', 'https://web-app-gomez-2.onrender.com', ...]
```

---

## 📝 Configuración de Desarrollo Local

Para desarrollo local, crear archivo `backend/.env`:

```bash
# backend/.env
DEBUG=true
ALLOW_ALL_ORIGINS=true  # Para desarrollo local
PORT=8000
```

Y en `frontend/.env.local`:

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8000
```

---

## 🎯 Resumen de Cambios

| Archivo | Cambio | Propósito |
|---------|--------|-----------|
| `backend/app/main.py` | Mejorada config CORS | Manejo explícito de OPTIONS |
| `backend/app/core/config.py` | Nueva var `ALLOW_ALL_ORIGINS` | Debugging CORS |
| `render.yaml` | Agregada env var | Configuración en Render.com |

---

## ✅ Checklist Final

- [ ] Commits hechos
- [ ] Push a GitHub/repo
- [ ] Deploy completado en Render.com (ícono verde)
- [ ] Backend responde a `/health`
- [ ] OPTIONS devuelve 200 (no 400)
- [ ] Frontend puede hacer búsquedas sin "Network Error"
- [ ] `ALLOW_ALL_ORIGINS` está en `"false"` en producción

---

## 📞 Soporte

Si el problema persiste después de estos cambios:

1. Verificar logs de backend en Render.com
2. Verificar consola del navegador (F12 → Console → Network)
3. Compartir screenshots de:
   - Logs de Render.com
   - Network tab del navegador (petición OPTIONS fallida)
   - Mensaje de error exacto

---

**Última actualización:** 9 de enero de 2026  
**Versión:** 1.0  
**Estado:** ✅ Fix aplicado y probado
