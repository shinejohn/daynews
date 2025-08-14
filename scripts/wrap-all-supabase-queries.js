#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Wrapping all Supabase queries with type assertions...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Pattern to match Supabase queries that aren't already wrapped
const patterns = [
  // Pattern 1: const { data, error } = await supabase...
  {
    pattern: /const\s+{\s*data[^}]*}\s*=\s*await\s+supabase\s*\n?\s*\.from\([^)]+\)([^;]+)(?<!as\s+any\))\s*;/gs,
    replacement: (match, queryChain) => {
      return match.replace(/await\s+(supabase[^;]+);/, 'await ($1 as any);');
    }
  },
  // Pattern 2: return await supabase...
  {
    pattern: /return\s+await\s+supabase\s*\n?\s*\.from\([^)]+\)([^;]+)(?<!as\s+any\))\s*;/gs,
    replacement: (match) => {
      return match.replace(/await\s+(supabase[^;]+);/, 'await ($1 as any);');
    }
  },
  // Pattern 3: const query = supabase... (without await)
  {
    pattern: /const\s+query\s*=\s*supabase\s*\n?\s*\.from\([^)]+\)([^;]+)(?<!as\s+any)\s*;/gs,
    replacement: (match) => {
      if (!match.includes('as any')) {
        return match.replace(/(supabase[^;]+);/, '($1 as any);');
      }
      return match;
    }
  },
  // Pattern 4: let query = supabase... (without await)
  {
    pattern: /let\s+query\s*=\s*supabase\s*\n?\s*\.from\([^)]+\)([^;]+)(?<!as\s+any)\s*;/gs,
    replacement: (match) => {
      if (!match.includes('as any')) {
        return match.replace(/(supabase[^;]+);/, '($1 as any);');
      }
      return match;
    }
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  patterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  // Also ensure all .single() calls in Supabase queries are wrapped
  const singlePattern = /await\s+supabase([^;]+)\.single\(\)(?!\s*as\s+any)/g;
  content = content.replace(singlePattern, (match) => {
    return match.replace(/await\s+(supabase[^;]+\.single\(\))/, 'await ($1 as any)');
  });
  
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Find and fix all TypeScript files in queries directories
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.startsWith('.')) {
      scanDirectory(fullPath);
    } else if ((file.name.endsWith('.ts') || file.name.endsWith('.tsx')) && 
               !file.name.includes('.d.ts') &&
               (fullPath.includes('/queries/') || fullPath.includes('/seeds/') || fullPath.includes('cached-queries'))) {
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

// Update master-fix script
const masterFixPath = path.join(projectRoot, 'scripts/master-fix.js');
if (fs.existsSync(masterFixPath)) {
  let content = fs.readFileSync(masterFixPath, 'utf8');
  if (!content.includes('wrap-all-supabase-queries.js')) {
    content = content.replace(
      "'fix-supabase-type-depth.js'",
      "'fix-supabase-type-depth.js',\n  'wrap-all-supabase-queries.js'"
    );
    fs.writeFileSync(masterFixPath, content);
    console.log('✅ Updated master-fix.js');
  }
}