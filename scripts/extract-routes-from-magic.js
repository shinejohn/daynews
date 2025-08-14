#!/usr/bin/env node

/**
 * Extract routes from Magic Patterns App.tsx
 */

const fs = require('fs');
const path = require('path');

const MAGIC_APP_PATH = '/Users/johnshine/Dropbox/Fibonacco/Day-News/Code/magic/src/App.tsx';

// Read App.tsx
const appContent = fs.readFileSync(MAGIC_APP_PATH, 'utf8');

// Extract route information using regex
const routeRegex = /<Route\s+path="([^"]+)"\s+element={<(\w+)[^>]*\/?>}/g;
const routes = [];

let match;
while ((match = routeRegex.exec(appContent)) !== null) {
  const [_, path, component] = match;
  
  // Convert path to Next.js format
  let nextPath = path;
  if (path.includes(':')) {
    // Convert :param to [param]
    nextPath = path.replace(/:(\w+)/g, '[$1]');
  }
  
  routes.push({
    path: path,
    nextPath: nextPath,
    component: component,
    file: `src/app${nextPath === '/' ? '' : nextPath}/page.tsx`
  });
}

// Create route mapping
const routeMapping = {
  routes: routes,
  totalRoutes: routes.length,
  generated: new Date().toISOString()
};

// Write route mapping
fs.writeFileSync('./route-mapping.json', JSON.stringify(routeMapping, null, 2));

console.log(`✓ Extracted ${routes.length} routes from Magic Patterns`);
console.log('✓ Created route-mapping.json');

// Also create a simple list for reference
const routeList = routes.map(r => `${r.path} → ${r.nextPath} (${r.component})`).join('\n');
fs.writeFileSync('./route-list.txt', routeList);

console.log('✓ Created route-list.txt');