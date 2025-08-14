#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

console.log('🔧 Fixing async/await syntax errors...\n');

// Find all files with the broken async pattern
const files = glob.sync('src/components/**/*.tsx');

let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix the broken async pattern
  if (content.includes('const result  = await supabaseQuery();')) {
    content = content.replace(
      /\/\/ const fetchData = async.*?\n.*?\n.*?\n.*?const result  = await supabaseQuery\(\);/gs,
      `// const fetchData = async () => {
    //   try {
    //     const result = await supabaseQuery();
    //     setData(result);`
    );
    
    fs.writeFileSync(file, content);
    fixed++;
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n✨ Fixed ${fixed} files with async syntax errors`);