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
