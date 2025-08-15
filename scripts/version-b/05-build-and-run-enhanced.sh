#!/bin/bash

# Version B - Step 5 Enhanced: Build and Run with Database Integration
# Final setup with production-ready configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 5: Enhanced Build & Run Configuration            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Install enhanced dependencies
echo -e "${YELLOW}Installing additional dependencies...${NC}"
npm install --save \
  @supabase/supabase-js \
  dotenv \
  compression \
  helmet \
  cors \
  express-rate-limit \
  glob

# Create enhanced server setup
echo -e "${YELLOW}Creating enhanced production server...${NC}"
cat > server/server-enhanced.js << 'EOF'
// Enhanced Production Server with Supabase Integration
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Load environment
dotenv.config()

// ESM directory helpers
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import our modules
import { ISREngine } from './isr/engine.js'
import { IsrMiddleware } from './isr/middleware.js'
import { dataProvider } from './data/provider.js'
import { getDataForRoute } from './data/context.js'
import { InvalidationHandler } from './data/invalidation.js'
import apiRouter from './api.js'

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

async function createServer() {
  const app = express()
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.SUPABASE_URL || 'https://*.supabase.co'],
      },
    },
  }))
  
  // Performance middleware
  app.use(compression())
  
  // CORS for API routes
  app.use('/api', cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  }))
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    skip: (req) => req.path.startsWith('/api/health')
  })
  app.use('/api', limiter)
  
  // Body parsing
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  
  // Initialize ISR engine
  const isrEngine = new ISREngine({
    cacheDir: process.env.CACHE_DIR || './cache',
    defaultTTL: parseInt(process.env.DEFAULT_TTL || '300'),
    maxWorkers: parseInt(process.env.MAX_WORKERS || '2')
  })
  
  // Store ISR engine for API access
  app.locals.isr = isrEngine
  
  // API routes
  app.use('/api', apiRouter)
  
  // Webhook endpoint for cache invalidation
  const invalidationHandler = new InvalidationHandler(isrEngine)
  app.post('/webhook/invalidate', (req, res) => {
    invalidationHandler.handleWebhook(req, res)
  })
  
  // Health check with detailed stats
  app.get('/health', async (req, res) => {
    const stats = await isrEngine.cache.stats()
    const dbStatus = dataProvider.supabase ? 'connected' : 'mock'
    
    res.json({
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: dbStatus,
      cache: {
        ...stats,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    })
  })
  
  // Static assets with caching
  app.use('/assets', express.static(path.join(__dirname, '../dist/client/assets'), {
    maxAge: '1y',
    immutable: true
  }))
  
  app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d'
  }))
  
  // Vite or production setup
  let vite
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite')
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: process.cwd()
    })
    app.use(vite.middlewares)
  }
  
  // ISR middleware for all routes
  const isrMiddleware = new IsrMiddleware(isrEngine)
  
  // Community routing support
  app.get('/:community?/*', async (req, res, next) => {
    const path = req.path
    const community = req.params.community
    
    // Check if first segment is a valid community
    if (community && !path.startsWith('/api') && !path.startsWith('/assets')) {
      const communities = ['downtown', 'northbeach', 'university'] // Or fetch from DB
      if (!communities.includes(community)) {
        // Not a community route, treat as regular route
        req.url = `/${community}${req.url.slice(community.length + 1)}`
        req.params.community = null
      }
    }
    
    next()
  })
  
  // Main SSR handler
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl
    
    try {
      // Try ISR cache first
      const cached = await isrMiddleware.handle(req, res, async () => {
        // SSR render function
        let template
        let render
        
        if (!isProduction) {
          template = fs.readFileSync(
            path.resolve(__dirname, '../index.html'),
            'utf-8'
          )
          template = await vite.transformIndexHtml(url, template)
          render = (await vite.ssrLoadModule('/src/entry/server.jsx')).render
        } else {
          template = fs.readFileSync(
            path.resolve(__dirname, '../dist/client/index.html'),
            'utf-8'
          )
          render = (await import('../dist/server/entry.server.js')).render
        }
        
        // Extract route params
        const params = {
          ...req.params,
          ...req.query,
          community: req.params.community || process.env.DEFAULT_COMMUNITY_ID
        }
        
        // Fetch data for route
        const data = await getDataForRoute(url, params)
        
        // Render app with data
        const { html: appHtml, css } = await render(url, data)
        
        // Inject rendered app and data
        const html = template
          .replace('<!--ssr-outlet-->', appHtml)
          .replace('<!--ssr-css-->', css ? `<style>${css}</style>` : '')
          .replace(
            '<!--ssr-data-->',
            `<script>window.__SSR_DATA__ = ${JSON.stringify(data)}</script>`
          )
        
        return html
      })
      
      if (cached) {
        res.status(200).set({ 'Content-Type': 'text/html' }).end(cached)
      }
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e)
      }
      console.error('SSR error:', e)
      
      // Fallback to client-side rendering
      if (isProduction) {
        const fallback = fs.readFileSync(
          path.resolve(__dirname, '../dist/client/index.html'),
          'utf-8'
        )
        res.status(500).set({ 'Content-Type': 'text/html' }).end(fallback)
      } else {
        res.status(500).end(e.message)
      }
    }
  })
  
  // Error handling
  app.use((err, req, res, next) => {
    console.error('Server error:', err)
    res.status(500).json({
      error: isProduction ? 'Internal server error' : err.message
    })
  })
  
  // Start server
  app.listen(port, () => {
    console.log(`
🚀 Enhanced ISR Server running at http://localhost:${port}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: ${dataProvider.supabase ? 'Supabase' : 'Mock data'}
💾 Cache directory: ${process.env.CACHE_DIR || './cache'}
⏱️  Default TTL: ${process.env.DEFAULT_TTL || '300'}s
🔄 Max workers: ${process.env.MAX_WORKERS || '2'}
${process.env.ENABLE_COMMUNITY_ROUTES ? '🏘️  Community routes: Enabled' : ''}
    `)
  })
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...')
    await isrEngine.shutdown()
    process.exit(0)
  })
}

