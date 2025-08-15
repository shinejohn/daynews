#!/bin/bash

# Version B - Step 3 Enhanced: Extract Page Metadata with Database Knowledge
# Reads ISRCSR comments and creates routing configuration with proper TTL based on content type

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 3: Extracting Enhanced Page Metadata             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create enhanced metadata extractor
echo -e "${YELLOW}Creating enhanced metadata extractor...${NC}"
cat > scripts/extract-metadata-enhanced.mjs << 'EOF'
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🔍 Scanning Magic Patterns components for ISRCSR metadata...\n');

async function main() {
  const MAGIC_PATTERNS_DIR = process.argv[2] || '/Users/johnshine/Dropbox/Fibonacco/Day-News/Code/magic/src/components';
  const pageMetadata = [];

  // TTL configuration based on database knowledge
  const TTL_CONFIG = {
  // News pages - from database-knowledge-file.md
  'ArticleDetailPage': 3600,      // 1 hour for regular articles
  'NewsPage': 300,                // 5 minutes for news listing
  'HomePage': 300,                // 5 minutes for homepage (latest news)
  
  // Events - time sensitive
  'EventsPage': 300,              // 5 minutes for today's events
  'EventDetailPage': 1800,        // 30 minutes for individual events
  'EventsCalendarPage': 300,      // 5 minutes for calendar
  
  // Business directory
  'BusinessDirectoryPage': 21600, // 6 hours
  'BusinessProfile': 21600,       // 6 hours
  'BusinessDetailPage': 21600,    // 6 hours
  'DealsPage': 1800,             // 30 minutes for active deals
  
  // Community content
  'AnnouncementsPage': 1800,      // 30 minutes
  'ClassifiedsPage': 900,         // 15 minutes
  'MemorialsPage': 86400,         // 24 hours (rarely changes)
  'MemorialDetailPage': 0,        // Static after creation
  
  // Legal/Static
  'LegalNoticesPage': 86400,      // 24 hours
  'AboutPage': 604800,            // 1 week
  'ContactPage': 604800,          // 1 week
  
  // User-generated content
  'ReviewsPage': 3600,            // 1 hour
  'PhotoGalleryPage': 3600,       // 1 hour
  'HubPage': 600,                 // 10 minutes for forum homepage
  'HubPostPage': 1800,            // 30 minutes for posts
  
  // Default
  'default': 300                  // 5 minutes default
};

// Find all page components
const pageFiles = await glob(`${MAGIC_PATTERNS_DIR}/**/*Page.{jsx,tsx}`, {
  ignore: '**/node_modules/**'
});

// Also find key components that act as pages
const additionalPages = await glob(`${MAGIC_PATTERNS_DIR}/**/HomePage.{jsx,tsx}`, {
  ignore: '**/node_modules/**'
});

const allFiles = [...pageFiles, ...additionalPages];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file, path.extname(file));
  
  // Extract ISRCSR comment
  const isrcsrMatch = content.match(/\/\/\s*ISRCSR\s*=\s*(ISR|CSR)/);
  const renderingMode = isrcsrMatch ? isrcsrMatch[1] : 'ISR'; // Default to ISR
  
  // Extract route from component name and path
  const route = deriveRoute(fileName, file);
  
  // Get TTL from configuration
  const ttl = renderingMode === 'ISR' ? (TTL_CONFIG[fileName] || TTL_CONFIG.default) : 0;
  
  // Extract data dependencies
  const hasSupabase = content.includes('supabase') || content.includes('from(');
  const hasAuth = content.includes('useAuth') || content.includes('requireAuth') || content.includes('user');
  const dataQueries = extractDataQueries(content);
  
  pageMetadata.push({
    component: fileName,
    file: path.relative(process.cwd(), file),
    route,
    renderingMode,
    ttl,
    needsAuth: hasAuth,
    hasDataFetch: hasSupabase || dataQueries.length > 0,
    dataQueries,
    category: categorizeComponent(fileName, file)
  });
  
  console.log(`✓ ${fileName}: ${renderingMode} (TTL: ${ttl}s) - ${route}`);
});

