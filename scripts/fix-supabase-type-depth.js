#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Supabase type depth issues...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Pattern to find Supabase query chains
const supabaseQueryPattern = /await\s+supabase\s*\n?\s*\.from\([^)]+\)[^;]+;/gs;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find all Supabase queries
  const matches = content.matchAll(supabaseQueryPattern);
  
  for (const match of matches) {
    const query = match[0];
    
    // Skip if already wrapped with 'as any'
    if (query.includes('as any)')) {
      continue;
    }
    
    // Extract the query without the semicolon
    const queryWithoutSemi = query.replace(/;$/, '');
    
    // Wrap the entire query with (... as any)
    const fixedQuery = queryWithoutSemi.replace(
      /await\s+(supabase[\s\S]+)$/,
      'await ($1 as any);'
    );
    
    if (fixedQuery !== query) {
      content = content.replace(query, fixedQuery);
      modified = true;
    }
  }
  
  // Also fix patterns like: const { data, error } = await query
  const queryVarPattern = /const\s+{\s*data[^}]*}\s*=\s*await\s+(?!.*as\s+any)([^;]+);/g;
  content = content.replace(queryVarPattern, (match, query) => {
    if (!query.includes('as any')) {
      return match.replace(query, `(${query.trim()} as any)`);
    }
    return match;
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
  if (!content.includes('fix-supabase-type-depth.js')) {
    content = content.replace(
      "'fix-all-type-errors.js'",
      "'fix-all-type-errors.js',\n  'fix-supabase-type-depth.js'"
    );
    fs.writeFileSync(masterFixPath, content);
    console.log('✅ Updated master-fix.js');
  }
}