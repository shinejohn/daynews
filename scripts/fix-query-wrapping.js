#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing query wrapping issues...\n');

async function fixQueryWrapping() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Fix pattern where we have await (supabase.from(...) as any);
    // Should be: await supabase.from(...) as any
    content = content.replace(
      /await\s*\(supabase\.from\(([^)]+)\)([\s\S]*?)\s+as\s+any\);/g,
      (match, tableName, queryChain) => {
        // Check if this is a multi-line query
        if (queryChain.includes('\n')) {
          modified = true;
          totalFixed++;
          return `await supabase.from(${tableName})${queryChain} as any`;
        }
        return match;
      }
    );

    // Fix pattern where we have await (supabase.from(...) without proper wrapping
    content = content.replace(
      /await\s*\(supabase\s*\n?\s*\.from\(([^)]+)\)([\s\S]*?)(?=\n\s*if\s*\(error\))/g,
      (match, tableName, queryChain) => {
        // Check if it already has "as any" at the end
        if (!queryChain.trim().endsWith('as any')) {
          modified = true;
          totalFixed++;
          return `await supabase\n      .from(${tableName})${queryChain} as any`;
        }
        return match;
      }
    );

    // Fix missing parentheses in query chains
    content = content.replace(
      /const\s*{\s*data,\s*error\s*}\s*=\s*await\s*\(supabase/g,
      'const { data, error } = await supabase'
    );

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Applied ${totalFixed} fixes`);
}

fixQueryWrapping().catch(console.error);