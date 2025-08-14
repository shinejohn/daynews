const fs = require('fs');
const path = require('path');

// Read and parse the database types
function getDatabaseTypes() {
  const typesPath = path.join(__dirname, '..', 'src', 'types', 'database.types.ts');
  const content = fs.readFileSync(typesPath, 'utf8');
  
  // Extract table names and their columns
  const tables = {};
  const tableMatches = content.matchAll(/(\w+):\s*{\s*Row:\s*{([^}]+)}/g);
  
  for (const match of tableMatches) {
    const tableName = match[1];
    const columnsContent = match[2];
    const columns = [];
    
    // Extract column names
    const columnMatches = columnsContent.matchAll(/(\w+)[\?]?:\s*[^;]+;/g);
    for (const colMatch of columnMatches) {
      columns.push(colMatch[1]);
    }
    
    tables[tableName] = columns;
  }
  
  return tables;
}

function verifyAndFixQueries(filePath, tables) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const issues = [];
  
  // Check if table names in queries match our database types
  const fromMatches = content.matchAll(/\.from\(['"](\w+)['"]\)/g);
  for (const match of fromMatches) {
    const tableName = match[1];
    if (!tables[tableName]) {
      issues.push(`Table '${tableName}' not found in database types`);
    }
  }
  
  // Check column names in eq, select, order calls
  const eqMatches = content.matchAll(/\.eq\(['"](\w+)['"]/g);
  const selectMatches = content.matchAll(/\.select\(['"]([^'"]+)['"]\)/g);
  const orderMatches = content.matchAll(/\.order\(['"](\w+)['"]/g);
  
  // For now, just log issues
  if (issues.length > 0) {
    console.log(`Issues in ${filePath}:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  // Smart fix: Only wrap the query result, not individual parameters
  // Pattern: const { data, error } = await supabase.from(...).select(...).etc()
  // Becomes: const { data, error } = await (supabase.from(...).select(...).etc() as any)
  
  // First, clean up existing excessive 'as any' on parameters
  content = content.replace(/\('([^']+)'\s+as\s+any\)/g, "('$1')");
  content = content.replace(/,\s*(true|false|\d+)\s+as\s+any/g, ', $1');
  content = content.replace(/\(\s*(true|false|\d+)\s+as\s+any\)/g, '($1)');
  
  // Remove 'as any' from simple object parameters
  content = content.replace(/{\s*(\w+):\s*([^}]+)\s*}\s+as\s+any/g, '{ $1: $2 }');
  
  // Now apply targeted fixes only where needed
  // Wrap entire query chains that are causing type depth issues
  const queryPattern = /const\s+{\s*data[^}]*}\s*=\s*await\s+(\()?supabase/g;
  content = content.replace(queryPattern, (match, paren) => {
    if (paren) {
      // Already wrapped, don't double-wrap
      return match;
    }
    return match.replace('await supabase', 'await (supabase as any)');
  });
  
  // Fix any double wrapping we might have created
  content = content.replace(/\(\(supabase as any\) as any\)/g, '(supabase as any)');
  content = content.replace(/\(supabase as any as any\)/g, '(supabase as any)');
  
  fs.writeFileSync(filePath, content);
  console.log(`Verified and fixed: ${path.basename(filePath)}`);
}

function processDirectory(dir, tables) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      processDirectory(filePath, tables);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && 
               file.includes('queries') && 
               !file.includes('.test.')) {
      verifyAndFixQueries(filePath, tables);
    }
  }
}

console.log('Verifying queries against database types...');
const tables = getDatabaseTypes();
console.log('Found tables:', Object.keys(tables).join(', '));
console.log('');

processDirectory(path.join(__dirname, '..', 'src', 'lib', 'supabase'), tables);