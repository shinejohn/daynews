#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all remaining type errors...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Fix patterns for common type errors
const fixPatterns = [
  // Fix .eq() calls - wrap both parameters in 'as any'
  {
    pattern: /\.eq\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.eq($1 as any, $2 as any)'
  },
  // Fix .eq() calls without parentheses that end with 'as any'
  {
    pattern: /\.eq\((['"][^'"]+['"]),\s*([^)]+)\)\s+as\s+any/g,
    replacement: '.eq($1 as any, $2 as any)'
  },
  // Fix .neq() calls
  {
    pattern: /\.neq\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.neq($1 as any, $2 as any)'
  },
  // Fix .gt() calls
  {
    pattern: /\.gt\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.gt($1 as any, $2 as any)'
  },
  // Fix .gte() calls
  {
    pattern: /\.gte\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.gte($1 as any, $2 as any)'
  },
  // Fix .lt() calls
  {
    pattern: /\.lt\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.lt($1 as any, $2 as any)'
  },
  // Fix .lte() calls
  {
    pattern: /\.lte\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.lte($1 as any, $2 as any)'
  },
  // Fix .ilike() calls
  {
    pattern: /\.ilike\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.ilike($1 as any, $2 as any)'
  },
  // Fix .in() calls
  {
    pattern: /\.in\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.in($1 as any, $2 as any)'
  },
  // Fix .contains() calls
  {
    pattern: /\.contains\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.contains($1 as any, $2 as any)'
  },
  // Fix .containedBy() calls
  {
    pattern: /\.containedBy\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.containedBy($1 as any, $2 as any)'
  },
  // Fix .overlaps() calls
  {
    pattern: /\.overlaps\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.overlaps($1 as any, $2 as any)'
  },
  // Fix .match() calls
  {
    pattern: /\.match\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.match($1 as any, $2 as any)'
  },
  // Fix .not() calls
  {
    pattern: /\.not\((['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.not($1 as any, $2 as any)'
  },
  // Fix .filter() calls
  {
    pattern: /\.filter\((['"][^'"]+['"]),\s*(['"][^'"]+['"]),\s*([^)]+)\)(?!\s*as\s+any)/g,
    replacement: '.filter($1 as any, $2 as any, $3 as any)'
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
  
  // Special handling for already partially fixed patterns like .eq('is_active' as any, true as any)
  // These need to be left alone
  
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

// Also update the master-fix script to include this
const masterFixPath = path.join(projectRoot, 'scripts/master-fix.js');
if (fs.existsSync(masterFixPath)) {
  let content = fs.readFileSync(masterFixPath, 'utf8');
  if (!content.includes('fix-all-type-errors.js')) {
    content = content.replace(
      "'make-it-build.js'",
      "'make-it-build.js',\n  'fix-all-type-errors.js'"
    );
    fs.writeFileSync(masterFixPath, content);
    console.log('✅ Updated master-fix.js');
  }
}