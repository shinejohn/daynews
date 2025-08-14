#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load route mapping
const routeMappingData = JSON.parse(fs.readFileSync('./route-mapping.json', 'utf8'));
const routeMapping = routeMappingData.routes || routeMappingData;

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

function getComponentPath(component) {
  // Map components to their actual file paths within components directory
  const componentPaths = {
    // About section
    'AboutUsPage': 'about/AboutUsPage',
    
    // Admin section
    'AdminDashboard': 'admin/AdminDashboard',
    'AIAgentControl': 'admin/AIAgentControl',
    'ContentManagement': 'admin/ContentManagement',
    'ModerationQueue': 'admin/ModerationQueue',
    'RevenueAnalytics': 'admin/RevenueAnalytics',
    
    // Ads section
    'CommunityAdsPage': 'ads/CommunityAdsPage',
    
    // Advertising section
    'AdvertisingDetailPage': 'advertising/AdvertisingDetailPage',
    
    // Announcements section
    'AnnouncementCreatorPage': 'announcements/AnnouncementCreatorPage',
    'AnnouncementDetailPage': 'announcements/AnnouncementDetailPage',
    
    // Archive section
    'ArchiveBrowserPage': 'archive/ArchiveBrowserPage',
    
    // Auth section
    'UserRegistrationPage': 'auth/UserRegistrationPage',
    
    // Authors section
    'AuthorsPage': 'authors/AuthorsPage',
    
    // Business section
    'BusinessDirectoryPage': 'business/BusinessDirectoryPage',
    
    // City section
    'CitySelectionPage': 'city/CitySelectionPage',
    
    // Classifieds section
    'ClassifiedsPage': 'classifieds/ClassifiedsPage',
    'ClassifiedDetailPage': 'classifieds/ClassifiedDetailPage',
    'ConfirmationPage': 'classifieds/ConfirmationPage',
    'PaymentPage': 'classifieds/PaymentPage',
    'RerunAdPage': 'classifieds/RerunAdPage',
    'SelectCommunitiesPage': 'classifieds/SelectCommunitiesPage',
    'SelectTimeframePage': 'classifieds/SelectTimeframePage',
    
    // Company section
    'AccessibilityPage': 'company/AccessibilityPage',
    'CareersPage': 'company/CareersPage',
    'CookiePolicyPage': 'company/CookiePolicyPage',
    'DoNotSellPage': 'company/DoNotSellPage',
    'EthicsPolicyPage': 'company/EthicsPolicyPage',
    'NewsroomPage': 'company/NewsroomPage',
    'PrivacyPolicyPage': 'company/PrivacyPolicyPage',
    'ServicesAndPricingPage': 'company/ServicesAndPricingPage',
    'SubscriptionOptionsPage': 'company/SubscriptionOptionsPage',
    'TermsOfServicePage': 'company/TermsOfServicePage',
    
    // Contact section
    'ContactUsPage': 'contact/ContactUsPage',
    
    // Coupons section
    'CouponCreatorPage': 'coupons/CouponCreatorPage',
    'CouponDetailPage': 'coupons/CouponDetailPage',
    
    // Events section
    'EventCreatorPage': 'events/EventCreatorPage',
    'EventDetailPage': 'events/EventDetailPage',
    'EventsCalendarPage': 'events/EventsCalendarPage',
    
    // Legal section
    'LegalNoticeCreatorPage': 'legal/LegalNoticeCreatorPage',
    'LegalNoticeDetailPage': 'legal/LegalNoticeDetailPage',
    'LegalNoticesListPage': 'legal/LegalNoticesListPage',
    
    // Life section
    'LifePage': 'life/LifePage',
    
    // Memorials section
    'MemorialDetailPage': 'memorials/MemorialDetailPage',
    'MemorialsPage': 'memorials/MemorialsPage',
    
    // Opinion section
    'OpinionPage': 'opinion/OpinionPage',
    
    // Photos section
    'PhotoDetailPage': 'photos/PhotoDetailPage',
    'PhotoGalleryPage': 'photos/PhotoGalleryPage',
    'PhotoUploadPage': 'photos/PhotoUploadPage',
    
    // Search section
    'SearchResultsPage': 'search/SearchResultsPage',
    
    // Sports section
    'SportsPage': 'sports/SportsPage',
    
    // Trending section
    'TrendingPage': 'trending/TrendingPage',
    
    // Tags section  
    'TagPage': 'tags/TagPage',
    
    // Pages section
    'EditorPage': 'pages/EditorPage',
    
    // Utility section
    'PageDirectory': 'utility/PageDirectory',
    
    // Classifieds continued
    'PostListingPage': 'classifieds/PostListingPage',
    
    // Admin continued
    'CommunityDeploymentWizard': 'admin/CommunityDeploymentWizard'
  };
  
  // Return the path or default to the component name (for root level components)
  return componentPaths[component] || component;
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
  
  // Import and render component with validation
  const componentPath = getComponentPath(component);
  
  // Validate component exists and check its export type
  const fullComponentPath = path.join(__dirname, '..', 'src', 'components', componentPath + '.tsx');
  let importType = 'named'; // default
  
  if (fs.existsSync(fullComponentPath)) {
    const componentContent = fs.readFileSync(fullComponentPath, 'utf8');
    
    // Check export patterns to determine correct import type
    const hasNamedExport = componentContent.includes(`export const ${component}`) ||
                          componentContent.includes(`export function ${component}`);
    const hasDefaultExport = componentContent.includes(`export default ${component}`) ||
                            componentContent.includes('export default function') ||
                            componentContent.includes(`export { ${component} as default }`);
    
    if (hasDefaultExport) {
      importType = 'default';
    } else if (!hasNamedExport && !hasDefaultExport) {
      console.warn(`  ⚠️  Warning: Component ${component} not found in ${componentPath}.tsx`);
    }
  } else {
    console.warn(`  ⚠️  Warning: Component file not found: ${fullComponentPath}`);
  }
  
  // Generate appropriate import
  if (importType === 'default') {
    content += `import ${component} from '@/components/${componentPath}';`;
  } else {
    content += `import { ${component} } from '@/components/${componentPath}';`;
  }
  
  content += `

export default function Page() {
  return <${component} />;
}`;
  
  return content;
}

// Create page routes
console.log('Creating Next.js page routes...\n');
let created = 0;
let skipped = 0;

routeMapping.forEach((mapping) => {
  // Skip unknown components and catch-all routes
  if (mapping.component === 'Unknown' || mapping.component === 'EmergencyFallback' || mapping.path === '*') {
    return;
  }
  
  // Fix the file path - remove leading slash and fix parameter syntax
  let filePath = mapping.file;
  if (filePath && filePath.startsWith('/')) {
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
  const pageContent = generatePageContent(mapping.component, mapping.path);
  
  fs.writeFileSync(pagePath, pageContent);
  console.log(`  ✓ Created ${filePath} (${getRouteConfig(mapping.path).type.toUpperCase()})`);
  created++;
});

console.log(`\n✅ Created ${created} pages, skipped ${skipped} existing pages`);
console.log('\nRoute types:');
console.log('- ISR: Incremental Static Regeneration');
console.log('- SSR: Server-Side Rendering');
console.log('- CSR: Client-Side Rendering');
console.log('- SSG: Static Site Generation');