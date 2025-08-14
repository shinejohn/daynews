#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Comprehensive Supabase syntax fix...\n');

async function fixAllSupabaseSyntax() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    const originalContent = content;

    // Fix double "as any)" patterns
    content = content.replace(/as\s+any\)\s*as\s+any/g, ' as any');
    
    // Fix "as any);" -> "as any)"
    content = content.replace(/as\s+any\);/g, ' as any)');
    
    // Fix patterns like ".limit(20) as any)" - should not have "as any" on the outside
    content = content.replace(/\)\s+as\s+any\)/g, ')');
    
    // Fix patterns like "as any) as any)" 
    content = content.replace(/as\s+any\)\s+as\s+any\)/g, ' as any)');
    
    // Fix patterns like ".order('created_at', { ascending: false }) as any)" at the end of a query
    // that should just end without extra parenthesis
    content = content.replace(/\.order\([^)]+\)\s+as\s+any\)\s*\n/g, '.order($1)\n');
    
    // Fix missing closing parentheses on lines ending with "as any" followed by if/return/etc
    content = content.replace(/(\s+as\s+any)\s*\n(\s*)(if|return|const|let|var|throw)/g, '$1)\n$2$3');
    
    // Remove extra closing parentheses after "as any)"
    content = content.replace(/as\s+any\)\)/g, ' as any)');
    
    // Fix double parentheses in await statements
    content = content.replace(/await\s+\(\((supabase\s+as\s+any)\)/g, 'await ($1');
    
    // Fix hanging "as any" without proper context
    content = content.replace(/\)\s*as\s+any\s*$/gm, ')');

    if (content !== originalContent) {
      modified = true;
      totalFixed++;
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Applied ${totalFixed} fixes`);
}

fixAllSupabaseSyntax().catch(console.error);