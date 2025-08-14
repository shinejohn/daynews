const fs = require('fs');
const path = require('path');

console.log('📖 Updating routes based on component rendering strategies...\n');

// Get all route pages
const routes = [];
function findRoutes(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      findRoutes(fullPath);
    } else if (file === 'page.tsx') {
      routes.push(fullPath);
    }
  });
}

findRoutes('src/app');

let updatedSSR = 0;
let updatedCSR = 0;
let errors = 0;

routes.forEach(routePath => {
  try {
    // Skip the main layout
    if (routePath.includes('layout.tsx')) return;
    
    // Read current page content
    const pageContent = fs.readFileSync(routePath, 'utf8');
    
    // Extract component import
    const importMatch = pageContent.match(/import\s*{\s*(\w+)\s*}\s*from\s*['"]@\/components\/(.+)['"]/);
    
    if (!importMatch) {
      console.log(`⚠️  No component import in ${routePath}`);
      return;
    }
    
    const componentName = importMatch[1];
    const componentPath = importMatch[2];
    
    // Read the component file to get rendering strategy
    const fullComponentPath = `src/components/${componentPath}.tsx`;
    
    if (!fs.existsSync(fullComponentPath)) {
      console.log(`⚠️  Component not found: ${fullComponentPath}`);
      return;
    }
    
    const componentContent = fs.readFileSync(fullComponentPath, 'utf8');
    
    // Extract rendering strategy
    const renderingMatch = componentContent.match(/\/\/\s*ssr-csr=(\w+)/);
    
    if (!renderingMatch) {
      console.log(`❓ No rendering hint in ${componentName}`);
      return;
    }
    
    const renderingType = renderingMatch[1];
    
    // Generate new page content
    let newPageContent;
    
    if (renderingType === 'csr') {
      // Client component
      newPageContent = `'use client'

import { ${componentName} } from '@/components/${componentPath}'

export default function Page() {
  return <${componentName} />
}
`;
      console.log(`🔄 ${routePath} -> CLIENT`);
      updatedCSR++;
      
    } else {
      // Server component
      const isDynamic = routePath.includes('[');
      
      if (isDynamic) {
        // Extract param name
        const paramMatch = routePath.match(/\[(\w+)\]/);
        const paramName = paramMatch ? paramMatch[1] : 'id';
        
        newPageContent = `import { ${componentName} } from '@/components/${componentPath}'

export default function Page({ params }: { params: { ${paramName}: string } }) {
  return <${componentName} />
}
`;
      } else {
        newPageContent = `import { ${componentName} } from '@/components/${componentPath}'

export default function Page() {
  return <${componentName} />
}
`;
      }
      console.log(`📄 ${routePath} -> SERVER`);
      updatedSSR++;
    }
    
    // Write updated page
    fs.writeFileSync(routePath, newPageContent);
    
  } catch (error) {
    console.error(`❌ Error processing ${routePath}:`, error.message);
    errors++;
  }
});

console.log(`\n✅ Route Update Summary:`);
console.log(`   SSR routes: ${updatedSSR}`);
console.log(`   CSR routes: ${updatedCSR}`);
console.log(`   Errors: ${errors}`);
console.log(`   Total routes: ${routes.length}`);

// Create a rendering report
const report = `# Route Rendering Report

Generated: ${new Date().toISOString()}

## Summary
- Total routes: ${routes.length}
- SSR routes: ${updatedSSR}
- CSR routes: ${updatedCSR}
- Errors: ${errors}

## Routes by Type

### SSR Routes (Good for SEO)
${routes.filter(r => {
  try {
    const content = fs.readFileSync(r, 'utf8');
    return !content.includes("'use client'");
  } catch {
    return false;
  }
}).map(r => `- ${r.replace('src/app/', '/').replace('/page.tsx', '')}`).join('\n')}

### CSR Routes (Interactive)
${routes.filter(r => {
  try {
    const content = fs.readFileSync(r, 'utf8');
    return content.includes("'use client'");
  } catch {
    return false;
  }
}).map(r => `- ${r.replace('src/app/', '/').replace('/page.tsx', '')}`).join('\n')}
`;

fs.writeFileSync('ROUTE_RENDERING_REPORT.md', report);
console.log('\n📊 Report saved to ROUTE_RENDERING_REPORT.md');
