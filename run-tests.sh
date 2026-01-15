#!/bin/bash
set -e

echo "🧪 Running Playwright E2E Tests on VPS"

cd /home/ubuntu/menu-plus/menu-plus-front

echo "📦 Installing dependencies..."
npm install

echo "🌐 Setting environment variables..."
export PUBLIC_API_URL="http://localhost:8080/api"
export PLAYWRIGHT_BASE_URL="http://localhost:4321"
export CI=true

echo "✅ Verifying services are running..."
if ! docker ps | grep -q menusesqr-front; then
  echo "❌ Frontend container not running"
  exit 1
fi

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

echo "🚀 All services are up, running tests..."
npm test

echo "✅ All tests passed!"
