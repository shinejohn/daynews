#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixNavigateDependencies(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix navigate in dependency arrays
  if (content.includes(', navigate])') || content.includes(', navigate,')) {
    content = content.replace(/,\s*navigate\]/g, ', router]');
    content = content.replace(/,\s*navigate,/g, ', router,');
    modified = true;
  }
  
  // Fix router.push(-1) to router.back()
  if (content.includes('router.push(-1)')) {
    content = content.replace(/router\.push\(-1\)/g, 'router.back()');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all TypeScript/JavaScript files in components
const files = glob.sync('src/components/**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  absolute: true
});

let fixedCount = 0;

files.forEach(file => {
  if (fixNavigateDependencies(file)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files with navigate dependency issues.`);