#!/usr/bin/env node

/**
 * Quick check of current conversion state
 * Helps AI understand what needs to be done
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Checking Current Conversion State...\n');

// Count components
const allComponents = glob.sync('src/components/**/*.tsx', {
  cwd: process.cwd(),
  ignore: ['**/*.original.tsx', '**/*.test.tsx', '**/*.spec.tsx']
});

const allPages = glob.sync('src/app/**/page.tsx', {
  cwd: process.cwd()
});

// Count 'use client' usage
let clientComponents = 0;
let clientPages = 0;
let ssrPages = 0;
let isrPages = 0;

// Check components
allComponents.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
    clientComponents++;
  }
});

// Check pages
allPages.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
    clientPages++;
  }
  
  if (content.includes('export const revalidate')) {
    isrPages++;
  } else if (content.includes('force-dynamic')) {
    ssrPages++;
  }
});

// Check critical pages
const criticalPages = [
  'src/app/page.tsx',
  'src/app/national/page.tsx',
  'src/app/events/page.tsx',
  'src/app/classifieds/page.tsx'
];

console.log('📊 Component Analysis:');
console.log(`Total components: ${allComponents.length}`);
console.log(`Client components: ${clientComponents} (${Math.round(clientComponents/allComponents.length*100)}%)`);
console.log(`Server components: ${allComponents.length - clientComponents} (${Math.round((allComponents.length - clientComponents)/allComponents.length*100)}%)`);

console.log('\n📄 Page Analysis:');
console.log(`Total pages: ${allPages.length}`);
console.log(`Client pages: ${clientPages} (${Math.round(clientPages/allPages.length*100)}%)`);
console.log(`ISR pages: ${isrPages}`);
console.log(`Dynamic SSR pages: ${ssrPages}`);

console.log('\n🎯 Critical Pages Check:');
criticalPages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    const hasUseClient = content.startsWith("'use client'");
    const hasRevalidate = content.includes('export const revalidate');
    const hasForceDynamic = content.includes('force-dynamic');
    
    console.log(`\n${path.basename(path.dirname(pagePath)) || 'home'}:`);
    console.log(`  - Has 'use client': ${hasUseClient ? '❌ YES (BAD for SEO!)' : '✅ NO (Good!)'}`);
    console.log(`  - Has ISR: ${hasRevalidate ? '✅ YES' : '❌ NO'}`);
    console.log(`  - Force dynamic: ${hasForceDynamic ? '⚠️  YES' : '✅ NO'}`);
  }
});

// Check for common issues
console.log('\n⚠️  Potential Issues:');

if (clientComponents / allComponents.length > 0.5) {
  console.log('❌ More than 50% of components are client-side!');
  console.log('   This breaks SSR for SEO. Need to run smart-use-client-analyzer.js');
}

if (clientPages > 0) {
  console.log(`❌ ${clientPages} pages have 'use client' directive!`);
  console.log('   Pages should use server components and extract client logic');
}

// Check for window/document in SSR context
const ssrPagesWithWindow = [];
allPages.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes("'use client'") && 
      (content.includes('window.') || content.includes('document.')) &&
      !content.includes('typeof window')) {
    ssrPagesWithWindow.push(file);
  }
});

if (ssrPagesWithWindow.length > 0) {
  console.log(`❌ ${ssrPagesWithWindow.length} SSR pages reference window/document!`);
  ssrPagesWithWindow.forEach(f => console.log(`   - ${path.relative(process.cwd(), f)}`));
}

// Recommendations
console.log('\n💡 Recommendations:');

if (clientComponents / allComponents.length > 0.3) {
  console.log('1. Run: node scripts/smart-use-client-analyzer.js');
  console.log('   To intelligently remove unnecessary client directives');
}

if (isrPages < 10) {
  console.log('2. Run: node scripts/fix-rendering-strategies.js');
  console.log('   To set up proper ISR for news content');
}

if (clientPages > 0) {
  console.log('3. Review page components and extract client logic');
  console.log('   Pages should be server components for SEO');
}

// Test build readiness
console.log('\n🏗️  Build Readiness:');
console.log('Run "npm run build" to test. Common issues:');
console.log('- HTML entities in strings (&apos;, &quot;)');
console.log('- Missing imports (useState, useEffect)');
console.log('- Window/document references in SSR');
console.log('- Incorrect component imports');

console.log('\n✅ Assessment Complete!');
console.log('\nNext step: Follow the AI_CONVERSION_GUIDE.md');