#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing lockfile issues...\n');

const projectRoot = path.join(__dirname, '..');

// Find all lockfiles
function findLockfiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      findLockfiles(path.join(dir, item.name), files);
    } else if (item.isFile() && (item.name === 'package-lock.json' || item.name === 'yarn.lock' || item.name === 'pnpm-lock.yaml')) {
      files.push(path.join(dir, item.name));
    }
  }
  
  return files;
}

// Check for lockfiles in parent directories too
const checkPaths = [
  projectRoot,
  path.dirname(projectRoot),
  path.dirname(path.dirname(projectRoot)),
  process.env.HOME || process.env.USERPROFILE
];

const allLockfiles = [];
checkPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    const lockfiles = findLockfiles(dir);
    allLockfiles.push(...lockfiles);
  }
});

// Filter to relevant lockfiles
const projectLockfile = path.join(projectRoot, 'package-lock.json');
const relevantLockfiles = allLockfiles.filter(file => {
  // Include if it's in project root or a parent directory
  return file.startsWith(projectRoot) || projectRoot.startsWith(path.dirname(file));
});

console.log(`Found ${relevantLockfiles.length} lockfiles:\n`);
relevantLockfiles.forEach(file => {
  const relative = path.relative(projectRoot, file);
  console.log(`  - ${relative.startsWith('..') ? file : relative}`);
});

// Determine the correct lockfile
let correctLockfile = projectLockfile;
const hasPackageLock = fs.existsSync(projectLockfile);
const hasYarnLock = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
const hasPnpmLock = fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'));

if (!hasPackageLock && !hasYarnLock && !hasPnpmLock) {
  console.log('\n⚠️  No lockfile found in project root.');
  console.log('Creating new package-lock.json...');
  
  try {
    execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Created package-lock.json');
  } catch (error) {
    console.error('❌ Failed to create lockfile:', error.message);
    process.exit(1);
  }
} else {
  // Remove conflicting lockfiles
  const toRemove = relevantLockfiles.filter(file => file !== correctLockfile);
  
  if (toRemove.length > 0) {
    console.log('\n🗑️  Removing conflicting lockfiles:');
    toRemove.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`  ✅ Removed ${path.relative(projectRoot, file)}`);
      } catch (error) {
        console.log(`  ⚠️  Could not remove ${file}: ${error.message}`);
      }
    });
  }
  
  // Ensure we're using npm
  if (hasYarnLock || hasPnpmLock) {
    console.log('\n📦 Converting to npm...');
    
    // Remove non-npm lockfiles
    if (hasYarnLock) fs.unlinkSync(path.join(projectRoot, 'yarn.lock'));
    if (hasPnpmLock) fs.unlinkSync(path.join(projectRoot, 'pnpm-lock.yaml'));
    
    // Generate npm lockfile
    try {
      execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
      console.log('✅ Created package-lock.json');
    } catch (error) {
      console.error('❌ Failed to create npm lockfile:', error.message);
      process.exit(1);
    }
  }
}

// Final check
console.log('\n📋 Final lockfile status:');
const finalLockfiles = findLockfiles(projectRoot);
if (finalLockfiles.length === 1 && finalLockfiles[0] === projectLockfile) {
  console.log('✅ Single lockfile in project root');
  console.log(`   ${path.relative(projectRoot, finalLockfiles[0])}`);
} else {
  console.log('⚠️  Multiple lockfiles still present:');
  finalLockfiles.forEach(file => {
    console.log(`   - ${path.relative(projectRoot, file)}`);
  });
}

console.log('\n✨ Lockfile cleanup complete!');