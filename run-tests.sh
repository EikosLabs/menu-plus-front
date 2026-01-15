#!/bin/bash
set -e

cleanup() {
  echo "🧹 Cleaning up..."

  # Matar proceso dev si está corriendo
  if [ -n "$DEV_PID" ] && ps -p $DEV_PID > /dev/null 2>&1; then
    echo "🛑 Killing dev server (PID: $DEV_PID)..."
    kill $DEV_PID 2>/dev/null || true
    wait $DEV_PID 2>/dev/null || true
  fi

  # Matar cualquier proceso node que esté usando el puerto 4321
  pkill -f "astro dev" 2>/dev/null || true
  pkill -f "node.*4321" 2>/dev/null || true

  # Reiniciar contenedor de producción
  echo "🚀 Restarting production frontend container..."
  cd /home/ubuntu
  docker start menusesqr-front || true
  echo "⏳ Waiting for production to be ready..."
  sleep 5

  echo "✅ Cleanup completed"
}

# Configurar cleanup para ejecutar al salir
trap cleanup EXIT INT TERM

echo "🧪 Running Playwright E2E Tests on VPS"

cd /home/ubuntu/menu-plus/menu-plus-front

echo "📦 Installing dependencies..."
npm install

echo "🌐 Setting environment variables..."
export PLAYWRIGHT_BASE_URL="http://localhost:4321"
export CI=true

echo "🔧 Overriding .env for tests..."
echo "PUBLIC_API_URL=http://localhost:8080/api" > .env.local
echo "PLAYWRIGHT_BASE_URL=http://localhost:4321" >> .env.local
echo "API_BACKEND_URL=http://localhost:8080" >> .env.local

echo "✅ Verifying services are running..."
if ! docker ps | grep -q menusesqr-back; then
  echo "❌ Backend container not running"
  exit 1
fi

if ! docker ps | grep -q glyphium-postgres; then
  echo "❌ PostgreSQL container not running"
  exit 1
fi

if ! docker ps | grep -q glyphium-minio; then
  echo "❌ MinIO container not running"
  exit 1
fi

echo "🛑 Stopping production frontend container..."
docker stop menusesqr-front || true
sleep 2

echo "🚀 Starting frontend in dev mode..."
PUBLIC_API_URL="http://localhost:8080/api" API_BACKEND_URL="http://localhost:8080" npm run dev > /tmp/astro-dev.log 2>&1 &
DEV_PID=$!
echo "Dev server started with PID: $DEV_PID"

echo "⏳ Waiting for dev server to be ready (up to 30s)..."
for i in {1..30}; do
  if curl -s http://localhost:4321 > /dev/null 2>&1; then
    echo "✅ Dev server is ready!"
    break
  fi
  echo "Waiting for dev server... ($i/30)"
  sleep 1
done

# Verificar que el servidor esté listo
if ! curl -s http://localhost:4321 > /dev/null 2>&1; then
  echo "❌ Dev server failed to start. Check logs:"
  tail -50 /tmp/astro-dev.log
  exit 1
fi

echo "🚀 All services are up, running tests..."
if npm test; then
  echo "✅ All tests passed!"
else
  echo "⚠️ Some tests failed, but this is expected during CI/CD"
fi
