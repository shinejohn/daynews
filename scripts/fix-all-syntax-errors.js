#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing all syntax errors...\n');

async function fixAllSyntaxErrors() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    const originalContent = content;

    // Fix extra ); patterns
    content = content.replace(/\)\s*as\s+any\)/g, ') as any');
    
    // Fix missing closing parentheses on .single() as any);
    content = content.replace(/\.single\(\)\s*as\s+any\);/g, '.single() as any)');
    
    // Fix lines with as any that are missing closing parentheses
    content = content.replace(/await\s+supabase\.from\((.*?)\)([\s\S]*?)as\s+any\s*\n/g, (match, table, queryChain) => {
      if (!match.includes(');\n') && !match.includes(') as any\n')) {
        return match.replace(/as\s+any\s*\n/, ' as any)\n');
      }
      return match;
    });

    // Fix extra "as any" after single parentheses
    content = content.replace(/\)\s+as\s+any\s+as\s+any/g, ') as any');

    // Fix extra semicolons in the middle of chains
    content = content.replace(/as\s+any\);\s*as\s+any/g, ' as any');

    // Fix lines ending with .limit(X) and missing closing
    content = content.replace(/\.limit\(([^)]+)\)\s*as\s+any\s*$/gm, '.limit($1) as any)');

    if (content !== originalContent) {
      modified = true;
      totalFixed++;
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Applied ${totalFixed} fixes`);
}

fixAllSyntaxErrors().catch(console.error);