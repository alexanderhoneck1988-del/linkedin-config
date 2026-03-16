#!/bin/bash

# LinkedIn Configurator - Vercel Deploy Script
# Verwendung: ./deploy.sh

set -e

echo "🚀 LinkedIn Audience Configurator - Deployment"
echo "================================================"

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
  echo "❌ Fehler: .env.local existiert nicht"
  echo "Bitte .env.local mit LinkedIn Credentials erstellen"
  exit 1
fi

# Installiere Dependencies
echo "📦 Installiere Dependencies..."
npm ci

# Prüfe TypeScript/Linting
echo "🔍 Prüfe Code..."
npm run lint 2>/dev/null || true

# Build testen
echo "🔨 Baue Projekt..."
npm run build

# Wenn alles erfolgreich -> Push zu Vercel
echo "✅ Build erfolgreich"
echo ""
echo "Vercel Deployment:"
echo "1. Verifiziere deine Vercel Credentials:"
echo "   vercel login"
echo ""
echo "2. Deploye das Projekt:"
echo "   vercel --prod"
echo ""
echo "3. Gehe zu Vercel Dashboard"
echo "   und setze die Environment Variables:"
echo "   - LINKEDIN_CLIENT_ID"
echo "   - LINKEDIN_CLIENT_SECRET"
echo "   - LINKEDIN_ACCESS_TOKEN"
echo "   - NEXT_PUBLIC_API_URL"
