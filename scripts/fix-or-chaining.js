#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing multiple .or() chaining issues...\n');

async function fixOrChaining() {
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });

  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Fix multiple .or() calls - combine them into a single .or()
    // This pattern finds sequences of .or() calls and combines them
    const orPattern = /\.or\(`([^`]+)`\)\s*\.or\(`([^`]+)`\)/g;
    content = content.replace(orPattern, (match, condition1, condition2) => {
      modified = true;
      totalFixed++;
      return `.or(\`${condition1},${condition2}\`)`;
    });

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Applied ${totalFixed} fixes`);
}

fixOrChaining().catch(console.error);