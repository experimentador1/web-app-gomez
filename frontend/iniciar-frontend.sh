#!/bin/bash
# Script para iniciar el frontend en puerto 3000.
# Ejecutar en Terminal: ./iniciar-frontend.sh  (o: bash iniciar-frontend.sh)

cd "$(dirname "$0")"

if ! command -v npm &>/dev/null; then
  echo "❌ No se encontró 'npm'. Instala Node.js desde https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
fi

echo "🚀 Iniciando frontend en http://localhost:3000"
echo "   (Cierra con Ctrl+C)"
npm run dev
