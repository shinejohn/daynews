#!/usr/bin/env node

/**
 * Fix ALL HTML entities in JavaScript/TypeScript files
 * This handles entities anywhere in the code, not just in JSX
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Fixing ALL HTML entities in JavaScript/TypeScript files...\n');

function fixAllEntities(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.next' &&
        !entry.name.startsWith('.')) {
      fixAllEntities(path.join(dir, entry.name));
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) && 
               !entry.name.includes('.original.')) {
      const filePath = path.join(dir, entry.name);
      fixFileEntities(filePath);
    }
  });
}

function fixFileEntities(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace all HTML entities with their actual characters
  // This is safe because these entities should not be in JavaScript string literals
  content = content.replace(/&apos;/g, "'");
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&amp;/g, '&');
  
  // Check if content was modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed entities in: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Run the fix
fixAllEntities(path.join(projectRoot, 'src'));

console.log(`\n✨ Fixed HTML entities in ${fixCount} files!`);