#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing syntax errors from force-build-fix...\n');

const projectRoot = path.join(__dirname, '..');

// Fix files with syntax errors
const filesToFix = [
  'src/lib/supabase/queries/search.queries.ts',
  'src/lib/supabase/queries/queries/search.queries.ts',
  'src/lib/supabase/cached-queries.ts',
  'src/hooks/queries/useSupabaseQuery.ts'
];

filesToFix.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unclosed parentheses
    content = content.replace(/query = \(query\./g, 'query = query.');
    content = content.replace(/\) as any\) as any/g, ') as any');
    
    // Fix broken query chains
    content = content.replace(/\.range\(offset, offset \+ params\.limit - 1\)$/gm, '.range(offset, offset + params.limit - 1) as any)');
    content = content.replace(/\.or\(`([^`]+)`\)$/gm, '.or(`$1`) as any)');
    
    // Fix .toISOString() calls
    content = content.replace(/new Date\(\) as any\.toISOString\(\)/g, 'new Date().toISOString() as any');
    
    // Fix queryFn typo
    content = content.replace('await (query as any)Fn();', 'await queryFn();');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.basename(file)}`);
  }
});

console.log('\n✨ Syntax errors fixed!');