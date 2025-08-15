#!/usr/bin/env node

/**
 * Fix React unescaped entities in JSX
 * Handles apostrophes and quotes that need to be escaped
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Fixing React unescaped entities in JSX...\n');

function fixUnescapedEntities(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.next' &&
        !entry.name.startsWith('.')) {
      fixUnescapedEntities(path.join(dir, entry.name));
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) && 
               !entry.name.endsWith('.original.tsx') && 
               !entry.name.endsWith('.original.jsx')) {
      const filePath = path.join(dir, entry.name);
      fixFileEntities(filePath);
    }
  });
}

function fixFileEntities(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;
  
  // Find JSX text content (between > and <) and fix apostrophes
  // This regex looks for text between JSX tags
  content = content.replace(/>([^<]+)</g, (match, textContent) => {
    if (textContent.includes("'") && !textContent.includes('&apos;')) {
      // Replace apostrophes in contractions and possessives
      const fixed = textContent
        .replace(/don't/g, "don&apos;t")
        .replace(/won't/g, "won&apos;t")
        .replace(/can't/g, "can&apos;t")
        .replace(/couldn't/g, "couldn&apos;t")
        .replace(/shouldn't/g, "shouldn&apos;t")
        .replace(/wouldn't/g, "wouldn&apos;t")
        .replace(/didn't/g, "didn&apos;t")
        .replace(/isn't/g, "isn&apos;t")
        .replace(/aren't/g, "aren&apos;t")
        .replace(/hasn't/g, "hasn&apos;t")
        .replace(/haven't/g, "haven&apos;t")
        .replace(/doesn't/g, "doesn&apos;t")
        .replace(/let's/g, "let&apos;s")
        .replace(/it's/g, "it&apos;s")
        .replace(/that's/g, "that&apos;s")
        .replace(/what's/g, "what&apos;s")
        .replace(/there's/g, "there&apos;s")
        .replace(/here's/g, "here&apos;s")
        .replace(/we're/g, "we&apos;re")
        .replace(/you're/g, "you&apos;re")
        .replace(/they're/g, "they&apos;re")
        .replace(/I'm/g, "I&apos;m")
        .replace(/I've/g, "I&apos;ve")
        .replace(/we've/g, "we&apos;ve")
        .replace(/you've/g, "you&apos;ve")
        .replace(/they've/g, "they&apos;ve")
        .replace(/I'll/g, "I&apos;ll")
        .replace(/we'll/g, "we&apos;ll")
        .replace(/you'll/g, "you&apos;ll")
        .replace(/they'll/g, "they&apos;ll")
        .replace(/I'd/g, "I&apos;d")
        .replace(/we'd/g, "we&apos;d")
        .replace(/you'd/g, "you&apos;d")
        .replace(/they'd/g, "they&apos;d")
        // Possessives
        .replace(/([a-zA-Z]+)'s/g, "$1&apos;s")
        // Any remaining single quotes
        .replace(/'/g, "&apos;");
      
      return `>${fixed}<`;
    }
    return match;
  });
  
  // Also fix in JSX attributes that might contain text
  content = content.replace(/placeholder="([^"]+)"/g, (match, text) => {
    if (text.includes("'")) {
      const fixed = text.replace(/'/g, "&apos;");
      return `placeholder="${fixed}"`;
    }
    return match;
  });
  
  content = content.replace(/title="([^"]+)"/g, (match, text) => {
    if (text.includes("'")) {
      const fixed = text.replace(/'/g, "&apos;");
      return `title="${fixed}"`;
    }
    return match;
  });
  
  content = content.replace(/alt="([^"]+)"/g, (match, text) => {
    if (text.includes("'")) {
      const fixed = text.replace(/'/g, "&apos;");
      return `alt="${fixed}"`;
    }
    return match;
  });
  
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
fixUnescapedEntities(path.join(projectRoot, 'src'));

console.log(`\n✨ Fixed React unescaped entities in ${fixCount} files!`);