#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

console.log('🔧 Fixing TODO comment syntax errors...\n');

// Find all files with broken TODO patterns
const files = glob.sync('src/components/**/*.{ts,tsx}');

let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix pattern: } = /* TODO: ... */ || {
  if (content.includes('} = /* TODO: Convert location.state to searchParams or context */ || {')) {
    content = content.replace(
      /} = \/\* TODO: Convert location\.state to searchParams or context \*\/ \|\| {/g,
      '} = {} as any || { // TODO: Convert location.state to searchParams or context'
    );
    modified = true;
  }
  
  // Fix pattern: } = /* TODO: ... */ || {};
  if (content.includes('} = /* TODO: Convert location.state to searchParams or context */ || {};')) {
    content = content.replace(
      /} = \/\* TODO: Convert location\.state to searchParams or context \*\/ \|\| {};/g,
      '} = {} as any; // TODO: Convert location.state to searchParams or context'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    fixed++;
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n✨ Fixed ${fixed} files with TODO syntax errors`);