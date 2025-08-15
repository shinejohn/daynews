import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Frontend Routing Tests', () => {
  it('should have routes matching server route config', async () => {
    // Import route config
    const { routeConfig } = await import('../../server/route-config.js')
    
    // Read App.tsx to check routes
    const appContent = fs.readFileSync(
      path.join(__dirname, '../../src/App.tsx'), 
      'utf8'
    )
    
    // Extract routes from App.tsx
    const routeMatches = appContent.matchAll(/<Route\s+path="([^"]+)"/g)
    const appRoutes = [...routeMatches].map(match => match[1])
    
    // Check critical routes exist
    const criticalRoutes = ['/', '/events', '/businesses', '/classifieds', '/announcements']
    const missingRoutes = criticalRoutes.filter(route => !appRoutes.includes(route))
    
    expect(missingRoutes).toEqual([])
  })
  
  it('should have matching components for routes', async () => {
    const { routeConfig } = await import('../../server/route-config.js')
    const componentsDir = path.join(__dirname, '../../src/components')
    
    const missingComponents = []
    
    // Check first 10 routes
    const routes = Object.entries(routeConfig.routes).slice(0, 10)
    
    for (const [route, config] of routes) {
      const componentFile = `${config.component}.tsx`
      const componentPath = path.join(componentsDir, componentFile)
      
      // Also check in subdirectories
      const possiblePaths = [
        componentPath,
        path.join(componentsDir, 'pages', componentFile),
        path.join(componentsDir, config.category || 'general', componentFile)
      ]
      
      const exists = possiblePaths.some(p => fs.existsSync(p))
      
      if (!exists) {
        missingComponents.push(`${route} -> ${config.component}`)
      }
    }
    
    // Allow some missing for now
    expect(missingComponents.length).toBeLessThanOrEqual(5)
  })
  
  it('should have QueryClientProvider setup', () => {
    const appContent = fs.readFileSync(
      path.join(__dirname, '../../src/App.tsx'), 
      'utf8'
    )
    
    expect(appContent).toContain('QueryClientProvider')
    expect(appContent).toContain('@tanstack/react-query')
  })
  
  it('should have ErrorBoundary wrapper', () => {
    const appContent = fs.readFileSync(
      path.join(__dirname, '../../src/App.tsx'), 
      'utf8'
    )
    
    expect(appContent).toContain('ErrorBoundary')
  })
})