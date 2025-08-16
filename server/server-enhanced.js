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
import { ISRMiddleware } from './isr/isr-middleware.js'
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
  
  // Health check for Railway
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      cache: isrEngine.cache.stats(),
      uptime: process.uptime()
    })
  })
  
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
  const isrMiddleware = new ISRMiddleware(isrEngine)
  
  // Community routing support
  app.use(async (req, res, next) => {
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
  app.use(async (req, res, next) => {
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
  app.listen(port, '0.0.0.0', () => {
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
