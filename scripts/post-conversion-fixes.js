#!/usr/bin/env node

/**
 * Post-conversion fixes for Next.js build issues
 * Runs all necessary fixes discovered during migration
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Running post-conversion fixes...\n');

let totalFixes = 0;

// 1. Fix HTML entities in all files
function fixHtmlEntities() {
  console.log('📝 Fixing HTML entities...');
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Check if file contains HTML entities
    if (content.includes('&apos;') || content.includes('&quot;') || 
        content.includes('&lt;') || content.includes('&gt;') || 
        content.includes('&amp;')) {
      
      // Replace HTML entities
      content = content.replace(/&apos;/g, "'");
      content = content.replace(/&quot;/g, '"');
      content = content.replace(/&lt;/g, '<');
      content = content.replace(/&gt;/g, '>');
      content = content.replace(/&amp;/g, '&');
      
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} files with HTML entities\n`);
  totalFixes += fixed;
}

// 2. Fix missing React imports
function fixReactImports() {
  console.log('⚛️  Fixing missing React imports...');
  const files = glob.sync('src/**/*.{tsx,jsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Check if file uses JSX but doesn't import React
    if (content.includes('return <') || content.includes('return(')) {
      if (!content.includes('import React') && !content.includes('from \'react\'')) {
        // Add React import at the beginning
        content = `import React from 'react';\n${content}`;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} files with missing React imports\n`);
  totalFixes += fixed;
}

// 3. Fix navigate dependencies
function fixNavigateDependencies() {
  console.log('🧭 Fixing navigate dependencies...');
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix navigate in dependency arrays
    if (content.includes(', navigate]') || content.includes(', navigate,')) {
      content = content.replace(/,\s*navigate\]/g, ', router]');
      content = content.replace(/,\s*navigate,/g, ', router,');
      modified = true;
    }
    
    // Fix router.push(-1) to router.back()
    if (content.includes('router.push(-1)')) {
      content = content.replace(/router\.push\(-1\)/g, 'router.back()');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} files with navigate dependencies\n`);
  totalFixes += fixed;
}

// 4. Fix missing lucide-react imports
function fixLucideImports() {
  console.log('🎨 Fixing missing lucide-react imports...');
  const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Common missing icons
    const iconPatterns = [
      { icon: 'Search', pattern: /<Search\s/ },
      { icon: 'AlertCircle', pattern: /<AlertCircle\s/ },
      { icon: 'Tag', pattern: /<Tag\s/ },
      { icon: 'Phone', pattern: /<Phone\s/ },
      { icon: 'Upload', pattern: /<Upload\s/ },
      { icon: 'Download', pattern: /<Download\s/ }
    ];
    
    // Check if file imports from lucide-react
    const lucideMatch = content.match(/from ['"]lucide-react['"]/);
    if (lucideMatch) {
      const importLine = content.substring(
        content.lastIndexOf('\n', lucideMatch.index) + 1,
        content.indexOf('\n', lucideMatch.index)
      );
      
      // Check for missing icons
      iconPatterns.forEach(({ icon, pattern }) => {
        if (pattern.test(content) && !importLine.includes(icon)) {
          // Add the icon to the import
          const newImportLine = importLine.replace(
            /} from/,
            `, ${icon} } from`
          );
          content = content.replace(importLine, newImportLine);
          modified = true;
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} files with missing lucide-react imports\n`);
  totalFixes += fixed;
}

// 5. Fix pages that need dynamic rendering
function fixDynamicPages() {
  console.log('🔄 Fixing dynamic page configurations...');
  
  // Components that require dynamic rendering
  const dynamicComponents = [
    'HomePage', 'NationalHomePage', 'AnnouncementsPage', 'EventsCalendarPage',
    'BusinessDirectoryPage', 'ClassifiedsPage', 'CouponsPage', 'CreateNewsPage',
    'EventsPage', 'MemorialsPage', 'PhotoGalleryPage', 'CitySelectionPage',
    'ArchiveBrowserPage', 'TrendingPage', 'OpinionPage', 'SportsPage', 'LifePage',
    'TagPage'
  ];
  
  const pageFiles = glob.sync('src/app/**/page.tsx', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it imports any dynamic component
    const needsDynamic = dynamicComponents.some(comp => 
      content.includes(`import { ${comp} }`) || 
      content.includes(`import ${comp}`)
    );
    
    if (needsDynamic && content.includes("export const dynamic = 'force-static'")) {
      content = content.replace(
        "export const dynamic = 'force-static'",
        "export const dynamic = 'force-dynamic' // Changed to support client-side hooks"
      );
      
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} pages to use dynamic rendering\n`);
  totalFixes += fixed;
}

// 6. Fix window references for SSR
function fixWindowReferences() {
  console.log('🪟 Fixing window references for SSR...');
  const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix direct window.location access outside useEffect
    const windowLocationPattern = /^\s*const\s+\w+\s*=.*window\.location/gm;
    if (windowLocationPattern.test(content)) {
      // This needs manual review as it requires wrapping in useEffect
      console.log(`  ⚠️  Manual fix needed in ${path.relative(process.cwd(), file)}: window.location used outside useEffect`);
    }
    
    // Fix location references without window check
    if (content.includes('location.pathname') || content.includes('location.search')) {
      content = content.replace(/\blocation\./g, 'window.location.');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} files with window references\n`);
  totalFixes += fixed;
}

// 7. Fix empty data destructuring
function fixEmptyDestructuring() {
  console.log('📦 Fixing empty object destructuring...');
  const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Pattern to match destructuring from empty object
    const emptyDestructurePattern = /const\s*{\s*([^}]+)\s*}\s*=\s*{}\s*as\s*any/g;
    
    if (emptyDestructurePattern.test(content)) {
      // This needs manual fix as we need to provide default values
      console.log(`  ⚠️  Manual fix needed in ${path.relative(process.cwd(), file)}: Empty object destructuring found`);
    }
  });
  
  console.log(`  ✓ Checked for empty object destructuring patterns\n`);
}

// 8. Add missing 'use client' directives
function fixUseClientDirectives() {
  console.log('📱 Fixing missing "use client" directives...');
  const files = glob.sync('src/components/**/*.{tsx,jsx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let fixed = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if component uses hooks or browser APIs
    const needsUseClient = 
      content.includes('useState') ||
      content.includes('useEffect') ||
      content.includes('useRouter') ||
      content.includes('onClick') ||
      content.includes('onChange') ||
      content.includes('window.') ||
      content.includes('document.');
    
    // Check if already has 'use client'
    const hasUseClient = content.startsWith("'use client'") || 
                        content.startsWith('"use client"');
    
    if (needsUseClient && !hasUseClient) {
      content = `'use client';\n${content}`;
      fs.writeFileSync(file, content);
      fixed++;
    }
  });
  
  console.log(`  ✓ Fixed ${fixed} files with missing "use client" directives\n`);
  totalFixes += fixed;
}

// Run all fixes
console.log('Starting post-conversion fixes...\n');

fixHtmlEntities();
fixReactImports();
fixNavigateDependencies();
fixLucideImports();
fixDynamicPages();
fixWindowReferences();
fixEmptyDestructuring();
fixUseClientDirectives();

console.log(`✅ Completed ${totalFixes} total fixes!\n`);

// Validate the fixes
console.log('🔍 Running validation...');
const { execSync } = require('child_process');

try {
  execSync('npx next build --no-lint', { stdio: 'inherit' });
  console.log('\n🎉 Build successful! All fixes applied correctly.');
} catch (error) {
  console.log('\n⚠️  Build still has errors. Please check the output above.');
  console.log('You may need to run additional manual fixes.');
}