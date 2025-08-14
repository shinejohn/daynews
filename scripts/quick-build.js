#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Quick Build - Creating placeholder components for missing imports\n');

const projectRoot = path.join(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src/components');

// Ensure components directory exists
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Read build errors to find missing components
const missingComponents = new Set();

// Function to scan for missing imports
function scanForMissingImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      scanForMissingImports(fullPath);
    } else if (file.name === 'page.tsx' || file.name === 'page.jsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importMatches = content.matchAll(/import\s+{?\s*(\w+)\s*}?\s+from\s+['"]@\/components\/(\w+)['"]/g);
      
      for (const match of importMatches) {
        const componentName = match[2] || match[1];
        missingComponents.add(componentName);
      }
    }
  }
}

// Scan app directory
const appDir = path.join(projectRoot, 'src/app');
scanForMissingImports(appDir);

console.log(`Found ${missingComponents.size} missing components\n`);

// Create placeholder components
let created = 0;
missingComponents.forEach(componentName => {
  const componentPath = path.join(componentsDir, `${componentName}.tsx`);
  
  if (!fs.existsSync(componentPath)) {
    const componentContent = `'use client';

import React from 'react';

export function ${componentName}() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ${componentName.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <p className="text-gray-600 mb-6">
            This is a placeholder component. The actual implementation will be added soon.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Component:</strong> ${componentName}<br />
              <strong>Status:</strong> Placeholder for quick build<br />
              <strong>Location:</strong> src/components/${componentName}.tsx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Also export as default for compatibility
export default ${componentName};
`;
    
    fs.writeFileSync(componentPath, componentContent);
    console.log(`✅ Created placeholder: ${componentName}.tsx`);
    created++;
  }
});

console.log(`\n✨ Created ${created} placeholder components`);

// Fix lockfiles
console.log('\n🔧 Fixing lockfiles...');
try {
  execSync('node scripts/fix-lockfiles.js', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️  Lockfile fix encountered issues');
}

// Create missing directories
const requiredDirs = [
  'src/lib/supabase/queries',
  'public/images',
  'src/types'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Create minimal Supabase queries if missing
const queriesPath = path.join(projectRoot, 'src/lib/supabase/queries/index.ts');
if (!fs.existsSync(queriesPath)) {
  const queriesContent = `// Placeholder queries file
export const queries = {
  // Add your queries here
};
`;
  fs.writeFileSync(queriesPath, queriesContent);
  console.log('📝 Created placeholder queries file');
}

// Run master fix first
try {
  execSync('node scripts/master-fix.js', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️  Master fix had issues');
}

// Fix common TypeScript issues
console.log('\n🔧 Fixing common TypeScript issues...');

// Run comprehensive null fixes first
try {
  execSync('node scripts/fix-typescript-nulls.js', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️  Some TypeScript fixes may have failed');
}

// Fix useSupabaseQuery.ts if it exists
const supabaseQueryPath = path.join(projectRoot, 'src/hooks/queries/useSupabaseQuery.ts');
if (fs.existsSync(supabaseQueryPath)) {
  let content = fs.readFileSync(supabaseQueryPath, 'utf8');
  
  // Fix filter(Boolean) type issue
  if (content.includes('.filter(Boolean),') && !content.includes('.filter(Boolean) as string[]')) {
    content = content.replace(/\.filter\(Boolean\),/g, '.filter(Boolean) as string[],');
  }
  
  // Fix supabase null check in query functions
  if (content.includes('let query = supabase') && !content.includes('if (!supabase) throw')) {
    content = content.replace(
      /(\s*)let query = supabase/g,
      "$1if (!supabase) throw new Error('Supabase client not initialized');\n$1\n$1let query = supabase"
    );
  }
  
  fs.writeFileSync(supabaseQueryPath, content);
  console.log('✅ Fixed useSupabaseQuery.ts issues');
}

// Fix providers.tsx if it exists
const providersPath = path.join(projectRoot, 'src/app/providers.tsx');
if (fs.existsSync(providersPath)) {
  let providersContent = fs.readFileSync(providersPath, 'utf8');
  
  // Fix supabase null check
  if (providersContent.includes('const { data: authListener } = supabase.auth.onAuthStateChange') &&
      !providersContent.includes('if (supabase)')) {
    providersContent = providersContent.replace(
      /(\s*)const { data: authListener } = supabase\.auth\.onAuthStateChange/,
      '$1if (supabase) {\n$1  const { data: authListener } = supabase.auth.onAuthStateChange'
    );
    
    // Add closing brace if needed
    const authListenerBlock = providersContent.indexOf('authListener?.subscription.unsubscribe()');
    if (authListenerBlock > -1) {
      const nextLine = providersContent.indexOf('\n', authListenerBlock);
      providersContent = providersContent.slice(0, nextLine) + '\n    }' + providersContent.slice(nextLine);
    }
    
    fs.writeFileSync(providersPath, providersContent);
    console.log('✅ Fixed providers.tsx null check');
  }
}

// Try to build
console.log('\n🏗️  Attempting build...\n');

try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  console.log('\n✅ Build successful!');
  
  console.log('\n📋 Next steps:');
  console.log('1. Review the build output in .next/');
  console.log('2. Test locally: npm run start');
  console.log('3. Deploy to Vercel: vercel --prod');
  console.log('\n⚠️  Note: This build uses placeholder components.');
  console.log('   Run the full Magic Patterns converter for complete functionality.');
  
} catch (error) {
  console.error('\n❌ Build failed. Check the error messages above.');
  console.log('\nTroubleshooting:');
  console.log('1. Run "npm run type-check" to see TypeScript errors');
  console.log('2. Check for remaining import issues');
  console.log('3. Ensure all dependencies are installed');
  process.exit(1);
}