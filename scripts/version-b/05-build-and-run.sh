#!/bin/bash

# Version B - Step 5: Build and Run
# Final setup and launch script

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 5: Building and Running ISR Server               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create final server file that combines everything
echo -e "${YELLOW}Creating final server configuration...${NC}"
cat > server/index.js << 'EOF'
import express from 'express'
import { ISRMiddleware } from './isr/isr-middleware.js'
import apiRouter from './api.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

// Body parser for API
app.use(express.json())

// Initialize ISR
const isr = new ISRMiddleware({
  cacheDir: './cache',
  defaultTTL: 300,
  maxWorkers: 2
})

// Serve static files in production
if (isProduction) {
  app.use(express.static('dist/client'))
}

// API routes
app.use('/api', apiRouter)

// Revalidation endpoint
app.post('/api/revalidate', async (req, res) => {
  const { route, routes } = req.body
  
  if (routes && Array.isArray(routes)) {
    // Batch revalidation
    const results = await Promise.all(
      routes.map(r => isr.revalidate(r))
    )
    return res.json({ revalidating: true, routes: results })
  }
  
  if (!route) {
    return res.status(400).json({ error: 'Route is required' })
  }
  
  const result = await isr.revalidate(route)
  res.json(result)
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    cache: isr.cache.stats(),
    queue: isr.queue.size()
  })
})

// ISR middleware for all other routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next()
  }
  
  isr.handle(req, res, next)
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).send(isProduction ? 'Internal Server Error' : err.stack)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`
  ${isProduction ? '🚀 Production' : '🔧 Development'} ISR Server
  
  🌐 Server:     http://localhost:${port}
  📊 Health:     http://localhost:${port}/api/health
  🔄 Revalidate: POST http://localhost:${port}/api/revalidate
  
  Cache Status:
  - Directory: ./cache
  - ISR Pages: Check route-config.json
  `)
})
EOF

# Add cache stats method to cache manager
echo -e "${YELLOW}Adding cache statistics...${NC}"
cat >> server/isr/cache-manager.js << 'EOF'

// Add stats method
CacheManager.prototype.stats = async function() {
  try {
    const files = await fs.readdir(this.cacheDir)
    const cacheFiles = files.filter(f => f.endsWith('.json'))
    
    let totalSize = 0
    let staleCount = 0
    
    for (const file of cacheFiles) {
      const filePath = path.join(this.cacheDir, file)
      const stat = await fs.stat(filePath)
      totalSize += stat.size
      
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
      if (this.isStale(data)) staleCount++
    }
    
    return {
      entries: cacheFiles.length,
      stale: staleCount,
      fresh: cacheFiles.length - staleCount,
      size: `${(totalSize / 1024).toFixed(2)} KB`
    }
  } catch (err) {
    return { error: err.message }
  }
}
EOF

# Create development script
echo -e "${YELLOW}Creating development scripts...${NC}"
cat > dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Version B Development Server..."

# Check if Magic Patterns directory exists
if [ ! -d "../magic" ]; then
  echo "⚠️  Warning: Magic Patterns directory not found at ../magic"
  echo "   Update MAGIC_PATTERNS_DIR in your environment"
fi

# Extract metadata
echo "📝 Extracting page metadata..."
./scripts/version-b/03-extract-page-metadata.sh

# Start development server
echo "🔧 Starting dev server..."
npm run dev:ssr
EOF
chmod +x dev.sh

# Create production build script
echo -e "${YELLOW}Creating production build script...${NC}"
cat > build-prod.sh << 'EOF'
#!/bin/bash

echo "📦 Building for production..."

# Clean previous builds
rm -rf dist cache

# Extract metadata
echo "📝 Extracting page metadata..."
./scripts/version-b/03-extract-page-metadata.sh

# Build client and server
echo "🔨 Building client..."
npm run build:client

echo "🔨 Building server..."
npm run build:server

echo "✅ Production build complete!"
echo "   Run 'npm run serve:ssr' to start production server"
EOF
chmod +x build-prod.sh

# Create revalidation helper script
echo -e "${YELLOW}Creating revalidation helper...${NC}"
cat > revalidate.sh << 'EOF'
#!/bin/bash

# Helper script to trigger revalidation

if [ -z "$1" ]; then
  echo "Usage: ./revalidate.sh <route>"
  echo "Example: ./revalidate.sh /article/my-article"
  exit 1
fi

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d "{\"route\": \"$1\"}"

echo ""
EOF
chmod +x revalidate.sh

# Create monitoring script
echo -e "${YELLOW}Creating cache monitor...${NC}"
cat > monitor-cache.sh << 'EOF'
#!/bin/bash

# Monitor cache status

while true; do
  clear
  echo "📊 ISR Cache Monitor"
  echo "==================="
  echo ""
  
  # Get cache stats
  curl -s http://localhost:3000/api/health | jq .
  
  echo ""
  echo "📁 Cache files:"
  ls -la cache/*.json 2>/dev/null | tail -5
  
  echo ""
  echo "Press Ctrl+C to exit"
  sleep 5
done
EOF
chmod +x monitor-cache.sh

# Final instructions
echo -e "\n${GREEN}✅ Version B setup complete!${NC}"
echo -e "\n${BLUE}📚 Quick Start Guide:${NC}"
echo -e "
${YELLOW}Development:${NC}
  ./dev.sh                    # Start dev server with HMR

${YELLOW}Production:${NC}
  ./build-prod.sh             # Build for production
  NODE_ENV=production npm run serve:ssr  # Run production server

${YELLOW}Cache Management:${NC}
  ./revalidate.sh /          # Revalidate homepage
  ./revalidate.sh /article/slug  # Revalidate specific page
  ./monitor-cache.sh         # Monitor cache in real-time

${YELLOW}Configuration:${NC}
  route-config.json          # View all routes and TTLs
  .env                       # Add Supabase credentials

${YELLOW}API Endpoints:${NC}
  GET  /api/articles         # Fetch articles
  GET  /api/events          # Fetch events
  POST /api/revalidate      # Trigger revalidation
  GET  /api/health          # Check server health
"

echo -e "${GREEN}🎉 Ready to go! Run ${YELLOW}./dev.sh${GREEN} to start developing.${NC}"