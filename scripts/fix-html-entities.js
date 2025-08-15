#!/usr/bin/env node

/**
 * Fix HTML entities in JavaScript/TypeScript files
 * Specifically handles &apos; and &quot; in string literals
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Fixing HTML entities in JavaScript/TypeScript files...\n');

function fixHtmlEntities(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.next' &&
        !entry.name.startsWith('.')) {
      fixHtmlEntities(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      const filePath = path.join(dir, entry.name);
      fixFileEntities(filePath);
    }
  });
}

function fixFileEntities(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;
  
  // Fix &apos; to '
  content = content.replace(/&apos;/g, "'");
  
  // Fix &quot; to "
  content = content.replace(/&quot;/g, '"');
  
  // Fix &lt; to <
  content = content.replace(/&lt;/g, '<');
  
  // Fix &gt; to >
  content = content.replace(/&gt;/g, '>');
  
  // Fix &amp; to &
  content = content.replace(/&amp;/g, '&');
  
  // Check if content was modified
  if (content !== originalContent) {
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed entities in: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Run the fix
fixHtmlEntities(path.join(projectRoot, 'src'));

console.log(`\n✨ Fixed HTML entities in ${fixCount} files!`);