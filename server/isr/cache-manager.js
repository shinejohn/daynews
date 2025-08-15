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
