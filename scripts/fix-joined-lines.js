#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing joined lines in query files...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Pattern to fix joined lines
const patterns = [
  // Fix ) as any)if (error) pattern
  {
    pattern: /\)\s*as\s+any\)if\s*\(error\)/g,
    replacement: ') as any);\n    if (error)'
  },
  // Fix new Date( as any) pattern
  {
    pattern: /new\s+Date\(\s+as\s+any\)/g,
    replacement: 'new Date()'
  },
  // Fix missing semicolon after as any)
  {
    pattern: /as\s+any\)\s*\n\s*if\s*\(error\)/g,
    replacement: 'as any);\n    if (error)'
  },
  // Fix "No newline at end of file" appearing in middle of code
  {
    pattern: /\n\s*No newline at end of file\s*\n/g,
    replacement: '\n'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  patterns.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  if (content !== originalContent) {
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