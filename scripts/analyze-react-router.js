#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Analyze App.tsx or index.tsx for routes
function analyzeRoutes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const routes = [];
  
  // Pattern 1: <Route path="/something" element={<Component />} />
  const routePattern1 = /<Route\s+path=["']([^"']+)["']\s+element={<(\w+)\s*\/?>}/g;
  let match;
  while ((match = routePattern1.exec(content)) !== null) {
    routes.push({ path: match[1], component: match[2] });
  }
  
  // Pattern 2: <Route path="/something" component={Component} />
  const routePattern2 = /<Route\s+path=["']([^"']+)["']\s+component={(\w+)}/g;
  while ((match = routePattern2.exec(content)) !== null) {
    routes.push({ path: match[1], component: match[2] });
  }
  
  // Pattern 3: { path: "/something", element: <Component /> }
  const routePattern3 = /{\s*path:\s*["']([^"']+)["'],\s*element:\s*<(\w+)\s*\/?>/g;
  while ((match = routePattern3.exec(content)) !== null) {
    routes.push({ path: match[1], component: match[2] });
  }
  
  return routes;
}

// Find navigation patterns in components
function findNavigationPatterns(dir) {
  const patterns = {
    links: [],
    navigates: []
  };
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find Link components
    const linkPattern = /<Link\s+to=["']([^"']+)["']/g;
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
      if (!patterns.links.includes(match[1])) {
        patterns.links.push(match[1]);
      }
    }
    
    // Find navigate() calls
    const navigatePattern = /navigate\(["']([^"']+)["']\)/g;
    while ((match = navigatePattern.exec(content)) !== null) {
      if (!patterns.navigates.includes(match[1])) {
        patterns.navigates.push(match[1]);
      }
    }
  }
  
  function scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
        scanFile(fullPath);
      }
    });
  }
  
  scanDirectory(dir);
  return patterns;
}

// Generate route mapping
function generateRouteMapping(routes, patterns) {
  const mapping = {};
  
  // Add discovered routes
  routes.forEach(route => {
    const nextPath = route.path
      .replace(':id', '[id]')
      .replace(':slug', '[slug]')
      .replace(':category', '[category]')
      .replace(':tag', '[tag]')
      .replace(':authorId', '[authorId]');
    
    mapping[route.path] = {
      component: route.component,
      nextPath: nextPath,
      file: nextPath === '/' ? 'page.tsx' : `${nextPath.slice(1)}/page.tsx`
    };
  });
  
  // Add routes from Link patterns
  [...patterns.links, ...patterns.navigates].forEach(path => {
    if (!mapping[path] && path.startsWith('/')) {
      const nextPath = path
        .replace(/:(\w+)/g, '[$1]')
        .replace(/\*/g, '[...slug]');
      
      mapping[path] = {
        component: 'Unknown',
        nextPath: nextPath,
        file: nextPath === '/' ? 'page.tsx' : `${nextPath.slice(1)}/page.tsx`
      };
    }
  });
  
  return mapping;
}

// Main execution
const magicDir = process.argv[2] || './magic';
const routes = [];

// Check for App.tsx or index.tsx in both root and src
const possiblePaths = [
  magicDir,
  path.join(magicDir, 'src')
];

possiblePaths.forEach(basePath => {
  ['App.tsx', 'index.tsx', 'App.jsx', 'index.jsx'].forEach(file => {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
      console.log(`Analyzing routes in ${filePath}...`);
      routes.push(...analyzeRoutes(filePath));
    }
  });
});

// Find navigation patterns
console.log('Scanning for navigation patterns...');
// Check if components is in src subdirectory
const componentsPath = fs.existsSync(path.join(magicDir, 'src/components')) 
  ? path.join(magicDir, 'src/components')
  : path.join(magicDir, 'components');
const patterns = findNavigationPatterns(componentsPath);

// Generate mapping
const routeMapping = generateRouteMapping(routes, patterns);

// Save results
fs.writeFileSync(
  './route-mapping.json',
  JSON.stringify(routeMapping, null, 2)
);

console.log(`\nFound ${Object.keys(routeMapping).length} routes`);
console.log('Route mapping saved to route-mapping.json');
