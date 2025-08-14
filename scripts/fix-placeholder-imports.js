#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

// Get all page.tsx files
const pageFiles = glob.sync('src/app/**/page.tsx');

pageFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix commented imports to use placeholder components
  content = content.replace(
    /\/\/ import (\w+) from ['"]@\/components\/\w+['"] \/\/ Component not found/g,
    (match, componentName) => {
      return `import ${componentName} from '@/components/pages/${componentName}'`;
    }
  );
  
  fs.writeFileSync(file, content);
});

console.log('✅ Fixed placeholder imports');