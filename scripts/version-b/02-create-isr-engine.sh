#!/bin/bash

# Version B - Step 2: Create ISR Engine
# Custom ISR implementation with file-based caching

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 2: Creating Custom ISR Engine                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create ISR directory
echo -e "${YELLOW}Creating ISR engine structure...${NC}"
mkdir -p server/isr

# Create cache manager
echo -e "${YELLOW}Creating cache manager...${NC}"
cat > server/isr/cache-manager.js << 'EOF'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export class CacheManager {
  constructor(cacheDir = './cache') {
    this.cacheDir = cacheDir
    this.init()
  }

  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true })
    } catch (err) {
      console.error('Failed to create cache directory:', err)
    }
  }

  getCacheKey(route) {
    // Convert route to safe filename
    return crypto.createHash('md5').update(route).digest('hex')
  }

  getCachePath(route) {
    const key = this.getCacheKey(route)
    return path.join(this.cacheDir, `${key}.json`)
  }

  async get(route) {
    try {
      const cachePath = this.getCachePath(route)
      const data = await fs.readFile(cachePath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      return null
    }
  }

  async set(route, data, ttl = 300) {
    const cachePath = this.getCachePath(route)
    const cacheData = {
      route,
      html: data.html,
      context: data.context,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      expiresAt: Date.now() + (ttl * 1000)
    }
    
    await fs.writeFile(cachePath, JSON.stringify(cacheData))
    return cacheData
  }

  async delete(route) {
    try {
      const cachePath = this.getCachePath(route)
      await fs.unlink(cachePath)
      return true
    } catch (err) {
      return false
    }
  }

  isStale(cacheData) {
    if (!cacheData) return true
    return Date.now() > cacheData.expiresAt
  }

  async purgeExpired() {
    try {
      const files = await fs.readdir(this.cacheDir)
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        
        const filePath = path.join(this.cacheDir, file)
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
        
        if (this.isStale(data)) {
          await fs.unlink(filePath)
        }
      }
    } catch (err) {
      console.error('Error purging cache:', err)
    }
  }
}
EOF

# Create revalidation queue
echo -e "${YELLOW}Creating revalidation queue...${NC}"
cat > server/isr/revalidation-queue.js << 'EOF'
import { Worker } from 'worker_threads'
import { EventEmitter } from 'events'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class RevalidationQueue extends EventEmitter {
  constructor(maxWorkers = 2) {
    super()
    this.queue = []
    this.workers = []
    this.maxWorkers = maxWorkers
    this.processing = new Set()
  }

  add(route, priority = 'normal') {
    // Avoid duplicate entries
    if (this.processing.has(route)) return
    
    const job = { route, priority, timestamp: Date.now() }
    
    if (priority === 'high') {
      this.queue.unshift(job)
    } else {
      this.queue.push(job)
    }
    
    this.process()
  }

  async process() {
    if (this.workers.length >= this.maxWorkers || this.queue.length === 0) {
      return
    }

    const job = this.queue.shift()
    if (!job) return

    this.processing.add(job.route)

    const worker = new Worker(
      path.join(__dirname, 'revalidation-worker.js'),
      { workerData: job }
    )

    this.workers.push(worker)

    worker.on('message', (result) => {
      this.emit('revalidated', result)
      this.processing.delete(job.route)
    })

    worker.on('error', (err) => {
      console.error('Worker error:', err)
      this.emit('error', { route: job.route, error: err })
      this.processing.delete(job.route)
    })

    worker.on('exit', () => {
      this.workers = this.workers.filter(w => w !== worker)
      this.process() // Process next item
    })
  }

  clear() {
    this.queue = []
  }

  size() {
    return this.queue.length
  }
}
EOF

# Create revalidation worker
echo -e "${YELLOW}Creating revalidation worker...${NC}"
cat > server/isr/revalidation-worker.js << 'EOF'
import { parentPort, workerData } from 'worker_threads'
import { renderRoute } from '../render.js'
import { CacheManager } from './cache-manager.js'

async function revalidate() {
  const { route } = workerData
  const cache = new CacheManager()
  
  try {
    console.log(`[Worker] Revalidating: ${route}`)
    
    // Render the route
    const result = await renderRoute(route)
    
    // Cache the result
    await cache.set(route, result)
    
    parentPort.postMessage({
      success: true,
      route,
      timestamp: Date.now()
    })
  } catch (error) {
    parentPort.postMessage({
      success: false,
      route,
      error: error.message
    })
  }
}

revalidate()
EOF

