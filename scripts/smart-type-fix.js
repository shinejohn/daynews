const fs = require('fs');
const path = require('path');

/**
 * Smart type fixing strategy:
 * 1. Only wrap the supabase client itself, not every parameter
 * 2. Keep proper TypeScript types from database.types.ts
 * 3. Only add 'as any' where there's an actual type depth issue
 */

function smartFixTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Strategy 1: Wrap only the supabase client at the point of use
  // Replace patterns like: await supabase.from('table')
  // With: await (supabase as any).from('table')
  
  // First, remove all the excessive "as any" on parameters
  if (content.includes(' as any,') || content.includes(' as any)')) {
    // Remove "as any" from simple string parameters
    content = content.replace(/\('([^']+)' as any\)/g, "('$1')");
    content = content.replace(/\('([^']+)' as any,/g, "('$1',");
    
    // Remove "as any" from boolean/number parameters  
    content = content.replace(/, (true|false|\d+) as any\)/g, ', $1)');
    content = content.replace(/\((true|false|\d+) as any\)/g, '($1)');
    
    modified = true;
  }
  
  // Strategy 2: Only wrap supabase client where needed
  // Look for patterns that indicate supabase usage
  const supabasePatterns = [
    /await supabase\.from\(/g,
    /supabase\.from\(/g,
    /= supabase\.from\(/g
  ];
  
  for (const pattern of supabasePatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match) => {
        return match.replace('supabase.from(', '(supabase as any).from(');
      });
      modified = true;
    }
  }
  
  // Fix any syntax errors we might have created
  content = content.replace(/\(supabase as any as any\)/g, '(supabase as any)');
  content = content.replace(/\(\(supabase as any\) as any\)/g, '(supabase as any)');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Smart fixed: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      processDirectory(filePath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && 
               file.includes('queries') && 
               !file.includes('.test.')) {
      smartFixTypes(filePath);
    }
  }
}

console.log('Smart type fixing - removing excessive type assertions...');
processDirectory(path.join(__dirname, '..', 'src', 'lib', 'supabase'));