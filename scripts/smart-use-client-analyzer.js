#!/usr/bin/env node

/**
 * Smart 'use client' Analyzer
 * Only adds 'use client' when absolutely necessary
 * Respects SSR-first approach for news sites
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load rendering strategy if available
let renderingStrategy = {};
try {
  const strategyPath = path.join(process.cwd(), 'rendering-strategy-output.json');
  if (fs.existsSync(strategyPath)) {
    renderingStrategy = JSON.parse(fs.readFileSync(strategyPath, 'utf8'));
  }
} catch (e) {
  console.log('No rendering strategy found, using smart defaults');
}

// Pages that MUST be SSR for SEO (no 'use client' in page files)
const FORCE_SSR_PAGES = [
  'home', 'page.tsx',
  'national', 'sports', 'life', 'opinion',
  'article', 'news', 'events', 'classifieds',
  'business', 'announcements', 'photos', 'coupons',
  'trending', 'archive', 'memorials', 'about',
  'contact', 'authors', 'tag', 'search'
];

// Components that are display-only and should NOT have 'use client'
const DISPLAY_ONLY_COMPONENTS = [
  'HeroStory', 'FeaturedStories', 'NewsArticle', 'ArticleHeader',
  'ArticleContent', 'ArticleRelated', 'BusinessCard', 'EventCard',
  'AnnouncementCard', 'PhotoCard', 'CouponCard', 'ContentCard',
  'NewsList', 'EventsList', 'Footer', 'Header', 'Navigation',
  'Masthead', 'Sidebar', 'SectionHeader', 'CategoryTabs'
];

// Patterns that definitely need 'use client'
const CLIENT_PATTERNS = {
  hooks: [
    'useState', 'useEffect', 'useLayoutEffect', 'useReducer',
    'useCallback', 'useMemo', 'useRef', 'useImperativeHandle'
  ],
  browserAPIs: [
    'window.', 'document.', 'navigator.', 'localStorage',
    'sessionStorage', 'alert(', 'confirm(', 'prompt('
  ],
  eventHandlers: [
    'onClick', 'onChange', 'onSubmit', 'onMouseOver',
    'onKeyDown', 'onFocus', 'onBlur', 'onDrag'
  ],
  clientLibraries: [
    'FileReader', 'FormData', 'WebSocket', 'IntersectionObserver'
  ]
};

let analyzedCount = 0;
let addedCount = 0;
let skippedCount = 0;
let removedCount = 0;

console.log('🔍 Smart "use client" Analysis Starting...\n');

function shouldHaveUseClient(filePath, content) {
  const fileName = path.basename(filePath);
  const isPageFile = filePath.includes('/app/') && fileName === 'page.tsx';
  
  // Check if it's a forced SSR page
  if (isPageFile && FORCE_SSR_PAGES.some(page => filePath.includes(page))) {
    return { needed: false, reason: 'SSR page for SEO' };
  }
  
  // Check if it's a display-only component
  if (DISPLAY_ONLY_COMPONENTS.some(comp => fileName.includes(comp))) {
    // Double-check it doesn't have client features
    const hasClientFeatures = [
      ...CLIENT_PATTERNS.hooks,
      ...CLIENT_PATTERNS.browserAPIs,
      ...CLIENT_PATTERNS.eventHandlers,
      ...CLIENT_PATTERNS.clientLibraries
    ].some(pattern => content.includes(pattern));
    
    if (!hasClientFeatures) {
      return { needed: false, reason: 'Display-only component' };
    }
  }
  
  // Check for client-side patterns
  for (const [category, patterns] of Object.entries(CLIENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        return { needed: true, reason: `Uses ${category}: ${pattern}` };
      }
    }
  }
  
  // Check component name patterns
  const clientNamePatterns = [
    'Modal', 'Dropdown', 'Tooltip', 'Popover', 'Carousel',
    'Slider', 'Tabs', 'Accordion', 'Editor', 'Creator',
    'Upload', 'Form', 'Input', 'Select', 'Checkbox'
  ];
  
  if (clientNamePatterns.some(pattern => fileName.includes(pattern))) {
    return { needed: true, reason: 'Interactive component pattern' };
  }
  
  // Default: no 'use client' needed
  return { needed: false, reason: 'No client features detected' };
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const hasUseClient = content.startsWith("'use client'") || content.startsWith('"use client"');
  const analysis = shouldHaveUseClient(filePath, content);
  
  analyzedCount++;
  
  if (analysis.needed && !hasUseClient) {
    // Add 'use client'
    content = "'use client';\n\n" + content;
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added 'use client' to: ${path.relative(process.cwd(), filePath)}`);
    console.log(`   Reason: ${analysis.reason}`);
    addedCount++;
  } else if (!analysis.needed && hasUseClient) {
    // Remove 'use client'
    content = content.replace(/^['"]use client['"];\n\n?/, '');
    fs.writeFileSync(filePath, content);
    console.log(`❌ Removed 'use client' from: ${path.relative(process.cwd(), filePath)}`);
    console.log(`   Reason: ${analysis.reason}`);
    removedCount++;
  } else if (analysis.needed && hasUseClient) {
    console.log(`✓ Correctly has 'use client': ${path.relative(process.cwd(), filePath)}`);
    skippedCount++;
  } else {
    // Correctly doesn't have 'use client'
    skippedCount++;
  }
}

// Process all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*', '**/*.spec.*']
});

console.log(`Found ${files.length} files to analyze\n`);

files.forEach(processFile);

// Generate report
const report = `
# Smart 'use client' Analysis Report

## Summary
- Files analyzed: ${analyzedCount}
- 'use client' added: ${addedCount}
- 'use client' removed: ${removedCount}
- Correctly configured: ${skippedCount}

## Strategy
- Default to SSR for all content pages
- Only use 'use client' when necessary
- Prioritize SEO for news content
- Keep display components server-rendered

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync('use-client-analysis-report.txt', report);

console.log('\n' + report);
console.log('📝 Full report saved to: use-client-analysis-report.txt');