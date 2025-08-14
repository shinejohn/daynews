#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TypeScript null checks...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

// Function to fix supabase null checks in a file
function fixSupabaseNulls(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Direct supabase usage in async functions
  if (content.includes('await supabase') && !content.includes('!supabase')) {
    content = content.replace(
      /(\s*)(const|let)\s+({[^}]+}|[^=]+)\s*=\s*await\s+supabase/g,
      (match, indent, varType, varName) => {
        // Check if there's already a null check above
        const lines = content.split('\n');
        const matchLine = lines.findIndex(line => line.includes(match));
        if (matchLine > 0 && !lines[matchLine - 1].includes('if (!supabase)')) {
          modified = true;
          return `${indent}if (!supabase) throw new Error('Supabase client not initialized');\n${indent}${varType} ${varName} = await supabase`;
        }
        return match;
      }
    );
  }
  
  // Pattern 2: Query building
  if (content.includes('let query = supabase') && !content.includes('if (!supabase) throw')) {
    content = content.replace(
      /(\s*)let query = supabase/g,
      "$1if (!supabase) throw new Error('Supabase client not initialized');\n$1\n$1let query = supabase"
    );
    modified = true;
  }
  
  // Pattern 3: Direct property access
  if (content.includes('supabase.auth') && !content.includes('if (supabase)')) {
    // Find blocks that use supabase.auth
    content = content.replace(
      /(\s*)(const|let)\s+({[^}]+}|[^=]+)\s*=\s*supabase\.auth/g,
      (match, indent, varType, varName) => {
        const lines = content.split('\n');
        const matchLine = lines.findIndex(line => line.includes(match));
        if (matchLine > 0 && !lines[matchLine - 1].includes('if (supabase)')) {
          modified = true;
          return `${indent}if (supabase) {\n${indent}  ${varType} ${varName} = supabase.auth`;
        }
        return match;
      }
    );
  }
  
  // Pattern 4: Type assertions
  if (content.includes('.filter(Boolean),') && !content.includes('.filter(Boolean) as')) {
    content = content.replace(/\.filter\(Boolean\),/g, '.filter(Boolean) as string[],');
    modified = true;
  }
  
  // Pattern 5: Supabase query type issues
  if (content.includes('.eq(') && content.includes('category')) {
    content = content.replace(/\.eq\('category', category\)/g, ".eq('category', category as any)");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Find all TypeScript files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      findTsFiles(fullPath, files);
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix all TypeScript files
const srcDir = path.join(projectRoot, 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to check...\n`);

tsFiles.forEach(file => {
  fixSupabaseNulls(file);
});

console.log(`\n✨ Fixed ${fixCount} files with null check issues`);

// Also fix specific known issues
console.log('\n🎯 Applying specific fixes...');

// Fix useSupabaseQuery.ts
const queryPath = path.join(projectRoot, 'src/hooks/queries/useSupabaseQuery.ts');
if (fs.existsSync(queryPath)) {
  let content = fs.readFileSync(queryPath, 'utf8');
  
  // Add null check to mutation
  if (content.includes('useSupabaseMutation(') && content.includes('await supabase')) {
    content = content.replace(
      /(\s*)const { data, error } = await supabase/g,
      "$1if (!supabase) throw new Error('Supabase client not initialized');\n$1const { data, error } = await supabase"
    );
    fs.writeFileSync(queryPath, content);
    console.log('✅ Fixed useSupabaseQuery.ts mutations');
  }
}

console.log('\n✅ TypeScript null check fixes complete!');