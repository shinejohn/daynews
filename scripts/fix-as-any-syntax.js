const fs = require('fs');
const path = require('path');

function fixAsAnySyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix pattern: "as any.from" -> "as any).from"
  if (content.includes('as any.from')) {
    content = content.replace(/as any\.from/g, 'as any).from');
    modified = true;
  }
  
  // Fix pattern where we have misplaced parentheses
  if (content.includes('await (supabase as any).from')) {
    // This is already correct, no need to change
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixAsAnySyntax(filePath);
    }
  }
}

// Process src directory
processDirectory(path.join(__dirname, '..', 'src'));