#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Final Supabase query fixes...\n');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix pattern 1: .select('*') as any) followed by more methods
  content = content.replace(/\.select\('.*?'\)\s*as\s*any\)\s*\n\s*\./g, ".select('*')\n      .");
  
  // Fix pattern 2: .from('table') as any) followed by more methods
  content = content.replace(/\.from\('.*?'\)\s*as\s*any\)\s*\n\s*\./g, function(match) {
    const table = match.match(/\.from\('(.*?)'\)/)[1];
    return `.from('${table}')\n      .`;
  });
  
  // Fix pattern 3: Add missing closing parentheses and as any at the end
  const lines = content.split('\n');
  let inQuery = false;
  let queryStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect query start
    if (line.includes('const { data, error } = await (supabase')) {
      inQuery = true;
      queryStart = i;
    }
    
    // If we're in a query and hit the error check, close it properly
    if (inQuery && line.trim().startsWith('if (error)')) {
      // Check if previous line has proper closing
      const prevLine = lines[i - 1];
      if (!prevLine.includes('as any)') && !prevLine.includes(')')) {
        // Add closing on previous line
        lines[i - 1] = lines[i - 1] + ' as any)';
        modified = true;
      }
      inQuery = false;
    }
  }
  
  if (modified || content !== lines.join('\n')) {
    content = lines.join('\n');
    
    // Final cleanup - remove double as any
    content = content.replace(/as\s+any\s+as\s+any/g, 'as any');
    
    // Fix broken chains where as any) appears mid-chain
    content = content.replace(/as\s+any\)\s*\.(eq|neq|gt|gte|lt|lte|order|limit|single|select|from)/g, '\n      .$1');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Find and fix all TypeScript files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.startsWith('.')) {
      scanDirectory(fullPath);
    } else if ((file.name.endsWith('.ts') || file.name.endsWith('.tsx')) && 
               !file.name.includes('.d.ts') &&
               (fullPath.includes('/queries/') || fullPath.includes('/seeds/'))) {
      fixFile(fullPath);
    }
  });
}

// Scan src directory
const srcPath = path.join(projectRoot, 'src');
if (fs.existsSync(srcPath)) {
  scanDirectory(srcPath);
}

console.log(`\n✨ Applied ${fixCount} fixes`);