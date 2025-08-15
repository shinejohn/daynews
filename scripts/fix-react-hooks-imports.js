#!/usr/bin/env node

/**
 * Fix missing React hooks imports
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Fixing missing React hook imports...\n');

function fixMissingHooks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.next' &&
        !entry.name.startsWith('.')) {
      fixMissingHooks(path.join(dir, entry.name));
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) && 
               !entry.name.includes('.original.')) {
      const filePath = path.join(dir, entry.name);
      fixFileHooks(filePath);
    }
  });
}

function fixFileHooks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check what hooks are used in the file
  const usesUseEffect = content.includes('useEffect(');
  const usesUseState = content.includes('useState(');
  const usesUseCallback = content.includes('useCallback(');
  const usesUseMemo = content.includes('useMemo(');
  const usesUseRef = content.includes('useRef(');
  const usesUseContext = content.includes('useContext(');
  const usesUseReducer = content.includes('useReducer(');
  
  // Find existing React import
  const reactImportMatch = content.match(/import\s+React(?:\s*,\s*{([^}]*)})?.*from\s+['"]react['"]/);
  
  if (reactImportMatch) {
    const existingHooks = reactImportMatch[1] ? reactImportMatch[1].split(',').map(h => h.trim()) : [];
    const neededHooks = [];
    
    if (usesUseState && !existingHooks.includes('useState')) neededHooks.push('useState');
    if (usesUseEffect && !existingHooks.includes('useEffect')) neededHooks.push('useEffect');
    if (usesUseCallback && !existingHooks.includes('useCallback')) neededHooks.push('useCallback');
    if (usesUseMemo && !existingHooks.includes('useMemo')) neededHooks.push('useMemo');
    if (usesUseRef && !existingHooks.includes('useRef')) neededHooks.push('useRef');
    if (usesUseContext && !existingHooks.includes('useContext')) neededHooks.push('useContext');
    if (usesUseReducer && !existingHooks.includes('useReducer')) neededHooks.push('useReducer');
    
    if (neededHooks.length > 0) {
      const allHooks = [...existingHooks, ...neededHooks].filter(h => h !== '');
      const newImport = allHooks.length > 0 
        ? `import React, { ${allHooks.join(', ')} } from 'react';`
        : `import React from 'react';`;
      
      content = content.replace(reactImportMatch[0], newImport);
    }
  }
  
  // Check if content was modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed hooks in: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

// Run the fix
fixMissingHooks(path.join(projectRoot, 'src'));

console.log(`\n✨ Fixed React hook imports in ${fixCount} files!`);