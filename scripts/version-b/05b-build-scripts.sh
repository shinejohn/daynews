#!/bin/bash

# Version B - Step 5b: Build Scripts
# Creates development and production build tools

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 5b: Build Scripts & Tools                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create production build script
echo -e "${YELLOW}Creating production build script...${NC}"
cat > build-prod.sh << 'EOF'
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
npx vite build --ssr src/entry/server.jsx --outDir dist/server

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
EOF

chmod +x build-prod.sh

# Create development script
echo -e "${YELLOW}Creating development script...${NC}"
cat > dev.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting development server..."

# Ensure cache directory exists
mkdir -p cache

# Check for .env
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  cp .env.example .env
  echo "⚠️  Please configure your .env file"
fi

# Start development server
node server/server-enhanced.js
EOF

chmod +x dev.sh

# Create quick start script
echo -e "${YELLOW}Creating quick start script...${NC}"
cat > quick-start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Quick Start - Version B ISR System"
echo "===================================="

# Check for Magic Patterns
if [ -z "$1" ]; then
  echo "❌ Please provide path to Magic Patterns"
  echo "Usage: $0 <path-to-magic-patterns>"
  exit 1
fi

MAGIC_DIR="$1"

# Copy components
echo "📋 Copying Magic Patterns components..."
if [ -d "$MAGIC_DIR/src/components" ]; then
  cp -r "$MAGIC_DIR/src/components/"* src/components/
  echo "✅ Components copied"
else
  echo "❌ Components directory not found at $MAGIC_DIR/src/components"
  exit 1
fi

# Setup environment
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env file - please configure it"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Extract metadata
echo "🔍 Extracting page metadata..."
node scripts/extract-metadata-enhanced.js "$MAGIC_DIR/src/components"

# Start dev server
echo "🚀 Starting development server..."
./dev.sh
EOF

chmod +x quick-start.sh

# Update package.json scripts
echo -e "${YELLOW}Updating package.json scripts...${NC}"
node -e "
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'dev': './dev.sh',
  'build': 'vite build',
  'build:prod': './build-prod.sh',
  'serve:ssr': 'node server/server-enhanced.js',
  'preview': 'vite preview',
  'quick-start': './quick-start.sh'
};
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

echo -e "${GREEN}✅ Build scripts created!${NC}"
echo ""
echo -e "${BLUE}Available scripts:${NC}"
echo "   ${YELLOW}./dev.sh${NC} - Start development server"
echo "   ${YELLOW}./build-prod.sh${NC} - Build for production"
echo "   ${YELLOW}./quick-start.sh <magic-patterns-dir>${NC} - Quick setup"
echo ""
echo -e "${BLUE}NPM scripts:${NC}"
echo "   ${YELLOW}npm run dev${NC}"
echo "   ${YELLOW}npm run build:prod${NC}"
echo "   ${YELLOW}npm run serve:ssr${NC}"
echo ""
echo -e "${BLUE}Next: Run ./05c-monitoring-tools.sh${NC}"