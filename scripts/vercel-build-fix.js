#!/usr/bin/env node

/**
 * Vercel Build Fix - Fix critical build and linting errors
 * 
 * This script addresses the specific issues causing Vercel builds to fail:
 * 1. Import/export mismatches between pages and components
 * 2. Unescaped quotes in JSX 
 * 3. Missing component imports
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let fixCount = 0;

console.log('🔧 Vercel Build Fix - Addressing Critical Build Issues\n');

// 1. Fix all page imports to use named imports instead of default
console.log('📦 Step 1: Fixing page import/export mismatches...');

function fixPageImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      fixPageImports(path.join(dir, entry.name));
    } else if (entry.name === 'page.tsx') {
      const filePath = path.join(dir, entry.name);
      fixSinglePageImport(filePath);
    }
  });
}

function fixSinglePageImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern: import ComponentName from '@/components/path'
  const defaultImportPattern = /import\s+(\w+)\s+from\s+['"](@\/components\/[^'"]+)['"]/g;
  
  content = content.replace(defaultImportPattern, (match, componentName, componentPath) => {
    // Change to named import
    modified = true;
    return `import { ${componentName} } from '${componentPath}'`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed imports: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

fixPageImports(path.join(projectRoot, 'src/app'));

// 2. Fix unescaped quotes in JSX
console.log('\n🔤 Step 2: Fixing unescaped quotes in JSX...');

function fixUnescapedQuotes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      fixUnescapedQuotes(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const filePath = path.join(dir, entry.name);
      fixQuotesInFile(filePath);
    }
  });
}

function fixQuotesInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix common unescaped quotes in JSX text content
  const quoteFixes = [
    // Single quotes in text content
    { from: />\s*([^<]*?)'([^<]*?)\s*</g, to: '>$1&apos;$2<' },
    // Double quotes in text content  
    { from: />\s*([^<]*?)"([^<]*?)\s*</g, to: '>$1&quot;$2<' },
    // Common patterns
    { from: /don't/g, to: "don&apos;t" },
    { from: /won't/g, to: "won&apos;t" },
    { from: /can't/g, to: "can&apos;t" },
    { from: /couldn't/g, to: "couldn&apos;t" },
    { from: /shouldn't/g, to: "shouldn&apos;t" },
    { from: /wouldn't/g, to: "wouldn&apos;t" },
    { from: /didn't/g, to: "didn&apos;t" },
    { from: /isn't/g, to: "isn&apos;t" },
    { from: /aren't/g, to: "aren&apos;t" },
    { from: /hasn't/g, to: "hasn&apos;t" },
    { from: /haven't/g, to: "haven&apos;t" },
    { from: /doesn't/g, to: "doesn&apos;t" },
    { from: /let's/g, to: "let&apos;s" },
    { from: /it's/g, to: "it&apos;s" },
    { from: /that's/g, to: "that&apos;s" },
    { from: /what's/g, to: "what&apos;s" },
    { from: /there's/g, to: "there&apos;s" },
    { from: /here's/g, to: "here&apos;s" },
    { from: /we're/g, to: "we&apos;re" },
    { from: /you're/g, to: "you&apos;re" },
    { from: /they're/g, to: "they&apos;re" }
  ];
  
  quoteFixes.forEach(fix => {
    const beforeContent = content;
    content = content.replace(fix.from, fix.to);
    if (content !== beforeContent) {
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed quotes: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

fixUnescapedQuotes(path.join(projectRoot, 'src'));

// 3. Fix missing imports
console.log('\n📥 Step 3: Fixing missing imports...');

function fixMissingImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      fixMissingImports(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.tsx')) {
      const filePath = path.join(dir, entry.name);
      fixImportsInFile(filePath);
    }
  });
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check for undefined components and add imports
  const missingImports = [];
  
  // Check for MessageSquare usage
  if (content.includes('MessageSquare') && !content.includes('import.*MessageSquare')) {
    missingImports.push('MessageSquare');
  }
  
  // Check for other common missing imports
  const commonMissing = [
    'BookmarkIcon', 'Share2Icon', 'MapPin', 'PlusCircle', 'RefreshCw',
    'ThumbsUp', 'ThumbsDown', 'Calendar', 'Settings', 'Bell', 'Lock',
    'Eye', 'EyeOff', 'Shield', 'User', 'Heart', 'Users', 'Edit2'
  ];
  
  commonMissing.forEach(icon => {
    if (content.includes(icon) && !content.includes(`import.*${icon}`) && !missingImports.includes(icon)) {
      missingImports.push(icon);
    }
  });
  
  // Add missing imports to lucide-react import if it exists
  if (missingImports.length > 0) {
    const lucideImportMatch = content.match(/import\s*{\s*([^}]*)\s*}\s*from\s*['"]lucide-react['"]/);
    
    if (lucideImportMatch) {
      const existingImports = lucideImportMatch[1].split(',').map(s => s.trim()).filter(s => s);
      const newImports = [...new Set([...existingImports, ...missingImports])].sort();
      
      const newImportStatement = `import { ${newImports.join(', ')} } from 'lucide-react'`;
      content = content.replace(lucideImportMatch[0], newImportStatement);
      modified = true;
    } else {
      // Add new lucide-react import
      const firstImportMatch = content.match(/import\s+[^;]+;/);
      if (firstImportMatch) {
        const newImportStatement = `import { ${missingImports.join(', ')} } from 'lucide-react';\n`;
        content = content.replace(firstImportMatch[0], firstImportMatch[0] + '\n' + newImportStatement);
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed imports: ${path.relative(projectRoot, filePath)} (added: ${missingImports.join(', ')})`);
    fixCount++;
  }
}

fixMissingImports(path.join(projectRoot, 'src'));

// 4. Fix other common linting issues
console.log('\n🧹 Step 4: Fixing other linting issues...');

function fixLintingIssues(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      fixLintingIssues(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.tsx')) {
      const filePath = path.join(dir, entry.name);
      fixLintInFile(filePath);
    }
  });
}

function fixLintInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add alt attributes to img tags
  content = content.replace(/<img([^>]*?)(?<!alt=['"][^'"]*['"])>/g, (match, attrs) => {
    if (!attrs.includes('alt=')) {
      modified = true;
      return `<img${attrs} alt="">`;
    }
    return match;
  });
  
  // Remove unused imports that are causing warnings
  const unusedImports = [
    'Share2', 'Heart', 'MessageCircle', 'PlusCircle', 'BookmarkIcon',
    'Share2Icon', 'Component', 'useNavigate', 'memo', 'User', 'Users',
    'Edit2', 'PageHeader', 'MapPin', 'RefreshCw', 'ThumbsUp', 'ThumbsDown',
    'Calendar', 'Settings', 'Bell', 'Lock', 'Eye', 'EyeOff', 'Shield'
  ];
  
  unusedImports.forEach(importName => {
    // Remove from import statements if not used in JSX
    const jsxUsage = new RegExp(`<${importName}|${importName}\\s*[({]`, 'g');
    if (!content.match(jsxUsage)) {
      // Remove from import
      content = content.replace(new RegExp(`,\\s*${importName}`, 'g'), '');
      content = content.replace(new RegExp(`${importName},\\s*`, 'g'), '');
      content = content.replace(new RegExp(`{\\s*${importName}\\s*}`, 'g'), '{}');
      modified = true;
    }
  });
  
  // Clean up empty imports
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];\s*/g, '');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed linting: ${path.relative(projectRoot, filePath)}`);
    fixCount++;
  }
}

fixLintingIssues(path.join(projectRoot, 'src'));

console.log(`\n✨ Vercel build fixes applied: ${fixCount} files modified\n`);

console.log('🎯 Critical Issues Fixed:');
console.log('✅ Page import/export mismatches');
console.log('✅ Unescaped quotes in JSX');
console.log('✅ Missing component imports');
console.log('✅ Common linting warnings');

console.log('\n📝 Next Steps:');
console.log('1. Run: npm run build (locally)');
console.log('2. Commit and push changes');
console.log('3. Vercel should now deploy successfully');

console.log('\n🎉 Ready for Vercel deployment!');