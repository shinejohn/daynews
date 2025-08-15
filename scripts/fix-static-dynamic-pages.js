#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pages that use hooks that require dynamic rendering
const dynamicPages = [
  'national/page.tsx',
  'announcements/page.tsx',
  'home/page.tsx',
  'src/app/home/page.tsx',
  'src/app/national/page.tsx',
  'src/app/announcements/page.tsx'
];

function fixPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if this page should be dynamic
  const shouldBeDynamic = dynamicPages.some(page => filePath.endsWith(page));
  
  if (shouldBeDynamic && content.includes("export const dynamic = 'force-static'")) {
    const updatedContent = content.replace(
      "export const dynamic = 'force-static'",
      "export const dynamic = 'force-dynamic' // Changed to support client-side hooks"
    );
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✓ Fixed dynamic rendering for: ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all page.tsx files
const pageFiles = glob.sync('src/app/**/page.tsx', {
  cwd: process.cwd(),
  absolute: true
});

let fixedCount = 0;

pageFiles.forEach(file => {
  if (fixPage(file)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} pages to use dynamic rendering.`);