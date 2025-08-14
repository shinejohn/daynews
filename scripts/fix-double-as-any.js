#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing double "as any" syntax errors...\n');

async function fixDoubleAsAny() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Fix pattern where we have "as any); as any"
    content = content.replace(/as\s+any\);\s*as\s+any/g, 'as any');
    if (content \!== fs.readFileSync(file, 'utf8')) {
      modified = true;
      totalFixed++;
    }

    // Fix pattern where we have "as any as any"
    content = content.replace(/as\s+any\s+as\s+any/g, 'as any');
    if (content \!== fs.readFileSync(file, 'utf8')) {
      modified = true;
      totalFixed++;
    }

    // Fix pattern where we have duplicate parentheses with as any
    content = content.replace(/\)\s*as\s+any\)\s*as\s+any/g, ') as any');
    if (content \!== fs.readFileSync(file, 'utf8')) {
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

fixDoubleAsAny().catch(console.error);
EOF < /dev/null
