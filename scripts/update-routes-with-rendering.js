const fs = require('fs');
const path = require('path');

console.log('📖 Reading rendering strategy from components...\n');

// Get all route pages
const routes = fs.readdirSync('src/app', { recursive: true })
  .filter(file => file.endsWith('page.tsx'))
  .map(file => `src/app/${file}`);

let updated = 0;
let errors = 0;

routes.forEach(routePath => {
  try {
    // Read the current page content
    const pageContent = fs.readFileSync(routePath, 'utf8');
    
    // Extract the component import
    const importMatch = pageContent.match(/import\s*{\s*(\w+)\s*}\s*from\s*['"]@\/components\/(.+)['"]/);
    
    if (!importMatch) {
      console.log(`⚠️  No component import found in ${routePath}`);
      return;
    }
    
    const componentName = importMatch[1];
    const componentPath = importMatch[2];
    
    // Read the actual component file
    const fullComponentPath = `src/components/${componentPath}.tsx`;
    
    if (!fs.existsSync(fullComponentPath)) {
      console.log(`⚠️  Component file not found: ${fullComponentPath}`);
      return;
    }
    
    const componentContent = fs.readFileSync(fullComponentPath, 'utf8');
    
    // Look for the csr-ssr variable or comment
    // Try different patterns
    const patterns = [
      /csr-ssr\s*[:=]\s*['"](\w+)['"]/,  // csr-ssr: "client" or csr-ssr = "server"
      /\/\/\s*csr-ssr\s*[:=]\s*(\w+)/,    // // csr-ssr: client
      /\/\*\s*csr-ssr\s*[:=]\s*(\w+)\s*\*\//,  // /* csr-ssr: server */
      /@csr-ssr\s+(\w+)/                   // @csr-ssr client
    ];
    
    let renderingType = null;
    for (const pattern of patterns) {
      const match = componentContent.match(pattern);
      if (match) {
        renderingType = match[1].toLowerCase();
        break;
      }
    }
    
    if (!renderingType) {
      console.log(`❓ No csr-ssr found in ${componentName}, defaulting to SSR`);
      renderingType = 'server';
    }
    
    // Update the page based on rendering type
    let newPageContent;
    
    if (renderingType === 'client' || renderingType === 'csr') {
      // Make it a client component
      newPageContent = `'use client'

import { ${componentName} } from '@/components/${componentPath}'

export default function Page() {
  return <${componentName} />
}
`;
      console.log(`🔄 ${routePath} -> CLIENT (from ${componentName})`);
      
    } else {
      // Server component (can be async for data fetching)
      const isDynamic = routePath.includes('[');
      
      if (isDynamic) {
        // Dynamic routes need params
        const paramMatch = routePath.match(/\[(\w+)\]/);
        const paramName = paramMatch ? paramMatch[1] : 'id';
        
        newPageContent = `import { ${componentName} } from '@/components/${componentPath}'

export default async function Page({ params }: { params: { ${paramName}: string } }) {
  // TODO: Fetch data based on params.${paramName}
  
  return <${componentName} />
}
`;
      } else {
        // Static server route
        newPageContent = `import { ${componentName} } from '@/components/${componentPath}'

export default async function Page() {
  // TODO: Add server-side data fetching here if needed
  
  return <${componentName} />
}
`;
      }
      console.log(`📄 ${routePath} -> SERVER (from ${componentName})`);
    }
    
    // Write the updated page
    fs.writeFileSync(routePath, newPageContent);
    updated++;
    
  } catch (error) {
    console.error(`❌ Error processing ${routePath}:`, error.message);
    errors++;
  }
});

console.log(`\n✅ Updated ${updated} routes`);
console.log(`❌ ${errors} errors`);

// Generate a summary report
const report = `# Route Rendering Strategy Report

Generated: ${new Date().toISOString()}

## Summary
- Total routes: ${routes.length}
- Updated: ${updated}
- Errors: ${errors}

## Next Steps
1. Check each component for the csr-ssr comment
2. Add server-side data fetching to SSR pages
3. Add proper loading and error states
`;

fs.writeFileSync('RENDERING_STRATEGY.md', report);
console.log('\n📊 Report saved to RENDERING_STRATEGY.md');
