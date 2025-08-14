#!/usr/bin/env node

/**
 * Create all Next.js routes based on route-mapping.json
 */

const fs = require('fs');
const path = require('path');

// Read route mapping
const routeMapping = JSON.parse(fs.readFileSync('./route-mapping.json', 'utf8'));

console.log(`Creating ${routeMapping.routes.length} routes...`);

// Helper to create directory recursively
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Template for page.tsx files
function createPageContent(component, routePath) {
  // Skip catch-all and special routes
  if (routePath === '*' || routePath.includes('*')) {
    return null;
  }

  return `// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import ${component} from '@/components/${component}';

export default function Page() {
  return <${component} />;
}
`;
}

// Process each route
let created = 0;
let skipped = 0;

routeMapping.routes.forEach(route => {
  const { path: routePath, component, file } = route;
  
  // Skip catch-all routes and editor (special handling needed)
  if (routePath === '*' || routePath.includes('*') || routePath.includes('editor')) {
    skipped++;
    return;
  }
  
  // Create the page content
  const content = createPageContent(component, routePath);
  
  if (content) {
    ensureDir(file);
    fs.writeFileSync(file, content);
    created++;
    console.log(`✓ Created ${file}`);
  }
});

console.log(`\n✅ Created ${created} routes`);
console.log(`⏭️  Skipped ${skipped} special routes`);

// Create a special not-found.tsx for catch-all
const notFoundContent = `export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/not-found.tsx', notFoundContent);
console.log('✓ Created not-found.tsx');