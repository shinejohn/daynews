#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Final syntax fixes...\n');

const projectRoot = path.join(__dirname, '..');

// Fix search.queries.ts files
const searchFiles = [
  'src/lib/supabase/queries/search.queries.ts',
  'src/lib/supabase/queries/queries/search.queries.ts'
];

searchFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix extra closing parentheses
    content = content.replace(/ as any\)/g, ' as any');
    
    // Ensure all query chains end properly
    content = content.replace(/query = query\.([\w]+)\(([^)]+)\) as any$/gm, 'query = query.$1($2) as any');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.basename(file)}`);
  }
});

console.log('\n✨ Final syntax fixes complete!');