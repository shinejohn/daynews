#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing query syntax errors...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Fix patterns
const fixPatterns = [
  // Fix missing parentheses in await statements
  {
    pattern: /await\s+\(supabase([^)]+)\s+(?!as\s+any\))/g,
    replacement: 'await (supabase$1 as any)'
  },
  // Fix misplaced parentheses with .single() as any)
  {
    pattern: /\.single\(\)\s+as\s+any\)/g,
    replacement: '.single() as any)'
  },
  // Fix double closing parentheses
  {
    pattern: /as\s+any\)\)/g,
    replacement: 'as any)'
  },
  // Fix await supabase without parentheses when it should have them
  {
    pattern: /await\s+supabase([^(][^;]+)\.single\(\)\s+as\s+any\)/g,
    replacement: 'await (supabase$1.single() as any)'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixPatterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
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
    } else if ((file.name.endsWith('.ts') || file.name.endsWith('.tsx')) && !file.name.includes('.d.ts')) {
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