#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('🚀 Running deployment validation...\n')

const errors = []
const warnings = []

// 1. Check if App.tsx has proper export
console.log('1️⃣ Checking App.tsx export...')
try {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8')
  if (!appContent.includes('export function App') && !appContent.includes('export const App') && !appContent.includes('export default')) {
    errors.push('App.tsx must have an export (either named or default)')
  }
  
  // Check imports in entry files
  const entryClient = fs.readFileSync('src/entry/entry-client.tsx', 'utf8')
  const entryServer = fs.readFileSync('src/entry/entry-server.tsx', 'utf8')
  
  const hasNamedExport = appContent.includes('export function App') || appContent.includes('export const App')
  const hasDefaultExport = appContent.includes('export default')
  
  if (hasNamedExport) {
    if (!entryClient.includes('import { App }')) {
      errors.push('entry-client.tsx should use named import: import { App } from "../App"')
    }
    if (!entryServer.includes('import { App }')) {
      errors.push('entry-server.tsx should use named import: import { App } from "../App"')
    }
  } else if (hasDefaultExport) {
    if (!entryClient.includes('import App from')) {
      errors.push('entry-client.tsx should use default import: import App from "../App"')
    }
    if (!entryServer.includes('import App from')) {
      errors.push('entry-server.tsx should use default import: import App from "../App"')
    }
  }
  console.log('✅ App export checks complete')
} catch (err) {
  errors.push(`Failed to check App.tsx: ${err.message}`)
}

// 2. Check route config syntax
console.log('\n2️⃣ Checking route config syntax...')
try {
  const routeConfig = fs.readFileSync('server/route-config.js', 'utf8')
  
  // Check for common syntax errors
  if (routeConfig.includes(': :')) {
    errors.push('route-config.js has invalid syntax ": :" - should be ": ["')
  }
  if (routeConfig.includes('",\n  ,')) {
    errors.push('route-config.js has trailing comma issues')
  }
  if (routeConfig.includes('for (const :')) {
    errors.push('route-config.js has invalid for loop syntax')
  }
  
  // Try to actually parse it
  try {
    await import('../server/route-config.js')
    console.log('✅ Route config syntax valid')
  } catch (parseErr) {
    errors.push(`Route config has syntax error: ${parseErr.message}`)
  }
} catch (err) {
  errors.push(`Failed to check route config: ${err.message}`)
}

// 3. Check CSS imports order
console.log('\n3️⃣ Checking CSS import order...')
try {
  const indexCss = fs.readFileSync('src/index.css', 'utf8')
  const lines = indexCss.split('\n')
  
  let foundTailwind = false
  let foundImportAfterTailwind = false
  
  for (const line of lines) {
    if (line.includes('@tailwind')) {
      foundTailwind = true
    }
    if (foundTailwind && line.startsWith('@import') && !line.includes('@tailwind')) {
      warnings.push('CSS @import statements should come before @tailwind directives')
      break
    }
  }
  console.log('✅ CSS structure checked')
} catch (err) {
  warnings.push(`Failed to check CSS: ${err.message}`)
}

// 4. Check TypeScript configuration
console.log('\n4️⃣ Checking TypeScript configuration...')
try {
  if (!fs.existsSync('tsconfig.json')) {
    errors.push('Missing tsconfig.json')
  } else {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
    if (!tsconfig.compilerOptions?.jsx) {
      errors.push('tsconfig.json missing jsx configuration')
    }
    console.log('✅ TypeScript config valid')
  }
} catch (err) {
  errors.push(`Failed to check TypeScript config: ${err.message}`)
}

// 5. Check dependencies
console.log('\n5️⃣ Checking dependencies...')
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    '@tanstack/react-query',
    'tailwindcss',
    'vite',
    '@vitejs/plugin-react'
  ]
  
  const allDeps = {...(pkg.dependencies || {}), ...(pkg.devDependencies || {})}
  const missingDeps = requiredDeps.filter(dep => !allDeps[dep])
  
  if (missingDeps.length > 0) {
    errors.push(`Missing required dependencies: ${missingDeps.join(', ')}`)
  } else {
    console.log('✅ All required dependencies present')
  }
} catch (err) {
  errors.push(`Failed to check dependencies: ${err.message}`)
}

// 6. Run build test
console.log('\n6️⃣ Testing build...')
try {
  console.log('Running: npm run build')
  execSync('npm run build', { stdio: 'pipe' })
  console.log('✅ Build successful')
} catch (err) {
  errors.push('Build failed - check build output above')
}

// 7. Check for common Vercel issues
console.log('\n7️⃣ Checking Vercel compatibility...')
try {
  // Check if we're not mixing Next.js and Vite
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (pkg.dependencies?.next && pkg.scripts?.build?.includes('vite')) {
    warnings.push('Mixed Next.js and Vite setup detected - ensure Vercel uses correct build command')
  }
  
  // Check build output directory
  if (!fs.existsSync('dist')) {
    warnings.push('No dist folder found after build - Vercel may not find output')
  }
  
  console.log('✅ Vercel checks complete')
} catch (err) {
  warnings.push(`Vercel check failed: ${err.message}`)
}

// Report results
console.log('\n' + '='.repeat(50))
console.log('📊 VALIDATION RESULTS')
console.log('='.repeat(50))

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All checks passed! Ready for deployment.')
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS (must fix):')
    errors.forEach(err => console.log(`   • ${err}`))
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should review):')
    warnings.forEach(warn => console.log(`   • ${warn}`))
  }
  
  if (errors.length > 0) {
    console.log('\n🚫 Deployment will likely fail. Fix errors before pushing.')
    process.exit(1)
  }
}

console.log('\n💡 Run this script before pushing to catch deployment issues early!')