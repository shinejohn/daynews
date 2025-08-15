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
