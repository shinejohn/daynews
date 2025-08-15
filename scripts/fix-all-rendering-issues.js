#!/usr/bin/env node

/**
 * Comprehensive fix for all rendering issues
 * Combines all fixes discovered during the migration
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Comprehensive Rendering Fix for News Site\n');

// Step 1: Remove ALL 'use client' directives first
console.log('1️⃣ Removing all existing "use client" directives...');
const allFiles = glob.sync('src/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/*.d.ts']
});

let removedCount = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
    content = content.replace(/^['"]use client['"];\n\n?/, '');
    fs.writeFileSync(file, content);
    removedCount++;
  }
});
console.log(`✓ Removed ${removedCount} 'use client' directives\n`);

// Step 2: Apply smart 'use client' analysis
console.log('2️⃣ Running smart "use client" analysis...');
require('./smart-use-client-analyzer.js');

// Step 3: Fix rendering strategies for pages
console.log('\n3️⃣ Applying rendering strategies to pages...');
require('./fix-rendering-strategies.js');

// Step 4: Create server components for display-only components
console.log('\n4️⃣ Ensuring display components are server-rendered...');

const displayComponents = [
  'HeroStory', 'FeaturedStories', 'EssentialReads', 'MoreNewsSection',
  'LocalEventsSection', 'CommunityVoices', 'OpinionSection', 'PhotoGallerySection',
  'TrendingSection', 'ContentCard', 'NewsArticle', 'ArticleHeader'
];

displayComponents.forEach(compName => {
  const files = glob.sync(`src/components/**/${compName}.tsx`, {
    cwd: process.cwd(),
    absolute: true
  });
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove 'use client' if present
    if (content.startsWith("'use client'")) {
      content = content.replace(/^'use client';\n\n?/, '');
      
      // Add comment explaining why
      content = `// Server Component - Renders on server for SEO\n` + content;
      
      fs.writeFileSync(file, content);
      console.log(`✓ Made ${compName} a server component`);
    }
  });
});

// Step 5: Fix specific issues found during migration
console.log('\n5️⃣ Applying specific migration fixes...');

// Fix HomePage to be server-rendered
const homePagePath = path.join(process.cwd(), 'src/app/page.tsx');
if (fs.existsSync(homePagePath)) {
  let content = fs.readFileSync(homePagePath, 'utf8');
  
  // Remove force-dynamic if present
  content = content.replace(/export const dynamic = ['"]force-dynamic['"];?\n/g, '');
  
  // Add ISR configuration
  if (!content.includes('export const revalidate')) {
    content = content.replace(
      /export const metadata/,
      `// Rendering strategy: ISR
export const revalidate = 300; // ISR - updates every 5 minutes

export const metadata`
    );
  }
  
  fs.writeFileSync(homePagePath, content);
  console.log('✓ Fixed HomePage rendering strategy');
}

// Generate summary report
const report = `
# Rendering Fix Summary

## Changes Applied:
1. Removed all 'use client' directives
2. Re-applied 'use client' only where necessary
3. Configured ISR for news pages (5-minute revalidation)
4. Configured SSG for static pages (24-hour revalidation)
5. Made display components server-rendered
6. Fixed HomePage to use ISR instead of force-dynamic

## Rendering Strategy:
- **Default**: Server-Side Rendering (SSR)
- **News Content**: ISR with 5-minute revalidation
- **Static Pages**: SSG with 24-hour revalidation
- **Interactive**: Client-side only where necessary

## Benefits:
- ✅ SEO-optimized for search engines
- ✅ Fast initial page loads
- ✅ Reduced JavaScript bundle size
- ✅ Better Core Web Vitals

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync('rendering-fix-report.md', report);

console.log('\n' + report);
console.log('✅ All rendering issues fixed!');
console.log('📝 Report saved to: rendering-fix-report.md');
console.log('\nNext: Run "npm run build" to verify the fixes');