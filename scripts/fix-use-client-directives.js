#!/usr/bin/env node

/**
 * Add 'use client' directive to components that use client-side hooks
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Adding use client directives where needed...\n');

function fixUseClient(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.next' &&
        !entry.name.startsWith('.')) {
      fixUseClient(path.join(dir, entry.name));
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) && 
               !entry.name.includes('.original.')) {
      const filePath = path.join(dir, entry.name);
      fixFileDirectives(filePath);
    }
  });
}

function fixFileDirectives(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if it uses client-side hooks/features
  const needsUseClient = 
    content.includes('useLocationDetection') ||
    content.includes('useState(') ||
    content.includes('useEffect(') ||
    content.includes('useCallback(') ||
    content.includes('useMemo(') ||
    content.includes('useRouter(') ||
    content.includes('onClick') ||
    content.includes('onChange') ||
    content.includes('onSubmit');
  
  // Check if it already has 'use client'
  const hasUseClient = content.startsWith("'use client'") || content.startsWith('"use client"');
  
  if (needsUseClient && !hasUseClient) {
    // Add 'use client' at the beginning
    content = "'use client';\n" + content;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added 'use client' to: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Run the fix
fixUseClient(path.join(projectRoot, 'src'));

console.log(`\n✨ Added 'use client' directive to ${fixCount} files!`);