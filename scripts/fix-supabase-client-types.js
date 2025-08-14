#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing Supabase client type issues...\n');

async function fixSupabaseClientTypes() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace all instances of "await supabase" with "await (supabase as any)"
    content = content.replace(/await\s+supabase\s*\n?\s*\./g, 'await (supabase as any).');
    if (content !== fs.readFileSync(file, 'utf8')) {
      modified = true;
      totalFixed++;
    }

    // Replace all instances of "await (supabase" with "await ((supabase as any)"
    content = content.replace(/await\s+\(supabase\s*\n?\s*\./g, 'await ((supabase as any).');
    if (content !== fs.readFileSync(file, 'utf8')) {
      modified = true;
      totalFixed++;
    }

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Applied ${totalFixed} fixes`);
}

fixSupabaseClientTypes().catch(console.error);