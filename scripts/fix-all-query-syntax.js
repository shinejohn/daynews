const fs = require('fs');
const path = require('path');

/**
 * Comprehensive query syntax fixer
 * Fixes all common syntax errors in query files
 */
function fixQuerySyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix 1: Missing closing parentheses in .map() calls
  content = content.replace(/\.map\(([^)]+)\)\s*$/gm, (match, inner) => {
    if (!match.includes('))')) {
      modified = true;
      return `.map(${inner}))`
    }
    return match;
  });
  
  // Fix 2: Fix queries that are missing await wrapper
  content = content.replace(/const\s+{\s*data[^}]*}\s*=\s+supabase/g, (match) => {
    if (!match.includes('await')) {
      modified = true;
      return match.replace('= supabase', '= await (supabase as any)');
    }
    return match;
  });
  
  // Fix 3: Fix missing closing parentheses in query chains
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line ends with a method call missing closing paren
    if (line.match(/\.(in|eq|neq|gt|gte|lt|lte|contains|ilike)\([^)]+$/)) {
      lines[i] = line + ')';
      modified = true;
    }
    
    // Check for "as any)if" pattern and fix it
    if (line.includes('as any)if')) {
      lines[i] = line.replace('as any)if', '\n    if');
      modified = true;
    }
  }
  
  if (modified) {
    content = lines.join('\n');
  }
  
  // Fix 4: Ensure all query chains have proper structure
  content = content.replace(/\)\s*\n\s*if\s*\(/g, ')\n    if (');
  
  // Fix 5: Fix double "as any" patterns
  content = content.replace(/as\s+any\s*\)\s*as\s+any/g, 'as any)');
  
  // Fix 6: Fix incomplete destructuring
  content = content.replace(/const\s+{\s*data,\s*error\s*}\s*=\s*await\s+\(/g, 
    'const { data, error } = await (');
  
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed syntax in: ${path.basename(filePath)}`);
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
      fixQuerySyntax(filePath);
    }
  }
}

console.log('Fixing all query syntax issues...');
processDirectory(path.join(__dirname, '..', 'src', 'lib', 'supabase'));
console.log('Done!');