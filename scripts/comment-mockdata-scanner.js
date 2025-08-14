#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to identify mock data
const mockDataPatterns = [
  /mockdata=yes/i,
  /mockdataon=yes/i,
  /\/\/\s*Mock(?:Data|data|DATA)/,
  /const\s+mock\w+\s*=/,
  /generateMock\w+/,
  /setMock\w+/,
  /\/\/\s*MOCKDATA/,
  // Additional patterns
  /Mock\s+data/i,
  /mock.*=.*\[/i,
  /mock.*=.*\{/i,
  /\.setMock/,
  /useState.*mock/i,
  /sample\s*data/i,
  /dummy\s*data/i,
  /fake\s*data/i,
  /test\s*data.*=/i
];

// Patterns to comment out
const commentPatterns = [
  // setTimeout with mock data - more precise pattern
  {
    pattern: /(setTimeout\s*\(\s*\(\)\s*=>\s*\{)([\s\S]*?)(\},\s*\d+\))/g,
    handler: (match, start, content, end) => {
      // Check if content contains setState calls with data
      if (/set\w+\s*\(\s*[\[\{]/.test(content) || content.includes('Mock') || content.includes('mock')) {
        // Comment out the entire setTimeout block
        return match.split('\n').map((line, idx) => {
          return '    // ' + line;
        }).join('\n');
      }
      return match;
    }
  },
  // Mock data arrays - multiline
  {
    pattern: /(const\s+mock\w+\s*(?::\s*\w+(?:\[\])?)\s*=\s*\[)([\s\S]*?)(\];)/g,
    handler: (match, start, content, end) => {
      return '// ' + start + content.split('\n').map((line, idx) => {
        if (idx === 0) return line;
        return line.trim() ? '// ' + line : '//';
      }).join('\n') + '\n// ' + end;
    }
  },
  // Mock data objects - multiline
  {
    pattern: /(const\s+mock\w+\s*(?::\s*\w+)?\s*=\s*\{)([\s\S]*?)(\};)/g,
    handler: (match, start, content, end) => {
      return '// ' + start + content.split('\n').map((line, idx) => {
        if (idx === 0) return line;
        return line.trim() ? '// ' + line : '//';
      }).join('\n') + '\n// ' + end;
    }
  },
  // generateMock functions
  {
    pattern: /((?:const|function)\s+generateMock\w+[\s\S]*?)(\n\};|\n\})/g,
    handler: (match) => {
      return match.split('\n').map(line => '// ' + line).join('\n');
    }
  },
  // Direct setState calls with data
  {
    pattern: /(set\w+\s*\(\s*\[[\s\S]*?\]\s*\);)/g,
    handler: (match) => {
      // Only comment if it looks like mock data
      if (match.includes('{') || match.includes('"') || match.includes("'")) {
        return match.split('\n').map(line => '// ' + line).join('\n');
      }
      return match;
    }
  }
];

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file contains mock data
      const hasMockData = mockDataPatterns.some(pattern => pattern.test(content));
      
      if (hasMockData) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function commentOutMockData(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // Apply comment patterns
    commentPatterns.forEach(({ pattern, handler }) => {
      const newContent = content.replace(pattern, (...args) => {
        const result = handler(...args);
        if (result !== args[0]) {
          modified = true;
        }
        return result;
      });
      content = newContent;
    });

    // Special handling for mockdataon comment
    if (/mockdataon=yes/i.test(content)) {
      content = content.replace(/\/\/\s*mockdataon=yes/gi, '// mockdataon=no');
      modified = true;
    }

    // Look for specific setState patterns within useEffect or setTimeout
    const setStatePattern = /(\s+)(set\w+)\s*\(\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*\)/g;
    content = content.replace(setStatePattern, (match, indent, setState, data) => {
      // Check if this looks like mock data
      if (data.includes('"') || data.includes("'") || data.includes('{')) {
        // Check if already commented
        const lines = match.split('\n');
        if (!lines[0].trim().startsWith('//')) {
          modified = true;
          return lines.map(line => indent + '// ' + line.trim()).join('\n');
        }
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✓ Commented out mock data in: ${relativePath}`);
      return true;
    } else {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`⚠ No mock data patterns found in: ${relativePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function restoreMockData(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Restore mockdataon
    content = content.replace(/\/\/\s*mockdataon=no/gi, '// mockdataon=yes');
    
    // Remove comment markers from mock data
    // This is a simplified version - you might need more sophisticated logic
    content = content.replace(/^(\s*)\/\/\s+(.+)$/gm, '$1$2');
    
    fs.writeFileSync(filePath, content, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`✓ Restored mock data in: ${relativePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error restoring ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0] || 'comment';
const targetPath = args[1] || 'src/components';

console.log(`\n🔍 Mock Data Manager\n`);
console.log(`Command: ${command}`);
console.log(`Target: ${targetPath}\n`);

if (command === 'scan') {
  console.log('Scanning for files with mock data...\n');
  const filesWithMockData = scanDirectory(targetPath);
  
  console.log(`Found ${filesWithMockData.length} files with mock data:\n`);
  filesWithMockData.forEach(file => {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  });
  
} else if (command === 'comment') {
  console.log('Scanning and commenting out mock data...\n');
  const filesWithMockData = scanDirectory(targetPath);
  
  let successCount = 0;
  filesWithMockData.forEach(file => {
    if (commentOutMockData(file)) {
      successCount++;
    }
  });
  
  console.log(`\n✅ Completed! Modified ${successCount} out of ${filesWithMockData.length} files.`);
  
  // Show files that couldn't be processed
  const failedFiles = filesWithMockData.length - successCount;
  if (failedFiles > 0) {
    console.log(`\n⚠️  ${failedFiles} files couldn't be processed. These may need manual review.`);
  }
  
} else if (command === 'restore') {
  console.log('Scanning and restoring mock data...\n');
  const filesWithMockData = scanDirectory(targetPath);
  
  let successCount = 0;
  filesWithMockData.forEach(file => {
    if (restoreMockData(file)) {
      successCount++;
    }
  });
  
  console.log(`\n✅ Completed! Restored ${successCount} out of ${filesWithMockData.length} files.`);
  
} else {
  console.log('Usage: node comment-mockdata-scanner.js [command] [path]');
  console.log('\nCommands:');
  console.log('  scan     - Scan for files containing mock data');
  console.log('  comment  - Comment out mock data (default)');
  console.log('  restore  - Restore commented mock data');
  console.log('\nExamples:');
  console.log('  node comment-mockdata-scanner.js scan');
  console.log('  node comment-mockdata-scanner.js comment src/components');
  console.log('  node comment-mockdata-scanner.js restore src/components/photos');
}

console.log('\n');