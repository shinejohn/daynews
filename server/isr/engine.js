// ISR Engine - Main orchestrator for ISR functionality
import { CacheManager } from './cache-manager.js'
import { RevalidationQueue } from './revalidation-queue.js'

export class ISREngine {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || './cache'
    this.defaultTTL = options.defaultTTL || 300
    this.maxWorkers = options.maxWorkers || 2
    
    // Initialize components
    this.cache = new CacheManager(this.cacheDir)
    this.queue = new RevalidationQueue(this.maxWorkers)
    
    // Start periodic cache cleanup
    this.startCacheCleanup()
  }
  
  startCacheCleanup() {
    // Run cache cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cache.purgeExpired().catch(err => {
        console.error('Cache cleanup error:', err)
      })
    }, 60000)
  }
  
  async revalidate(route) {
    return this.queue.add(route)
  }
  
  async shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    await this.queue.shutdown()
  }
}