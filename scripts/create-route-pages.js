#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load route mapping
const routeMapping = JSON.parse(fs.readFileSync('./route-mapping.json', 'utf8'));

// ISR/SSR/CSR route configurations
const routeConfigs = {
  '/': { type: 'isr', revalidate: 60 },
  '/national': { type: 'isr', revalidate: 300 },
  '/news': { type: 'isr', revalidate: 300 },
  '/article': { type: 'isr', revalidate: 3600 },
  '/sports': { type: 'isr', revalidate: 600 },
  '/life': { type: 'isr', revalidate: 1800 },
  '/opinion': { type: 'isr', revalidate: 1800 },
  '/business': { type: 'isr', revalidate: 900 },
  '/events': { type: 'ssr' },
  '/classifieds': { type: 'ssr' },
  '/announcements': { type: 'ssr' },
  '/deals': { type: 'ssr' },
  '/search': { type: 'csr' },
  '/profile': { type: 'csr' },
  '/settings': { type: 'csr' },
  '/messages': { type: 'csr' },
  '/admin': { type: 'csr' },
  '/about': { type: 'ssg' },
  '/privacy': { type: 'ssg' },
  '/terms': { type: 'ssg' },
  '/contact': { type: 'ssg' }
};

function getRouteConfig(path) {
  // Check exact match
  if (routeConfigs[path]) return routeConfigs[path];
  
  // Check prefix match
  for (const [prefix, config] of Object.entries(routeConfigs)) {
    if (path.startsWith(prefix)) return config;
  }
  
  // Default to ISR
  return { type: 'isr', revalidate: 3600 };
}

function generatePageContent(component, routePath) {
  const config = getRouteConfig(routePath);
  let content = '';
  
  // Add route config based on type
  if (config.type === 'isr') {
    content += `// ISR Configuration
export const revalidate = ${config.revalidate}; // seconds
export const dynamic = 'force-static';

`;
  } else if (config.type === 'ssr') {
    content += `// SSR Configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

`;
  } else if (config.type === 'ssg') {
    content += `// SSG Configuration
export const dynamic = 'force-static';
export const revalidate = false;

`;
  } else if (config.type === 'csr') {
    content += `'use client';

`;
  }
  
  // Import and render component
  content += `import ${component} from '@/components/${component}';

export default function Page() {
  return <${component} />;
}`;
  
  return content;
}

// Create page routes
console.log('Creating Next.js page routes...\n');
let created = 0;
let skipped = 0;

Object.entries(routeMapping).forEach(([reactPath, mapping]) => {
  // Skip unknown components and catch-all routes
  if (mapping.component === 'Unknown' || reactPath === '*') {
    return;
  }
  
  // Fix the file path - remove leading slash and fix parameter syntax
  let filePath = mapping.file;
  if (filePath.startsWith('/')) {
    filePath = filePath.slice(1);
  }
  
  // Convert React Router params to Next.js params
  filePath = filePath
    .replace(/:articleId/g, '[articleId]')
    .replace(/:id/g, '[id]')
    .replace(/:slug/g, '[slug]')
    .replace(/:tag/g, '[tag]')
    .replace(/:category/g, '[category]')
    .replace(/:authorId/g, '[authorId]');
  
  const pagePath = path.join('./src/app', filePath);
  const pageDir = path.dirname(pagePath);
  
  // Create directory
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  // Skip if already exists
  if (fs.existsSync(pagePath)) {
    console.log(`  → ${filePath} already exists`);
    skipped++;
    return;
  }
  
  // Create page content
  const pageContent = generatePageContent(mapping.component, reactPath);
  
  fs.writeFileSync(pagePath, pageContent);
  console.log(`  ✓ Created ${filePath} (${getRouteConfig(reactPath).type.toUpperCase()})`);
  created++;
});

console.log(`\n✅ Created ${created} pages, skipped ${skipped} existing pages`);
console.log('\nRoute types:');
console.log('- ISR: Incremental Static Regeneration');
console.log('- SSR: Server-Side Rendering');
console.log('- CSR: Client-Side Rendering');
console.log('- SSG: Static Site Generation');