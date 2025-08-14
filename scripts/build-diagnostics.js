#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Build Diagnostics - Learning from failures\n');

const projectRoot = path.join(__dirname, '..');
const diagnostics = {
  timestamp: new Date().toISOString(),
  issues: [],
  recommendations: [],
  learnings: []
};

// 1. Check TypeScript configuration
console.log('📋 Checking TypeScript configuration...');
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

if (tsconfig.compilerOptions.strict) {
  diagnostics.issues.push({
    type: 'typescript',
    severity: 'warning',
    message: 'Strict mode is enabled - may cause issues with generated types'
  });
  diagnostics.recommendations.push('Consider using strict: false during initial conversion');
}

// 2. Check for Supabase type generation issues
console.log('\n🗄️ Checking Supabase types...');
const dbTypesPath = path.join(projectRoot, 'src/types/database.types.ts');
if (fs.existsSync(dbTypesPath)) {
  const dbTypes = fs.readFileSync(dbTypesPath, 'utf8');
  const lineCount = dbTypes.split('\n').length;
  
  if (lineCount > 5000) {
    diagnostics.issues.push({
      type: 'supabase',
      severity: 'high',
      message: `Database types file is very large (${lineCount} lines) - may cause type instantiation issues`
    });
    diagnostics.recommendations.push('Use type assertions (as any) for complex queries');
    diagnostics.learnings.push('Large generated type files can cause TypeScript performance issues');
  }
}

// 3. Run type check and analyze errors
console.log('\n🔧 Running type check...');
let typeErrors = [];
try {
  execSync('npx tsc --noEmit', { cwd: projectRoot, stdio: 'pipe' });
  console.log('✅ No TypeScript errors');
} catch (error) {
  const output = error.stdout?.toString() || '';
  const errors = output.split('\n').filter(line => line.includes('error TS'));
  typeErrors = errors;
  
  // Analyze common patterns
  const errorPatterns = {
    deepInstantiation: errors.filter(e => e.includes('excessively deep')).length,
    nullChecks: errors.filter(e => e.includes('possibly \'null\'')).length,
    typeAssignment: errors.filter(e => e.includes('not assignable')).length,
    missingImports: errors.filter(e => e.includes('Cannot find module')).length
  };
  
  console.log(`❌ Found ${errors.length} TypeScript errors`);
  console.log('\nError breakdown:');
  Object.entries(errorPatterns).forEach(([pattern, count]) => {
    if (count > 0) {
      console.log(`  - ${pattern}: ${count}`);
      diagnostics.issues.push({
        type: 'typescript',
        pattern,
        count,
        severity: 'high'
      });
    }
  });
}

// 4. Check for mixed conversion approaches
console.log('\n🔄 Checking for mixed conversion approaches...');
const appDir = path.join(projectRoot, 'src/app');
const componentsDir = path.join(projectRoot, 'src/components');

// Count wrapper patterns vs direct pages
let wrapperCount = 0;
let directPageCount = 0;

function checkPagePatterns(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isDirectory()) {
      checkPagePatterns(path.join(dir, file.name));
    } else if (file.name === 'page.tsx') {
      const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
      if (content.includes('import') && content.includes('from \'@/components/')) {
        if (content.match(/return\s*<\w+\s*\/>/)) {
          wrapperCount++;
        } else {
          directPageCount++;
        }
      }
    }
  });
}

checkPagePatterns(appDir);
console.log(`  - Wrapper pages: ${wrapperCount}`);
console.log(`  - Direct pages: ${directPageCount}`);

if (wrapperCount > 0 && directPageCount > 0) {
  diagnostics.issues.push({
    type: 'architecture',
    severity: 'medium',
    message: 'Mixed page patterns detected (both wrappers and direct pages)'
  });
  diagnostics.learnings.push('Consistent architecture patterns are crucial for maintainability');
}

// 5. Check build output
console.log('\n📦 Attempting build with diagnostics...');
const buildLog = [];
try {
  const output = execSync('npx next build 2>&1', { 
    cwd: projectRoot, 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  buildLog.push(...output.split('\n'));
} catch (error) {
  const output = error.output?.join('\n') || error.toString();
  buildLog.push(...output.split('\n'));
}

// Analyze build failures
const failurePoint = buildLog.find(line => line.includes('Failed to compile'));
if (failurePoint) {
  const errorLines = buildLog.filter(line => 
    line.includes('Type error:') || 
    line.includes('Module not found:') ||
    line.includes('Error:')
  );
  
  diagnostics.buildFailure = {
    failedAt: 'compilation',
    errors: errorLines.slice(0, 5) // First 5 errors
  };
}

// Generate learnings
diagnostics.learnings.push(...[
  'Type issues often cascade - fix the root cause first',
  'Supabase generated types can be too complex for TypeScript',
  'Mixed conversion approaches lead to maintenance issues',
  'Start with a clean architecture decision before converting'
]);

// Generate recommendations based on findings
if (diagnostics.issues.some(i => i.type === 'supabase')) {
  diagnostics.recommendations.push(
    'Create simplified type interfaces for Supabase queries',
    'Use type assertions strategically to bypass complex type checks'
  );
}

if (typeErrors.length > 50) {
  diagnostics.recommendations.push(
    'Consider starting fresh with proper Magic Patterns converter',
    'Too many type errors indicate fundamental architecture issues'
  );
}

// Save diagnostics report
const reportPath = path.join(projectRoot, 'build-diagnostics-report.json');
fs.writeFileSync(reportPath, JSON.stringify(diagnostics, null, 2));

// Display summary
console.log('\n' + '='.repeat(60));
console.log('📊 DIAGNOSTICS SUMMARY');
console.log('='.repeat(60));

console.log('\n🔴 Critical Issues:');
diagnostics.issues
  .filter(i => i.severity === 'high')
  .forEach(issue => {
    console.log(`  - ${issue.message || issue.type}: ${issue.count || ''}`);
  });

console.log('\n💡 Key Learnings:');
diagnostics.learnings.forEach(learning => {
  console.log(`  - ${learning}`);
});

console.log('\n✅ Recommendations:');
diagnostics.recommendations.forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec}`);
});

console.log('\n📄 Full report saved to: build-diagnostics-report.json');

// Final recommendation
console.log('\n' + '='.repeat(60));
if (typeErrors.length > 20 || diagnostics.issues.filter(i => i.severity === 'high').length > 3) {
  console.log('🎯 RECOMMENDATION: Start fresh with proper conversion');
  console.log('   The current project has too many mixed approaches.');
  console.log('   Use the Magic Patterns to Next.js converter on a new project.');
} else {
  console.log('🎯 RECOMMENDATION: Fix issues incrementally');
  console.log('   The project can be salvaged with targeted fixes.');
}
console.log('='.repeat(60));