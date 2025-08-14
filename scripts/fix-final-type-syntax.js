#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Final comprehensive syntax fix...\n');

async function fixFinalTypeSyntax() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    const originalContent = content;

    // Fix patterns where "as any" is missing closing parenthesis
    content = content.replace(/(\w+\([^)]*\)\s+as\s+any)\s*\n/g, '$1)\n');
    
    // Fix patterns where we have method calls ending with "as any" without closing paren
    content = content.replace(/\.(gte|lte|eq|neq|gt|lt|in|contains|ilike|like)\s*\(([^)]+)\s+as\s+any\s*\n/g, '.$1($2 as any)\n');
    
    // Fix patterns where we're missing closing parenthesis on entire query chain
    content = content.replace(/await\s+\((supabase\s+as\s+any)\)([\s\S]*?)\.limit\((\d+)\)\s*$/gm, 
      'await ($1)$2.limit($3)');

    // Fix extra closing parentheses
    content = content.replace(/\)\s*\)\s*as\s+any/g, ') as any');

    // Fix missing closing parentheses on single() calls
    content = content.replace(/\.single\(\)\s+as\s+any\s*$/gm, '.single() as any)');

    // Fix method parameters that have "as any" without proper parentheses
    content = content.replace(/,\s*([^,)]+)\s+as\s+any\s*\n/g, ', $1 as any)\n');

    if (content !== originalContent) {
      modified = true;
      totalFixed++;
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Applied ${totalFixed} fixes`);
}

fixFinalTypeSyntax().catch(console.error);