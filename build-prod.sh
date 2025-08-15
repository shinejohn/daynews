#!/bin/bash
set -e

echo "🏗️  Building for production..."

# Clean previous builds
rm -rf dist

# Build client
echo "📦 Building client..."
npx vite build --outDir dist/client

# Build server
echo "📦 Building server..."
npx vite build --ssr src/entry/entry-server.tsx --outDir dist/server

# Copy server files
echo "📋 Copying server files..."
cp -r server dist/
cp package*.json dist/

# Create production env template
cat > dist/.env.production << EOL
# Production Environment
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cache Configuration  
CACHE_DIR=./cache
DEFAULT_TTL=300
MAX_WORKERS=4

# Features
ENABLE_COMMUNITY_ROUTES=true
ENABLE_SEARCH=true

# Security
ALLOWED_ORIGINS=https://yourdomain.com
SESSION_SECRET=your_session_secret
EOL

echo "✅ Production build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy dist/ to your server"
echo "2. Configure .env.production"
echo "3. Run: npm install --production"
echo "4. Run: node server/server-enhanced.js"
