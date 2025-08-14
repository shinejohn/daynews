#!/usr/bin/env node

/**
 * Magic Patterns to Next.js Converter
 * 
 * This script properly converts Magic Patterns components to work with Next.js
 * while preserving their original structure and design patterns.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MAGIC_PATTERNS_DIR = '/Users/johnshine/Dropbox/Fibonacco/Day-News/Code/magic/src/components';
const TARGET_DIR = path.join(__dirname, '../src/components');

// Conversion rules
const CONVERSIONS = {
  imports: [
    // Convert React Router imports to Next.js
    { from: /import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"]/g, to: "import Link from 'next/link'" },
    { from: /import\s+{\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"]/g, to: "import { useRouter } from 'next/navigation'" },
    { from: /import\s+{\s*useLocation\s*}\s+from\s+['"]react-router-dom['"]/g, to: "import { usePathname } from 'next/navigation'" },
    { from: /import\s+{\s*useParams\s*}\s+from\s+['"]react-router-dom['"]/g, to: "import { useParams } from 'next/navigation'" },
    { from: /import\s+{\s*useNavigate\s*,\s*useLocation\s*}\s+from\s+['"]react-router-dom['"]/g, to: "import { useRouter, usePathname } from 'next/navigation'" },
  ],
  
  code: [
    // Convert navigate usage
    { from: /const\s+navigate\s*=\s*useNavigate\(\)/g, to: "const router = useRouter()" },
    { from: /navigate\(/g, to: "router.push(" },
    
    // Convert location usage
    { from: /const\s+location\s*=\s*useLocation\(\)/g, to: "const pathname = usePathname()" },
    { from: /location\.pathname/g, to: "pathname" },
    { from: /location\.state/g, to: "/* TODO: Convert location.state to searchParams or context */" },
    
    // Convert Link props
    { from: /<Link\s+to=/g, to: "<Link href=" },
  ],
  
  // Add 'use client' directive for components that need it
  clientComponents: [
    'useState',
    'useEffect',
    'useRouter',
    'usePathname',
    'onClick',
    'onChange',
    'onSubmit',
  ]
};

// Helper function to check if component needs 'use client'
function needsUseClient(content) {
  return CONVERSIONS.clientComponents.some(hook => content.includes(hook));
}

// Helper function to apply conversions
function convertContent(content, filePath) {
  let converted = content;
  
  // Apply import conversions
  CONVERSIONS.imports.forEach(rule => {
    converted = converted.replace(rule.from, rule.to);
  });
  
  // Apply code conversions
  CONVERSIONS.code.forEach(rule => {
    converted = converted.replace(rule.from, rule.to);
  });
  
  // Add 'use client' directive if needed
  if (needsUseClient(converted) && !converted.includes("'use client'")) {
    converted = "'use client';\n" + converted;
  }
  
  // Add comment about the conversion
  if (!converted.includes('// Converted from Magic Patterns')) {
    const lines = converted.split('\n');
    const firstImportIndex = lines.findIndex(line => line.includes('import'));
    if (firstImportIndex !== -1) {
      lines.splice(firstImportIndex, 0, '// Converted from Magic Patterns');
      converted = lines.join('\n');
    }
  }
  
  return converted;
}

// Helper function to create data integration wrapper
function createDataWrapper(componentName, originalContent) {
  // Check if component fetches its own data (has mock data)
  const hasMockData = originalContent.includes('// Mock') || originalContent.includes('mock') || originalContent.includes('const data =');
  
  if (!hasMockData) {
    return null;
  }
  
  const wrapperContent = `'use client';
// Data wrapper for ${componentName}
// This wrapper integrates Supabase data while preserving the Magic Patterns component structure

import React, { useEffect, useState } from 'react';
import { ${componentName} as Original${componentName} } from './${componentName}.original';
// TODO: Import appropriate Supabase queries

export const ${componentName} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // TODO: Fetch data from Supabase
    // Example:
    // const fetchData = async () => {
    //   try {
    //     const result = await supabaseQuery();
    //     setData(result);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();
    
    // For now, pass through to original component
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  // Pass data to original component if needed
  return <Original${componentName} />;
};
`;
  
  return wrapperContent;
}

// Process a single file
function processFile(sourceFile, targetFile) {
  console.log(`Processing: ${path.basename(sourceFile)}`);
  
  // Read the original content
  const content = fs.readFileSync(sourceFile, 'utf8');
  
  // Convert the content
  const converted = convertContent(content, sourceFile);
  
  // Save the converted file
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Save original as .original.tsx for reference
  const originalFile = targetFile.replace('.tsx', '.original.tsx');
  fs.writeFileSync(originalFile, converted);
  
  // Create data wrapper if needed
  const componentName = path.basename(targetFile, '.tsx');
  const wrapper = createDataWrapper(componentName, content);
  
  if (wrapper) {
    fs.writeFileSync(targetFile, wrapper);
    console.log(`  ✓ Created data wrapper for ${componentName}`);
  } else {
    fs.writeFileSync(targetFile, converted);
    console.log(`  ✓ Direct conversion for ${componentName}`);
  }
}

// Process all components recursively
function processDirectory(sourceDir, targetDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(sourcePath, targetPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
      processFile(sourcePath, targetPath.replace('.jsx', '.tsx'));
    }
  });
}

// Main execution
console.log('🔄 Magic Patterns to Next.js Converter');
console.log('=====================================\n');

console.log(`Source: ${MAGIC_PATTERNS_DIR}`);
console.log(`Target: ${TARGET_DIR}\n`);

// Create backup of current components
const backupDir = path.join(__dirname, '../src/components.backup.' + Date.now());
if (fs.existsSync(TARGET_DIR)) {
  console.log(`Creating backup at: ${backupDir}`);
  fs.cpSync(TARGET_DIR, backupDir, { recursive: true });
}

// Process all components
processDirectory(MAGIC_PATTERNS_DIR, TARGET_DIR);

console.log('\n✅ Conversion complete!');
console.log('\nNext steps:');
console.log('1. Review the converted components');
console.log('2. Implement Supabase data fetching in wrapper components');
console.log('3. Test each component individually');
console.log('4. Update page.tsx files to use the new components');