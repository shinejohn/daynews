#!/usr/bin/env node

/**
 * Fix rendering strategies for a news website
 * Apply proper SSR/ISR/SSG based on content type
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing rendering strategies for news website...\n');

// Define proper rendering strategies for different page types
const renderingStrategies = {
  // ISR - Incremental Static Regeneration (news content)
  isr: {
    pages: ['home', 'national', 'sports', 'life', 'opinion', 'business', 
            'trending', 'photos', 'announcements', 'memorials', 'events'],
    config: {
      revalidate: 300, // 5 minutes for news content
      dynamic: null // Remove force-static/force-dynamic
    }
  },
  
  // SSG - Static Site Generation (rarely changes)
  ssg: {
    pages: ['about', 'contact', 'privacy-policy', 'terms-of-service', 
            'cookie-policy', 'ethics-policy', 'accessibility', 'careers',
            'services-pricing', 'subscription-options'],
    config: {
      revalidate: 86400, // 24 hours for static content
      dynamic: null
    }
  },
  
  // Dynamic - Server-side rendered on each request
  dynamic: {
    pages: ['search', 'profile', 'settings', 'admin-dashboard', 
            'moderation-queue', 'revenue-analytics'],
    config: {
      revalidate: null,
      dynamic: 'force-dynamic'
    }
  },
  
  // Dynamic with params (e.g., [id] routes)
  dynamicWithParams: {
    pages: ['author/[authorId]', 'photos/[photoId]', 'business/[slug]'],
    config: {
      revalidate: 300, // 5 minutes
      dynamic: null,
      generateStaticParams: true // For popular content
    }
  }
};

// Process all page.tsx files
const pageFiles = glob.sync('src/app/**/page.tsx', {
  cwd: process.cwd(),
  absolute: true
});

let updated = 0;

pageFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Determine page type from path
  const relativePath = path.relative(path.join(process.cwd(), 'src/app'), file);
  const pagePath = path.dirname(relativePath).replace(/\\/g, '/');
  
  // Find matching strategy
  let strategy = null;
  let strategyType = null;
  
  for (const [type, config] of Object.entries(renderingStrategies)) {
    if (config.pages.some(page => pagePath.includes(page))) {
      strategy = config.config;
      strategyType = type;
      break;
    }
  }
  
  // Default to ISR for unlisted pages
  if (!strategy) {
    strategy = renderingStrategies.isr.config;
    strategyType = 'isr';
  }
  
  // Remove existing configurations
  content = content.replace(/export const revalidate = \d+;[^\n]*/g, '');
  content = content.replace(/export const dynamic = ['"][\w-]+['"];[^\n]*/g, '');
  
  // Add new configurations
  const configs = [];
  
  if (strategy.revalidate !== null) {
    configs.push(`export const revalidate = ${strategy.revalidate}; // ${strategyType === 'ssg' ? 'Static content' : 'ISR - updates every ' + (strategy.revalidate / 60) + ' minutes'}`);
  }
  
  if (strategy.dynamic !== null) {
    configs.push(`export const dynamic = '${strategy.dynamic}';`);
  }
  
  if (configs.length > 0) {
    // Find import section
    const lastImportIndex = content.lastIndexOf('import');
    if (lastImportIndex !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIndex);
      const configBlock = '\n// Rendering strategy: ' + strategyType.toUpperCase() + '\n' + configs.join('\n') + '\n';
      content = content.slice(0, lineEnd + 1) + configBlock + content.slice(lineEnd + 1);
      modified = true;
    }
  }
  
  // Add metadata if missing for content pages
  if (strategyType !== 'dynamic' && !content.includes('export const metadata')) {
    const pageName = pagePath.split('/').pop() || 'page';
    const title = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
    
    const metadata = `
export const metadata = {
  title: '${title} | DayNews',
  description: '${title} - Your trusted local news source',
};
`;
    
    const configIndex = content.indexOf('// Rendering strategy:');
    if (configIndex !== -1) {
      const insertPoint = content.indexOf('\n', configIndex) + 1;
      content = content.slice(0, insertPoint) + metadata + content.slice(insertPoint);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    updated++;
    console.log(`✓ Updated ${pagePath}/page.tsx (${strategyType})`);
  }
});

console.log(`\n✅ Updated ${updated} pages with proper rendering strategies\n`);

// Create a rendering strategy documentation
const docPath = path.join(process.cwd(), 'RENDERING_STRATEGIES.md');
const docContent = `# Rendering Strategies for DayNews

## Overview
This news website uses different rendering strategies optimized for content type:

### ISR (Incremental Static Regeneration) - 5 minutes
Used for frequently updated content:
- Homepage
- News sections (national, sports, life, opinion)
- Community content (announcements, events, memorials)
- Photo galleries
- Trending content

### SSG (Static Site Generation) - 24 hours
Used for rarely changing content:
- About pages
- Legal pages (privacy, terms, cookies)
- Contact information
- Career pages

### Dynamic (Server-Side Rendering)
Used for personalized or real-time content:
- Search results
- User profiles
- Admin dashboards
- Settings pages

### Dynamic with Params
Used for content with dynamic routes:
- Individual articles
- Author profiles
- Business pages

## Benefits
- **SEO**: All content pages are pre-rendered for search engines
- **Performance**: Static content loads instantly
- **Freshness**: News content updates every 5 minutes
- **Scalability**: Most pages are served from CDN

## Customization
Edit \`scripts/fix-rendering-strategies.js\` to adjust revalidation times or strategies.
`;

fs.writeFileSync(docPath, docContent);
console.log(`📄 Created RENDERING_STRATEGIES.md documentation\n`);

console.log('Next steps:');
console.log('1. Review the rendering strategies in RENDERING_STRATEGIES.md');
console.log('2. Run: npm run build');
console.log('3. Deploy to Vercel');
console.log('\nYour news site now has proper rendering strategies for SEO and performance!');