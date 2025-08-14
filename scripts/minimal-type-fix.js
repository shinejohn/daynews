const fs = require('fs');
const path = require('path');

/**
 * Minimal type fixing - only wrap the entire query chain result
 * This preserves TypeScript checking on parameters while avoiding depth issues
 */
function minimalTypeFix(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Fix "await supabase.from(...)" patterns to "await (supabase.from(...) as any)"
  // This wraps the entire chain, not individual parameters
  
  // First, find all query patterns that need fixing
  const queryPatterns = [
    // Pattern: const { data, error } = await supabase.from('table')...
    /const\s+{\s*data[^}]*}\s*=\s*await\s+supabase\.from\([^)]+\)([\s\S]*?)(?=\n\s*(?:if|const|let|return|$))/g,
    // Pattern: const result = await supabase.from('table')...
    /const\s+\w+\s*=\s*await\s+supabase\.from\([^)]+\)([\s\S]*?)(?=\n\s*(?:if|const|let|return|$))/g,
    // Pattern: return await supabase.from('table')...
    /return\s+await\s+supabase\.from\([^)]+\)([\s\S]*?)(?=\n|;|$)/g
  ];
  
  for (const pattern of queryPatterns) {
    content = content.replace(pattern, (match) => {
      // Don't double-wrap
      if (match.includes('as any)')) {
        return match;
      }
      // Add parentheses and "as any" around the entire query
      return match.replace(/await\s+supabase/, 'await (supabase') + ' as any)';
    });
    modified = true;
  }
  
  // Clean up any "as any" on simple parameters that we don't need
  content = content.replace(/\('is_active'\s+as\s+any,\s*true\)/g, "('is_active', true)");
  content = content.replace(/\('is_active'\s+as\s+any,\s*false\)/g, "('is_active', false)");
  content = content.replace(/\('([^']+)'\s+as\s+any\)/g, "('$1')");
  
  // Keep "as any" only on values that might cause type issues
  // but remove from column names
  content = content.replace(/\.eq\('([^']+)'\s+as\s+any,/g, ".eq('$1',");
  content = content.replace(/\.order\('([^']+)'\s+as\s+any,/g, ".order('$1',");
  content = content.replace(/\.select\('([^']+)'\s+as\s+any\)/g, ".select('$1')");
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Minimal fix applied to: ${path.basename(filePath)}`);
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
               file.includes('queries')) {
      minimalTypeFix(filePath);
    }
  }
}

console.log('Applying minimal type fixes...');
processDirectory(path.join(__dirname, '..', 'src', 'lib', 'supabase'));