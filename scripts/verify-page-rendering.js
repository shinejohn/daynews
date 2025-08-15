#!/usr/bin/env node

/**
 * Page Rendering Verification
 * Checks that all pages are properly rendering with their components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying Page Rendering...\n');

// Expected components per page
const EXPECTED_COMPONENTS = {
  'src/app/page.tsx': [
    'NewspaperMasthead', 'BreakingNewsBar', 'HeroSection',
    'FeaturedStories', 'LocalEventsSection', 'CommunityVoices',
    'TrendingSection', 'MarketplacePreview', 'AdvertisingColumn'
  ],
  'src/app/national/page.tsx': [
    'NationalNewsMasthead', 'CategoryTabs', 'HeroStory',
    'MoreNewsSection', 'EssentialReads', 'TrendingSection'
  ],
  'src/app/events/page.tsx': [
    'CalendarHeader', 'EventFiltersBar', 'FeaturedEventsCarousel',
    'TimeBasedEventList', 'EventMapView', 'EventTypeFilters'
  ],
  'src/app/classifieds/page.tsx': [
    'SearchFilterHero', 'CategoryBrowser', 'AdvancedFilters',
    'FeaturedListings', 'ListingToggle', 'ListingGrid'
  ]
};

const results = {
  pages: {},
  missingComponents: [],
  unusedComponents: [],
  renderingIssues: []
};

// Check each page
Object.entries(EXPECTED_COMPONENTS).forEach(([pagePath, expectedComps]) => {
  const fullPath = path.join(process.cwd(), pagePath);
  
  if (!fs.existsSync(fullPath)) {
    results.renderingIssues.push(`Page not found: ${pagePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const pageName = path.basename(path.dirname(pagePath)) || 'home';
  
  results.pages[pageName] = {
    expected: expectedComps.length,
    found: 0,
    missing: [],
    hasSSR: !content.includes("'use client'"),
    hasISR: content.includes('export const revalidate'),
    imports: []
  };
  
  // Check for each expected component
  expectedComps.forEach(comp => {
    // Check if component is imported
    const importRegex = new RegExp(`import.*${comp}.*from`);
    const hasImport = importRegex.test(content);
    
    // Check if component is used in JSX
    const jsxRegex = new RegExp(`<${comp}[\\s/>]`);
    const hasJSX = jsxRegex.test(content);
    
    if (hasImport && hasJSX) {
      results.pages[pageName].found++;
      results.pages[pageName].imports.push(comp);
    } else {
      results.pages[pageName].missing.push(comp);
      results.missingComponents.push({ page: pageName, component: comp });
    }
  });
});

// Check component files exist
const componentFiles = new Set();
Object.values(EXPECTED_COMPONENTS).flat().forEach(comp => {
  componentFiles.add(comp);
});

componentFiles.forEach(comp => {
  const possiblePaths = [
    `src/components/${comp}.tsx`,
    `src/components/content/${comp}.tsx`,
    `src/components/navigation/${comp}.tsx`,
    `src/components/hero/${comp}.tsx`,
    `src/components/events/${comp}.tsx`,
    `src/components/classifieds/${comp}.tsx`,
    `src/components/previews/${comp}.tsx`,
    `src/components/business/${comp}.tsx`
  ];
  
  const exists = possiblePaths.some(p => 
    fs.existsSync(path.join(process.cwd(), p))
  );
  
  if (!exists) {
    results.unusedComponents.push(comp);
  }
});

// Display results
console.log('📊 Page Rendering Report\n');

// Page summaries
Object.entries(results.pages).forEach(([pageName, data]) => {
  const completeness = Math.round((data.found / data.expected) * 100);
  const status = completeness === 100 ? '✅' : completeness >= 80 ? '⚠️ ' : '❌';
  
  console.log(`${status} ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page`);
  console.log(`   Components: ${data.found}/${data.expected} (${completeness}%)`);
  console.log(`   Rendering: ${data.hasSSR ? 'SSR' : 'CSR'} ${data.hasISR ? '+ ISR' : ''}`);
  
  if (data.missing.length > 0) {
    console.log(`   Missing: ${data.missing.join(', ')}`);
  }
  console.log('');
});

// Summary statistics
const totalExpected = Object.values(EXPECTED_COMPONENTS).flat().length;
const totalFound = Object.values(results.pages).reduce((sum, p) => sum + p.found, 0);
const overallCompleteness = Math.round((totalFound / totalExpected) * 100);

console.log('📈 Overall Statistics');
console.log(`   Total Components Expected: ${totalExpected}`);
console.log(`   Total Components Found: ${totalFound}`);
console.log(`   Overall Completeness: ${overallCompleteness}%`);
console.log(`   Missing Component Instances: ${results.missingComponents.length}`);
console.log(`   Component Files Not Found: ${results.unusedComponents.length}`);

// Rendering strategy summary
const ssrPages = Object.values(results.pages).filter(p => p.hasSSR).length;
const isrPages = Object.values(results.pages).filter(p => p.hasISR).length;

console.log('\n🎯 Rendering Strategies');
console.log(`   SSR Pages: ${ssrPages}/${Object.keys(results.pages).length}`);
console.log(`   ISR Enabled: ${isrPages}/${Object.keys(results.pages).length}`);

// Issues and recommendations
if (results.renderingIssues.length > 0 || results.missingComponents.length > 0) {
  console.log('\n⚠️  Issues Found:');
  
  results.renderingIssues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  
  if (results.missingComponents.length > 0) {
    console.log(`   - ${results.missingComponents.length} components not properly imported/used`);
  }
  
  console.log('\n💡 Recommendations:');
  console.log('   1. Run: ./scripts/fix-page-component-assembly.js');
  console.log('   2. Check component import paths');
  console.log('   3. Verify component files exist in correct locations');
} else {
  console.log('\n✅ All pages are properly assembled!');
}

// Visual representation
console.log('\n📱 Visual Page Structure:');
console.log('');
console.log('Homepage Layout:');
console.log('┌─────────────────────────────────┐');
console.log('│      NewspaperMasthead          │');
console.log('├─────────────────────────────────┤');
console.log('│      BreakingNewsBar            │');
console.log('├─────────────────────────────────┤');
console.log('│        HeroSection              │');
console.log('├──────────────────┬──────────────┤');
console.log('│                  │              │');
console.log('│ FeaturedStories  │  Trending    │');
console.log('│                  │              │');
console.log('│ LocalEvents      │ Marketplace  │');
console.log('│                  │              │');
console.log('│ CommunityVoices  │ Advertising  │');
console.log('│                  │              │');
console.log('└──────────────────┴──────────────┘');

// Test actual rendering (optional)
console.log('\n🧪 Testing Actual Rendering...');
try {
  const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
  if (buildOutput.includes('Compiled successfully')) {
    console.log('✅ Build successful - pages should render correctly');
  } else {
    console.log('⚠️  Build completed with warnings');
  }
} catch (error) {
  console.log('❌ Build failed - check error logs');
}

// Export results for CI/CD
const reportPath = path.join(process.cwd(), 'page-rendering-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Exit with appropriate code
process.exit(overallCompleteness === 100 ? 0 : 1);