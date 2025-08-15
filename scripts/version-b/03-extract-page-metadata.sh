#!/bin/bash

# Version B - Step 3: Extract Page Metadata from Magic Patterns
# Reads ISRCSR comments and creates routing configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 3: Extracting Page Metadata                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create metadata extractor
echo -e "${YELLOW}Creating metadata extractor...${NC}"
cat > scripts/extract-metadata.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Scanning Magic Patterns components for ISRCSR metadata...\n');

const MAGIC_PATTERNS_DIR = process.argv[2] || '../magic/src/components';
const pageMetadata = [];

// Find all page components
const pageFiles = glob.sync(`${MAGIC_PATTERNS_DIR}/**/*Page.{jsx,tsx}`, {
  ignore: '**/node_modules/**'
});

pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file, path.extname(file));
  
  // Extract ISRCSR comment
  const isrcsrMatch = content.match(/\/\/\s*ISRCSR\s*=\s*(ISR|CSR)/);
  const renderingMode = isrcsrMatch ? isrcsrMatch[1] : 'ISR'; // Default to ISR
  
  // Extract route from component name
  const route = deriveRoute(fileName);
  
  // Extract any TTL configuration
  const ttlMatch = content.match(/\/\/\s*TTL\s*=\s*(\d+)/);
  const ttl = ttlMatch ? parseInt(ttlMatch[1]) : (renderingMode === 'ISR' ? 300 : 0);
  
  pageMetadata.push({
    component: fileName,
    file: path.relative(process.cwd(), file),
    route,
    renderingMode,
    ttl,
    needsAuth: content.includes('useAuth') || content.includes('requireAuth'),
    hasDataFetch: content.includes('fetch') || content.includes('axios') || content.includes('supabase')
  });
  
  console.log(`✓ ${fileName}: ${renderingMode} (TTL: ${ttl}s)`);
});

// Derive route from component name
function deriveRoute(componentName) {
  const routeMap = {
    'HomePage': '/',
    'ArticleDetailPage': '/article/:slug',
    'AuthorsPage': '/authors',
    'AuthorProfilePage': '/author/:id',
    'EventsPage': '/events',
    'EventDetailPage': '/event/:id',
    'ClassifiedsPage': '/classifieds',
    'ClassifiedDetailPage': '/classified/:id',
    'BusinessDirectoryPage': '/business',
    'BusinessProfilePage': '/business/:slug',
    'AnnouncementsPage': '/announcements',
    'PhotoGalleryPage': '/photos',
    'CouponsPage': '/coupons',
    'MemorialDetailPage': '/memorial/:id',
    'MemorialsPage': '/memorials',
    'CreateNewsPage': '/create/news',
    'AdminDashboard': '/admin',
    'UserSettingsPage': '/settings',
    'PageDirectory': '/directory'
  };
  
  return routeMap[componentName] || `/${componentName.replace('Page', '').toLowerCase()}`;
}

// Create route configuration
const routeConfig = {
  routes: pageMetadata.reduce((acc, page) => {
    acc[page.route] = {
      component: page.component,
      renderingMode: page.renderingMode,
      ttl: page.ttl,
      needsAuth: page.needsAuth,
      hasDataFetch: page.hasDataFetch
    };
    return acc;
  }, {}),
  
  isrRoutes: pageMetadata.filter(p => p.renderingMode === 'ISR').map(p => p.route),
  csrRoutes: pageMetadata.filter(p => p.renderingMode === 'CSR').map(p => p.route),
  
  ttlConfig: pageMetadata.reduce((acc, page) => {
    if (page.renderingMode === 'ISR') {
      acc[page.route] = page.ttl;
    }
    return acc;
  }, {})
};

// Save configuration
fs.writeFileSync('route-config.json', JSON.stringify(routeConfig, null, 2));
console.log(`\n📝 Route configuration saved to route-config.json`);

// Generate route handler
const routeHandlerContent = `
// Auto-generated route configuration
export const routeConfig = ${JSON.stringify(routeConfig, null, 2)};

export function getRouteConfig(route) {
  // Handle dynamic routes
  for (const [pattern, config] of Object.entries(routeConfig.routes)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(route)) {
        return config;
      }
    }
  }
  
  return routeConfig.routes[route] || null;
}

export function shouldUseISR(route) {
  const config = getRouteConfig(route);
  return config?.renderingMode === 'ISR';
}

export function getTTL(route) {
  const config = getRouteConfig(route);
  return config?.ttl || 300;
}
`;

fs.writeFileSync('server/route-config.js', routeHandlerContent);
console.log('✓ Route handler generated\n');

// Summary
console.log('📊 Summary:');
console.log(`   Total pages: ${pageMetadata.length}`);
console.log(`   ISR pages: ${routeConfig.isrRoutes.length}`);
console.log(`   CSR pages: ${routeConfig.csrRoutes.length}`);
EOF

node scripts/extract-metadata.js "$@"

# Update ISR middleware to use route config
echo -e "\n${YELLOW}Updating ISR middleware with route configuration...${NC}"
cat >> server/isr/isr-middleware.js << 'EOF'

// Import route configuration
import { getTTL, shouldUseISR } from '../route-config.js'

// Override getTTLForRoute method
ISRMiddleware.prototype.getTTLForRoute = function(route) {
  return getTTL(route)
}

// Add method to check if route should use ISR
ISRMiddleware.prototype.shouldCache = function(route) {
  return shouldUseISR(route)
}
EOF

echo -e "${GREEN}✅ Page metadata extracted!${NC}"
echo -e "${BLUE}Next: Run ./04-setup-data-layer.sh${NC}"