# Create ISR middleware
echo -e "${YELLOW}Creating ISR middleware...${NC}"
cat > server/isr/isr-middleware.js << 'EOF'
import { CacheManager } from './cache-manager.js'
import { RevalidationQueue } from './revalidation-queue.js'
import { renderRoute } from '../render.js'

export class ISRMiddleware {
  constructor(options = {}) {
    this.cache = new CacheManager(options.cacheDir)
    this.queue = new RevalidationQueue(options.maxWorkers || 2)
    this.defaultTTL = options.defaultTTL || 300 // 5 minutes
    
    // Listen for revalidation events
    this.queue.on('revalidated', (result) => {
      console.log(`✓ Revalidated: ${result.route}`)
    })
    
    // Purge expired cache periodically
    setInterval(() => {
      this.cache.purgeExpired()
    }, 60000) // Every minute
  }

  async handle(req, res, next) {
    const route = req.path
    
    // Check cache
    const cached = await this.cache.get(route)
    
    if (cached && !this.cache.isStale(cached)) {
      // Serve fresh cache
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('X-Cache-Age', Date.now() - cached.timestamp)
      return this.sendCachedResponse(res, cached)
    }
    
    if (cached && this.cache.isStale(cached)) {
      // Stale-while-revalidate
      this.queue.add(route)
      res.setHeader('X-Cache', 'STALE')
      return this.sendCachedResponse(res, cached)
    }
    
    // No cache - render and cache
    try {
      const result = await renderRoute(route)
      const ttl = this.getTTLForRoute(route)
      
      await this.cache.set(route, result, ttl)
      
      res.setHeader('X-Cache', 'MISS')
      this.sendResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  getTTLForRoute(route) {
    // Extract TTL from page comment if available
    // Otherwise use defaults based on route pattern
    
    if (route === '/' || route.includes('/news')) {
      return 300 // 5 minutes for news
    }
    
    if (route.includes('/about') || route.includes('/contact')) {
      return 86400 // 24 hours for static pages
    }
    
    return this.defaultTTL
  }

  sendCachedResponse(res, cached) {
    res.status(200).set({ 
      'Content-Type': 'text/html',
      'Last-Modified': new Date(cached.timestamp).toUTCString()
    }).end(cached.html)
  }

  sendResponse(res, result) {
    res.status(200).set({ 
      'Content-Type': 'text/html'
    }).end(result.html)
  }

  async revalidate(route) {
    await this.cache.delete(route)
    this.queue.add(route, 'high')
    return { revalidating: true, route }
  }
}
EOF

# Create render function that will be used by ISR
echo -e "${YELLOW}Creating render function...${NC}"
cat > server/render.js << 'EOF'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

let vite
if (!isProduction) {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })
}

export async function renderRoute(route) {
  let template, render
  
  if (!isProduction) {
    template = fs.readFileSync(
      path.resolve(__dirname, '../index.html'),
      'utf-8'
    )
    template = await vite.transformIndexHtml(route, template)
    render = (await vite.ssrLoadModule('/src/entry/entry-server.jsx')).render
  } else {
    template = fs.readFileSync(
      path.resolve(__dirname, '../dist/client/index.html'),
      'utf-8'
    )
    render = (await import('../dist/server/entry-server.js')).render
  }
  
  // Render the app
  const { html, context } = render(route)
  
  // Replace placeholders
  const finalHtml = template
    .replace('<!--ssr-html-->', html)
    .replace('<!--ssr-title-->', context.title || 'DayNews')
    .replace('<!--ssr-description-->', context.description || '')
    .replace('<!--ssr-data-->', JSON.stringify(context))
  
  return { html: finalHtml, context }
}
EOF

# Update server to use ISR
echo -e "${YELLOW}Updating server to use ISR...${NC}"
cat > server/index-isr.js << 'EOF'
import express from 'express'
import { ISRMiddleware } from './isr/isr-middleware.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

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

// API endpoint for on-demand revalidation
app.post('/api/revalidate', express.json(), async (req, res) => {
  const { route } = req.body
  
  if (!route) {
    return res.status(400).json({ error: 'Route is required' })
  }
  
  const result = await isr.revalidate(route)
  res.json(result)
})

// ISR middleware for all routes
app.get('*', (req, res, next) => isr.handle(req, res, next))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`ISR Server running at http://localhost:${port}`)
})
EOF

echo -e "${GREEN}✅ ISR Engine created!${NC}"
echo -e "${BLUE}Next: Run ./03-extract-page-metadata.sh${NC}"