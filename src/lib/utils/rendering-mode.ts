// Utility to determine rendering mode
export function isClientComponent(fileContent: string): boolean {
  return fileContent.includes("'use client'") || fileContent.includes('"use client"')
}

export function shouldHaveRevalidate(filePath: string): boolean {
  // Only server components can have revalidate
  const serverOnlyPaths = [
    '/api/',
    'layout.tsx',
    'loading.tsx',
    'error.tsx',
    'not-found.tsx'
  ]
  
  return !serverOnlyPaths.some(path => filePath.includes(path))
}
