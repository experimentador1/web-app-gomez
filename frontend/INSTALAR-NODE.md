# Instalar Node.js en tu Mac

En la terminal salió: **"No se encontró 'npm'"**. Eso significa que Node.js (que incluye npm) no está instalado o no está en el PATH. Elige **una** de estas opciones.

---

## Opción 1: Instalador oficial (la más sencilla)

1. Entra en: **https://nodejs.org**
2. Descarga la versión **LTS** (botón verde).
3. Abre el archivo `.pkg` descargado e instala (Siguiente, Aceptar, etc.).
4. **Cierra Terminal por completo** y vuelve a abrirla.
5. Comprueba:
   ```bash
   node -v
   npm -v
   ```
   Deberían salir números de versión.
6. Luego inicia el frontend:
   ```bash
   cd /Volumes/KINGSTON/web-grafo-citas/web-app-gomez/frontend
   ./iniciar-frontend.sh
   ```

---

## Opción 2: Con Homebrew (si ya lo usas)

Si tienes Homebrew instalado:

```bash
brew install node
```

Cierra y abre Terminal, luego:

```bash
cd /Volumes/KINGSTON/web-grafo-citas/web-app-gomez/frontend
./iniciar-frontend.sh
```

---

## Opción 3: Node ya instalado pero no se encuentra

A veces Node está instalado (por ejemplo con nvm o en otra ruta) y la terminal no lo ve. Prueba:

```bash
# ¿Está en /usr/local?
/usr/local/bin/node -v 2>/dev/null && /usr/local/bin/npm -v

# ¿Tienes nvm? (carga nvm y usa node)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node -v
npm -v
```

Si ahí sí salen versiones, usa esa misma terminal para:

```bash
cd /Volumes/KINGSTON/web-grafo-citas/web-app-gomez/frontend
npm install
npm run dev
```

---

## Resumen

- **Más fácil:** Opción 1 (descargar desde nodejs.org e instalar el .pkg).
- Después de instalar, **cierra y abre Terminal** antes de volver a ejecutar `./iniciar-frontend.sh` o `npm run dev`.
