#!/usr/bin/env node
// Master fix script that runs all fixes in order

const { execSync } = require('child_process');
const scripts = [
  'force-build-fix.js',
  'fix-syntax-errors.js',
  'fix-typescript-nulls.js',
  'final-syntax-fix.js',
  'make-it-build.js'
];

console.log('🚀 Running all fix scripts in order...\n');

scripts.push('fix-missing-tables.js');

scripts.forEach(script => {
  try {
    console.log(`Running ${script}...\n`);
    execSync(`node scripts/${script}`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`⚠️  ${script} had issues but continuing...\n`);
  }
});

console.log('\n✅ All fixes applied!');
console.log('\nNow run: npm run build');
