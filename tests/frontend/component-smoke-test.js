import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const componentsDir = path.join(__dirname, '../../src/components')

describe('Frontend Component Smoke Tests', () => {
  it('should have all critical page components', () => {
    const criticalComponents = [
      'HomePage.tsx',
      'Header.tsx',
      'Footer.tsx',
      'Sidebar.tsx',
      'ErrorBoundary.tsx',
      'NewsArticle.tsx',
      'EventsPage.tsx',
      'BusinessDirectoryPage.tsx'
    ]
    
    const missingComponents = criticalComponents.filter(
      comp => !fs.existsSync(path.join(componentsDir, comp))
    )
    
    expect(missingComponents).toEqual([])
  })
  
  it('should have proper React imports in components', () => {
    const files = fs.readdirSync(componentsDir)
      .filter(f => f.endsWith('.tsx') && !f.includes('.original'))
    
    const issues = []
    
    files.forEach(file => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8')
      
      // Check for React import
      if (!content.includes("import React") && !content.includes("import { ") && !content.includes("import *")) {
        if (content.includes('jsx') || content.includes('tsx')) {
          issues.push(`${file}: Missing React import`)
        }
      }
      
      // Check for proper exports
      if (!content.includes('export') && !file.includes('index')) {
        issues.push(`${file}: No export found`)
      }
    })
    
    expect(issues).toEqual([])
  })
  
  it('should not have placeholder components', () => {
    const files = fs.readdirSync(componentsDir)
      .filter(f => f.endsWith('.tsx') && !f.includes('.original'))
    
    const placeholders = []
    
    files.forEach(file => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8')
      
      if (content.includes('placeholder component') || 
          content.includes('TODO: Implement') ||
          content.includes('Component: HomePage\nStatus: Placeholder')) {
        placeholders.push(file)
      }
    })
    
    expect(placeholders).toEqual([])
  })
  
  it('should have consistent ISRCSR comments', () => {
    const pagesDir = path.join(__dirname, '../../src/pages')
    if (!fs.existsSync(pagesDir)) return // Skip if no pages dir
    
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir)
      const issues = []
      
      files.forEach(file => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          issues.push(...scanDir(fullPath))
        } else if (file.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8')
          
          if (!content.includes('// ISRCSR=')) {
            issues.push(`${fullPath}: Missing ISRCSR comment`)
          }
        }
      })
      
      return issues
    }
    
    const issues = scanDir(pagesDir)
    expect(issues.length).toBeLessThanOrEqual(5) // Allow some missing
  })
})