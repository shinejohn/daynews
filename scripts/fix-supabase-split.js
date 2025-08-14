#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing split Supabase queries...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Fix pattern for split supabase queries
const splitPattern = /await\s+\(supabase\s*\n\s*as\s+any\)/g;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix split supabase queries
  if (content.match(splitPattern)) {
    content = content.replace(splitPattern, 'await (supabase');
    modified = true;
  }
  
  // Also fix cases where .from is on a new line after as any)
  const splitFromPattern = /\(supabase\s*\n\s*as\s+any\)\.from/g;
  if (content.match(splitFromPattern)) {
    content = content.replace(splitFromPattern, '(supabase\n      .from');
    modified = true;
  }
  
  // Fix missing closing parentheses for queries
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const { data, error } = await (supabase')) {
      // Find the end of this query
      let j = i + 1;
      let openParens = 1;
      let foundEnd = false;
      
      while (j < lines.length && !foundEnd) {
        // Count parentheses
        for (const char of lines[j]) {
          if (char === '(') openParens++;
          if (char === ')') openParens--;
        }
        
        // Check if this line ends the query
        if (lines[j].trim().endsWith('.limit(limit) as any)') ||
            lines[j].trim().endsWith('.single() as any)') ||
            lines[j].trim().match(/\)\s*$/)) {
          foundEnd = true;
          
          // If we're missing closing parens, add them
          if (openParens > 0 && !lines[j].includes('as any)')) {
            lines[j] = lines[j].replace(/\s*$/, ' as any)');
            modified = true;
          }
        }
        j++;
      }
    }
  }
  
  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Find and fix all TypeScript files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.startsWith('.')) {
      scanDirectory(fullPath);
    } else if ((file.name.endsWith('.ts') || file.name.endsWith('.tsx')) && 
               !file.name.includes('.d.ts') &&
               (fullPath.includes('/queries/') || fullPath.includes('/seeds/'))) {
      fixFile(fullPath);
    }
  });
}

// Scan src directory
const srcPath = path.join(projectRoot, 'src');
if (fs.existsSync(srcPath)) {
  scanDirectory(srcPath);
}

console.log(`\n✨ Applied ${fixCount} fixes`);