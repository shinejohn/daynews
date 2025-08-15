#!/usr/bin/env node

/**
 * Fix pages to be server-side rendered for SEO
 * Newspaper sites need SSR/SSG for content pages
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Converting pages to server-side rendering for SEO...\n');

// Pages that should be server-side rendered
const ssrPages = [
  'home',
  'national', 
  'sports',
  'life',
  'opinion',
  'business',
  'newsroom',
  'archive',
  'photos',
  'trending',
  'announcements',
  'memorials',
  'events',
  'coupons',
  'classifieds',
  'authors',
  'journalists',
  'about',
  'contact',
  'privacy-policy',
  'terms-of-service',
  'cookie-policy',
  'ethics-policy',
  'accessibility',
  'careers'
];

// Remove force-dynamic from SSR pages
console.log('1️⃣ Fixing page configurations...');
const pageFiles = glob.sync('src/app/**/page.tsx', {
  cwd: process.cwd(),
  absolute: true
});

let fixedPages = 0;
pageFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check if it's a page that should be SSR
  const shouldBeSSR = ssrPages.some(page => file.includes(`/${page}/page.tsx`) || file.endsWith('/page.tsx'));
  
  if (shouldBeSSR) {
    // Remove force-dynamic
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      content = content.replace(
        /export const dynamic = 'force-dynamic'[^;]*;/g,
        "// Server-side rendered for SEO"
      );
      modified = true;
    }
    
    // Add proper metadata if missing
    if (!content.includes('export const metadata')) {
      const pageName = path.dirname(file).split('/').pop();
      const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      
      const metadataBlock = `
export const metadata = {
  title: '${title} - DayNews',
  description: 'Latest ${title.toLowerCase()} news and updates from your local community',
};
`;
      
      // Insert after imports
      const importEnd = content.lastIndexOf('import');
      if (importEnd !== -1) {
        const lineEnd = content.indexOf('\n', importEnd);
        content = content.slice(0, lineEnd + 1) + metadataBlock + content.slice(lineEnd + 1);
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    fixedPages++;
  }
});

console.log(`  ✓ Fixed ${fixedPages} pages for SSR\n`);

// Remove unnecessary 'use client' from display components
console.log('2️⃣ Removing unnecessary "use client" directives...');

const componentFiles = glob.sync('src/components/**/*.tsx', {
  cwd: process.cwd(),
  absolute: true
});

// Components that should NOT have 'use client' (display only)
const displayComponents = [
  'HeroStory',
  'FeaturedStories', 
  'EssentialReads',
  'PhotoGallerySection',
  'TrendingSection',
  'OpinionSection',
  'MoreNewsSection',
  'NewsArticle',
  'ArticleHeader',
  'ArticleRelated',
  'ContentCard',
  'PhotoCard',
  'AnnouncementCard',
  'EventCard',
  'MemorialCard',
  'BusinessCard',
  'CouponCard',
  'Footer',
  'AboutUsPage',
  'CareersPage',
  'NewsroomPage',
  'PrivacyPolicyPage',
  'TermsOfServicePage'
];

let fixedComponents = 0;
componentFiles.forEach(file => {
  if (file.includes('.original.tsx')) return;
  
  const fileName = path.basename(file, '.tsx');
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if it's a display component that shouldn't have 'use client'
  if (displayComponents.some(comp => fileName.includes(comp))) {
    if (content.startsWith("'use client'")) {
      // Check if it actually uses client features
      const usesHooks = content.includes('useState') || 
                       content.includes('useEffect') ||
                       content.includes('onClick') ||
                       content.includes('onChange');
      
      if (!usesHooks) {
        // Remove 'use client'
        const newContent = content.replace(/^'use client';\n/, '// Server Component - No client features needed\n');
        fs.writeFileSync(file, newContent);
        fixedComponents++;
        console.log(`  ✓ Converted ${fileName} to server component`);
      }
    }
  }
});

console.log(`\n  ✓ Fixed ${fixedComponents} components for SSR\n`);

// Create a simple server-side news component
console.log('3️⃣ Creating server-side news components...');

const newsListPath = path.join(process.cwd(), 'src/components/server/NewsList.tsx');
const newsListContent = `// Server Component - No 'use client' needed
import React from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl?: string;
}

interface NewsListProps {
  items: NewsItem[];
  title?: string;
}

export function NewsList({ items, title = 'Latest News' }: NewsListProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-4">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="text-blue-600">{item.category}</span>
                  <span>•</span>
                  <time>{item.date}</time>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link href={\`/article/\${item.id}\`} className="hover:text-blue-600">
                    {item.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 line-clamp-2">{item.excerpt}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}`;

// Create server components directory
const serverDir = path.dirname(newsListPath);
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}
fs.writeFileSync(newsListPath, newsListContent);
console.log('  ✓ Created NewsList server component\n');

console.log('✅ SSR fixes complete!\n');
console.log('Next steps:');
console.log('1. Review the changes');
console.log('2. Test locally with: npm run dev');
console.log('3. Build and deploy');
console.log('\nMost content pages are now server-side rendered for better SEO!');