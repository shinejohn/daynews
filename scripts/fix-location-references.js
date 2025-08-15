#!/usr/bin/env node

/**
 * Fix location references for server-side rendering
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Fixing location references for SSR...\n');

function fixLocationRefs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.next' &&
        !entry.name.startsWith('.')) {
      fixLocationRefs(path.join(dir, entry.name));
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) && 
               !entry.name.includes('.original.')) {
      const filePath = path.join(dir, entry.name);
      fixFileLocation(filePath);
    }
  });
}

function fixFileLocation(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace location.search with window.location.search
  content = content.replace(/(?<!window\.)location\.search/g, 'window.location.search');
  
  // Replace location.pathname with window.location.pathname
  content = content.replace(/(?<!window\.)location\.pathname/g, 'window.location.pathname');
  
  // Replace location.href with window.location.href
  content = content.replace(/(?<!window\.)location\.href/g, 'window.location.href');
  
  // Add window check for useEffect hooks that use location
  if (content.includes('window.location') && content.includes('useEffect')) {
    // Find useEffect blocks that use window.location
    content = content.replace(
      /useEffect\(\(\)\s*=>\s*{([^}]*window\.location[^}]*)/g,
      (match, effectBody) => {
        if (!effectBody.includes('typeof window === \'undefined\'')) {
          return `useEffect(() => {
    if (typeof window === 'undefined') return;${effectBody}`;
        }
        return match;
      }
    );
  }
  
  // Check if content was modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed location refs in: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Run the fix
fixLocationRefs(path.join(projectRoot, 'src'));

console.log(`\n✨ Fixed location references in ${fixCount} files!`);