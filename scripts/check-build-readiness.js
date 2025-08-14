#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}`),
};

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const appDir = path.join(srcDir, 'app');
const componentsDir = path.join(srcDir, 'components');

const results = {
  totalChecks: 0,
  passed: 0,
  warnings: 0,
  errors: 0,
  missingComponents: [],
  missingPages: [],
  typeErrors: [],
  mockDataIssues: [],
  envIssues: [],
  dependencyIssues: []
};

// Check 1: Essential files exist
log.section('🔍 Checking essential files...');
const essentialFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  '.env.local',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

essentialFiles.forEach(file => {
  results.totalChecks++;
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    log.success(`Found ${file}`);
    results.passed++;
  } else {
    log.error(`Missing ${file}`);
    results.errors++;
    results.envIssues.push(file);
  }
});

// Check 2: Environment variables
log.section('🔐 Checking environment variables...');
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    results.totalChecks++;
    if (envContent.includes(envVar)) {
      log.success(`Found ${envVar}`);
      results.passed++;
    } else {
      log.warning(`Missing ${envVar}`);
      results.warnings++;
      results.envIssues.push(envVar);
    }
  });
}

// Check 3: Page imports and components
log.section('📄 Checking page imports...');

function checkPageImports(dir, base = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(base, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      checkPageImports(fullPath, relativePath);
    } else if (file === 'page.tsx' || file === 'page.jsx') {
      results.totalChecks++;
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for component imports
      const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]@\/components\/(.*?)['"]/g);
      for (const match of importMatches) {
        const componentPath = match[1];
        const possiblePaths = [
          path.join(componentsDir, `${componentPath}.tsx`),
          path.join(componentsDir, `${componentPath}.jsx`),
          path.join(componentsDir, componentPath, 'index.tsx'),
          path.join(componentsDir, componentPath, 'index.jsx')
        ];
        
        const exists = possiblePaths.some(p => fs.existsSync(p));
        if (!exists) {
          log.error(`Missing component: ${componentPath} (imported by ${relativePath})`);
          results.missingComponents.push({
            component: componentPath,
            importedBy: relativePath
          });
          results.errors++;
        }
      }
      
      // Check for mock data
      if (content.includes('mockData') || content.includes('MOCK_')) {
        log.warning(`Mock data found in ${relativePath}`);
        results.mockDataIssues.push(relativePath);
        results.warnings++;
      }
      
      results.passed++;
    }
  });
}

checkPageImports(appDir);

// Check 4: TypeScript compilation
log.section('📝 Checking TypeScript...');
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit', { cwd: projectRoot, stdio: 'pipe' });
  log.success('TypeScript compilation passed');
  results.passed++;
} catch (error) {
  log.error('TypeScript compilation failed');
  results.typeErrors.push('Run "npm run type-check" for details');
  results.errors++;
}

// Check 5: Dependencies
log.section('📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const requiredDeps = [
  'next',
  'react',
  'react-dom',
  '@supabase/supabase-js',
  '@supabase/ssr'
];

requiredDeps.forEach(dep => {
  results.totalChecks++;
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    log.success(`Found ${dep}`);
    results.passed++;
  } else {
    log.error(`Missing dependency: ${dep}`);
    results.dependencyIssues.push(dep);
    results.errors++;
  }
});

// Check 6: Build-specific issues
log.section('🏗️ Checking build configuration...');

// Check next.config.js
const nextConfigPath = path.join(projectRoot, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  results.totalChecks++;
  if (nextConfig.includes('output:')) {
    if (nextConfig.includes("output: 'export'")) {
      log.warning('Static export mode detected - dynamic routes won\'t work');
      results.warnings++;
    } else {
      log.success('Next.js output mode configured correctly');
      results.passed++;
    }
  }
}

// Generate summary report
log.section('📊 Build Readiness Report');
console.log('='.repeat(50));
console.log(`Total checks: ${results.totalChecks}`);
console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
console.log(`${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);
console.log(`${colors.red}Errors: ${results.errors}${colors.reset}`);
console.log('='.repeat(50));

// Detailed issues
if (results.missingComponents.length > 0) {
  log.section('❌ Missing Components');
  const componentGroups = {};
  results.missingComponents.forEach(({ component, importedBy }) => {
    if (!componentGroups[component]) {
      componentGroups[component] = [];
    }
    componentGroups[component].push(importedBy);
  });
  
  Object.entries(componentGroups).forEach(([component, pages]) => {
    console.log(`\n${colors.red}${component}${colors.reset}`);
    pages.forEach(page => console.log(`  - imported by ${page}`));
  });
}

if (results.mockDataIssues.length > 0) {
  log.section('⚠️ Pages with Mock Data');
  results.mockDataIssues.forEach(page => {
    console.log(`  - ${page}`);
  });
  console.log('\nRun "npm run mockdata:toggle" to manage mock data');
}

if (results.envIssues.length > 0) {
  log.section('🔐 Environment Issues');
  results.envIssues.forEach(issue => {
    console.log(`  - ${issue}`);
  });
}

if (results.dependencyIssues.length > 0) {
  log.section('📦 Missing Dependencies');
  results.dependencyIssues.forEach(dep => {
    console.log(`  - ${dep}`);
  });
  console.log('\nRun "npm install" to install missing dependencies');
}

// Recommendations
log.section('💡 Recommendations');

const canDeploy = results.errors === 0;
const shouldFix = results.warnings > 0;

if (canDeploy) {
  console.log(`${colors.green}✅ Project is ready for deployment!${colors.reset}`);
  console.log('\nNext steps:');
  console.log('1. Commit changes: git add . && git commit -m "Ready for deployment"');
  console.log('2. Push to GitHub: git push origin main');
  console.log('3. Deploy to Vercel: vercel --prod');
} else {
  console.log(`${colors.red}❌ Project has issues that must be fixed before deployment${colors.reset}`);
  console.log('\nPriority fixes:');
  
  if (results.missingComponents.length > 0) {
    console.log('\n1. Fix missing components:');
    console.log('   - Run the Magic Patterns converter to create missing components');
    console.log('   - Or create placeholder components manually');
  }
  
  if (results.envIssues.length > 0) {
    console.log('\n2. Fix environment issues:');
    console.log('   - Copy .env.example to .env.local');
    console.log('   - Add required environment variables');
  }
  
  if (results.typeErrors.length > 0) {
    console.log('\n3. Fix TypeScript errors:');
    console.log('   - Run "npm run type-check" to see detailed errors');
  }
}

if (shouldFix && canDeploy) {
  console.log(`\n${colors.yellow}⚠️ Warnings detected but deployment is possible${colors.reset}`);
  console.log('Consider fixing warnings for better production experience');
}

// Save detailed report
const reportPath = path.join(projectRoot, 'build-readiness-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Detailed report saved to: build-readiness-report.json`);

// Exit with appropriate code
process.exit(canDeploy ? 0 : 1);