// Extract Supabase queries from content
function extractDataQueries(content) {
  const queries = [];
  
  // Look for Supabase query patterns
  const supabasePatterns = [
    /from\(['"](\w+)['"]\)/g,
    /\.select\(/g,
    /\.eq\(/g,
    /\.order\(/g
  ];
  
  // Common table names from database
  const tables = ['news', 'events', 'businesses', 'reviews', 'deals', 
                  'marketplace_listings', 'announcements', 'memorials', 
                  'interest_hubs', 'hub_posts'];
  
  tables.forEach(table => {
    if (content.includes(`from('${table}')`) || content.includes(`from("${table}")`)) {
      queries.push(table);
    }
  });
  
  return [...new Set(queries)];
}

// Derive route from component name and file path
function deriveRoute(componentName, filePath) {
  // Extract path segments
  const pathParts = filePath.split('/');
  const componentDir = pathParts[pathParts.length - 2];
  
  const routeMap = {
    'HomePage': '/',
    'ArticleDetailPage': '/article/:slug',
    'NewsPage': '/news',
    'NewsDetailPage': '/news/:slug',
    'AuthorsPage': '/authors',
    'AuthorProfilePage': '/author/:id',
    'EventsPage': '/events',
    'EventsCalendarPage': '/events/calendar',
    'EventDetailPage': '/event/:slug',
    'ClassifiedsPage': '/classifieds',
    'ClassifiedDetailPage': '/classified/:id',
    'BusinessDirectoryPage': '/businesses',
    'BusinessProfile': '/business/:slug',
    'BusinessDetailPage': '/business/:slug',
    'AnnouncementsPage': '/announcements',
    'AnnouncementDetailPage': '/announcement/:slug',
    'PhotoGalleryPage': '/photos',
    'PhotoAlbumPage': '/photos/:albumId',
    'CouponsPage': '/coupons',
    'DealsPage': '/deals',
    'MemorialDetailPage': '/memorial/:id',
    'MemorialsPage': '/memorials',
    'LegalNoticesPage': '/legal-notices',
    'CreateNewsPage': '/create/news',
    'AdminDashboard': '/admin',
    'UserSettingsPage': '/settings',
    'UserProfilePage': '/profile/:username',
    'PageDirectory': '/directory',
    'AboutPage': '/about',
    'ContactPage': '/contact',
    'SearchResultsPage': '/search',
    'HubPage': '/hub/:slug',
    'HubPostPage': '/hub/:hubSlug/post/:postId',
    'ReviewsPage': '/reviews',
    'LoginPage': '/login',
    'RegisterPage': '/register'
  };
  
  // Check route map first
  if (routeMap[componentName]) {
    return routeMap[componentName];
  }
  
  // Try to derive from directory structure
  if (componentDir && componentDir !== 'components') {
    const singular = componentDir.replace(/s$/, '');
    return `/${componentDir}/${componentName.replace('Page', '').toLowerCase()}`;
  }
  
  // Default pattern
  return `/${componentName.replace('Page', '').toLowerCase()}`;
}

// Categorize component for better organization
function categorizeComponent(componentName, filePath) {
  if (filePath.includes('/admin/')) return 'admin';
  if (filePath.includes('/auth/')) return 'auth';
  if (filePath.includes('/business/')) return 'business';
  if (filePath.includes('/events/')) return 'events';
  if (filePath.includes('/news/') || filePath.includes('/article/')) return 'news';
  if (filePath.includes('/community/')) return 'community';
  if (filePath.includes('/marketplace/') || filePath.includes('/classifieds/')) return 'marketplace';
  if (componentName.includes('Create') || componentName.includes('Edit')) return 'forms';
  if (componentName.includes('Profile') || componentName.includes('Settings')) return 'user';
  return 'general';
}

// Create route configuration with community support
const routeConfig = {
  routes: pageMetadata.reduce((acc, page) => {
    acc[page.route] = {
      component: page.component,
      renderingMode: page.renderingMode,
      ttl: page.ttl,
      needsAuth: page.needsAuth,
      hasDataFetch: page.hasDataFetch,
      dataQueries: page.dataQueries,
      category: page.category
    };
    
    // Add community-scoped version
    if (!page.route.startsWith('/admin') && !page.route.startsWith('/auth')) {
      const communityRoute = `/:community${page.route}`;
      acc[communityRoute] = {
        ...acc[page.route],
        communityScoped: true
      };
    }
    
    return acc;
  }, {}),
  
  isrRoutes: pageMetadata.filter(p => p.renderingMode === 'ISR').map(p => p.route),
  csrRoutes: pageMetadata.filter(p => p.renderingMode === 'CSR').map(p => p.route),
  
  ttlConfig: pageMetadata.reduce((acc, page) => {
    if (page.renderingMode === 'ISR') {
      acc[page.route] = page.ttl;
    }
    return acc;
  }, {}),
  
  categories: pageMetadata.reduce((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page.route);
    return acc;
  }, {})
};

// Save configuration
fs.writeFileSync('route-config.json', JSON.stringify(routeConfig, null, 2));
console.log(`\n📝 Route configuration saved to route-config.json`);

// Generate enhanced route handler
const routeHandlerContent = `
// Auto-generated route configuration with database knowledge
export const routeConfig = ${JSON.stringify(routeConfig, null, 2)};

// Cache invalidation rules based on database triggers
export const invalidationRules = {
  'news:publish': ['/news', '/', '/author/:authorId'],
  'event:update': ['/events', '/event/:slug', '/events/calendar'],
  'business:review': ['/business/:slug', '/businesses', '/reviews'],
  'deal:activate': ['/deals', '/business/:slug'],
  'announcement:create': ['/announcements', '/'],
  'hub:post': ['/hub/:slug', '/']
};

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

// Get routes that need invalidation when content changes
export function getInvalidationTargets(type, action, data = {}) {
  const key = \`\${type}:\${action}\`;
  const patterns = invalidationRules[key] || [];
  
  return patterns.map(pattern => {
    // Replace placeholders with actual values
    return pattern.replace(/:(\w+)/g, (match, param) => {
      return data[param] || match;
    });
  });
}
`;

fs.writeFileSync('server/route-config.js', routeHandlerContent);
console.log('✓ Enhanced route handler generated\n');

// Generate data requirements for Supabase
const dataRequirements = {
  tables: [...new Set(pageMetadata.flatMap(p => p.dataQueries))],
  byCategory: {}
};

Object.entries(routeConfig.categories).forEach(([category, routes]) => {
  const queries = new Set();
  routes.forEach(route => {
    const config = routeConfig.routes[route];
    config.dataQueries.forEach(q => queries.add(q));
  });
  dataRequirements.byCategory[category] = [...queries];
});

fs.writeFileSync('data-requirements.json', JSON.stringify(dataRequirements, null, 2));

// Summary
console.log('📊 Summary:');
console.log(`   Total pages: ${pageMetadata.length}`);
console.log(`   ISR pages: ${routeConfig.isrRoutes.length}`);
console.log(`   CSR pages: ${routeConfig.csrRoutes.length}`);
console.log(`   Tables used: ${dataRequirements.tables.join(', ')}`);
console.log(`\n📊 TTL Distribution:`);

const ttlGroups = {};
pageMetadata.filter(p => p.renderingMode === 'ISR').forEach(p => {
  const minutes = Math.round(p.ttl / 60);
  const key = minutes === 0 ? 'Static' : `${minutes} min`;
  ttlGroups[key] = (ttlGroups[key] || 0) + 1;
});

Object.entries(ttlGroups).forEach(([ttl, count]) => {
    console.log(`   ${ttl}: ${count} pages`);
  });
}

main().catch(console.error);
EOF

chmod +x scripts/extract-metadata-enhanced.mjs
node scripts/extract-metadata-enhanced.mjs "$@"

echo -e "${GREEN}✅ Enhanced page metadata extracted!${NC}"
echo -e "${BLUE}Next: Run ./04-setup-data-layer-enhanced.sh${NC}"