createServer().catch(console.error)
EOF

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

# Create cache monitoring script
echo -e "${YELLOW}Creating cache monitoring script...${NC}"
cat > monitor-cache.sh << 'EOF'
#!/bin/bash

echo "📊 Cache Monitor"
echo "==============="

while true; do
  clear
  echo "📊 Cache Statistics - $(date)"
  echo "================================"
  
  # Show cache stats via API
  curl -s http://localhost:3000/api/health | jq '.cache'
  
  echo ""
  echo "📁 Cache Files:"
  echo "---------------"
  ls -la cache/*.json 2>/dev/null | tail -20 || echo "No cache files"
  
  echo ""
  echo "💾 Disk Usage: $(du -sh cache 2>/dev/null | cut -f1 || echo '0')"
  echo ""
  echo "Press Ctrl+C to exit"
  
  sleep 5
done
EOF

chmod +x monitor-cache.sh

# Create revalidation script
echo -e "${YELLOW}Creating revalidation script...${NC}"
cat > revalidate.sh << 'EOF'
#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <route>"
  echo "Example: $0 /article/my-article"
  exit 1
fi

echo "🔄 Revalidating: $1"

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d "{\"route\": \"$1\"}"

echo -e "\n✅ Revalidation triggered"
EOF

chmod +x revalidate.sh

# Create PM2 ecosystem file
echo -e "${YELLOW}Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'daynews-isr',
    script: './server/server-enhanced.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    restart_delay: 5000
  }]
}
EOF

# Create Docker files
echo -e "${YELLOW}Creating Docker configuration...${NC}"
cat > Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build:prod

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./
COPY --from=builder /app/node_modules ./node_modules

# Create cache directory
RUN mkdir -p cache

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3000

CMD ["node", "server/server-enhanced.js"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    volumes:
      - cache:/app/cache
      - logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  cache:
  logs:
EOF

# Create example webhook configuration
echo -e "${YELLOW}Creating webhook examples...${NC}"
cat > webhooks-example.md << 'EOF'
# Webhook Configuration Examples

## Supabase Database Webhooks

### 1. News Article Published
```sql
CREATE OR REPLACE FUNCTION notify_article_published()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    PERFORM pg_notify(
      'cache_invalidation',
      json_build_object(
        'type', 'news',
        'action', 'publish',
        'data', json_build_object(
          'slug', NEW.slug,
          'author_id', NEW.author_id,
          'community_id', NEW.community_id
        )
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_published_trigger
AFTER UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION notify_article_published();
```

### 2. Event Updated
```sql
CREATE OR REPLACE FUNCTION notify_event_updated()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'cache_invalidation',
    json_build_object(
      'type', 'event',
      'action', 'update',
      'data', json_build_object(
        'slug', NEW.slug,
        'community_id', NEW.community_id
      )
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_updated_trigger
AFTER UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION notify_event_updated();
```

### 3. New Review Posted
```sql
CREATE OR REPLACE FUNCTION notify_review_posted()
RETURNS trigger AS $$
DECLARE
  business_slug TEXT;
  community_id UUID;
BEGIN
  SELECT b.slug, b.community_id INTO business_slug, community_id
  FROM businesses b
  WHERE b.id = NEW.business_id;
  
  PERFORM pg_notify(
    'cache_invalidation',
    json_build_object(
      'type', 'business',
      'action', 'review',
      'data', json_build_object(
        'business_slug', business_slug,
        'community_id', community_id
      )
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_posted_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_review_posted();
```

## Supabase Edge Function

```typescript
// supabase/functions/cache-invalidation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { type, action, data } = await req.json()
  
  // Forward to your ISR server
  const response = await fetch('https://your-server.com/webhook/invalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': Deno.env.get('WEBHOOK_SECRET')
    },
    body: JSON.stringify({ type, action, data })
  })
  
  return new Response(
    JSON.stringify({ success: response.ok }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## Manual Invalidation Examples

```bash
# Invalidate news article
curl -X POST http://localhost:3000/webhook/invalidate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "news",
    "action": "publish",
    "data": {
      "slug": "breaking-news-2024",
      "community_id": "downtown"
    }
  }'

# Invalidate event
curl -X POST http://localhost:3000/webhook/invalidate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "action": "update",
    "data": {
      "slug": "summer-concert",
      "community_id": "downtown"
    }
  }'

# Invalidate business after review
curl -X POST http://localhost:3000/webhook/invalidate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "business",
    "action": "review",
    "data": {
      "business_slug": "joes-coffee",
      "community_id": "downtown"
    }
  }'
```
EOF

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
  'monitor': './monitor-cache.sh',
  'revalidate': './revalidate.sh',
  'pm2:start': 'pm2 start ecosystem.config.js',
  'pm2:stop': 'pm2 stop ecosystem.config.js',
  'pm2:logs': 'pm2 logs',
  'docker:build': 'docker build -t daynews-isr .',
  'docker:run': 'docker-compose up -d',
  'docker:logs': 'docker-compose logs -f'
};
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

echo -e "${GREEN}✅ Enhanced build and run setup complete!${NC}"
echo -e "${BLUE}Created:${NC}"
echo "   - Enhanced production server with Supabase"
echo "   - Build scripts (dev.sh, build-prod.sh)"
echo "   - Monitoring tools (monitor-cache.sh)"
echo "   - Deployment configs (PM2, Docker)"
echo "   - Webhook examples"
echo ""
echo -e "${BLUE}Features enabled:${NC}"
echo "   ✓ Multi-community routing"
echo "   ✓ Supabase data integration"
echo "   ✓ Cache invalidation webhooks"
echo "   ✓ Production security (helmet, CORS, rate limiting)"
echo "   ✓ Health monitoring endpoints"
echo "   ✓ Graceful shutdown"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Copy .env.example to .env and configure"
echo "2. Copy Magic Patterns components:"
echo "   ${YELLOW}cp -r ../magic/src/components/* src/components/${NC}"
echo "3. Start development:"
echo "   ${YELLOW}./dev.sh${NC}"
echo "4. Or build for production:"
echo "   ${YELLOW}./build-prod.sh${NC}"