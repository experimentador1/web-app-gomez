# Iniciar el frontend en localhost:3000

El error "Safari no puede conectarse al servidor" en **localhost:3000** significa que el **servidor del frontend no está en marcha**. Hay que arrancarlo en tu Mac.

## Pasos (en la app Terminal de tu Mac)

### 1. Abrir Terminal
Abre la app **Terminal** (o iTerm).

### 2. Ir a la carpeta del frontend
```bash
cd /Volumes/KINGSTON/web-grafo-citas/web-app-gomez/frontend
```

### 3. Instalar dependencias (solo la primera vez)
```bash
npm install
```

### 4. Arrancar el servidor de desarrollo
```bash
npm run dev
```

### 5. Abrir en Safari
Cuando veas algo como:
```
  ➜  Local:   http://localhost:3000/
```
abre en Safari: **http://localhost:3000**

---

## Si no tienes Node.js instalado

1. Instala Node.js desde https://nodejs.org (versión LTS).
2. Cierra y vuelve a abrir Terminal.
3. Vuelve a ejecutar los pasos 2, 3 y 4 de arriba.

---

## Resumen de puertos

| Servicio  | Puerto | URL                    |
|-----------|--------|------------------------|
| Frontend  | 3000   | http://localhost:3000  |
| Backend   | 8000   | http://localhost:8000  |

El backend debe estar corriendo en otra terminal (en la carpeta `backend` con `uvicorn`). El frontend en 3000 llama a la API en 8000.
