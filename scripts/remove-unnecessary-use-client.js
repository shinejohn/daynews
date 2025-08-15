#!/usr/bin/env node

/**
 * Remove unnecessary 'use client' directives from components
 * that don't actually need client-side features
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Analyzing components for unnecessary "use client" directives...\n');

// Components that definitely need to stay client-side
const definitelyClientComponents = [
  'LocationDetector',
  'LocationDetectorSafe',
  'ActiveReadersCounter',
  'ClientWrapper',
  // Forms and interactive components
  'PaymentPage',
  'SelectCommunitiesPage',
  'ConfirmationPage',
  'SearchInput',
  'CommentSection',
  // Modals
  'SaveModal',
  'ShareModal',
  // Interactive features
  'TodoWrite',
  'ChatInterface',
  'LiveChatWidget'
];

// Patterns that indicate a component needs to be client-side
const clientPatterns = [
  /useState\(/,
  /useEffect\(/,
  /useRouter\(/,
  /usePathname\(/,
  /useSearchParams\(/,
  /onClick\s*=/,
  /onChange\s*=/,
  /onSubmit\s*=/,
  /window\./,
  /document\./,
  /localStorage\./,
  /sessionStorage\./
];

const files = glob.sync('src/components/**/*.tsx', {
  cwd: process.cwd(),
  absolute: true
});

let analyzed = 0;
let canBeServer = 0;
let mustBeClient = 0;

const serverCandidates = [];

files.forEach(file => {
  // Skip .original.tsx files
  if (file.includes('.original.tsx')) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file, '.tsx');
  
  // Skip if doesn't have 'use client'
  if (!content.startsWith("'use client'")) return;
  
  analyzed++;
  
  // Check if it's in the definitely client list
  if (definitelyClientComponents.some(comp => fileName.includes(comp))) {
    mustBeClient++;
    return;
  }
  
  // Check for client-side patterns
  const needsClient = clientPatterns.some(pattern => pattern.test(content));
  
  if (!needsClient) {
    canBeServer++;
    serverCandidates.push({
      file,
      fileName,
      reason: 'No client-side features detected'
    });
  } else {
    mustBeClient++;
  }
});

console.log(`📊 Analysis Results:`);
console.log(`   Total components with 'use client': ${analyzed}`);
console.log(`   Can be server components: ${canBeServer}`);
console.log(`   Must stay client components: ${mustBeClient}`);
console.log('');

if (serverCandidates.length > 0) {
  console.log('📝 Components that can be converted to server components:\n');
  
  // Group by directory
  const byDirectory = {};
  serverCandidates.forEach(({ file, fileName }) => {
    const dir = path.dirname(file).split('/').pop();
    if (!byDirectory[dir]) byDirectory[dir] = [];
    byDirectory[dir].push(fileName);
  });
  
  Object.entries(byDirectory).forEach(([dir, files]) => {
    console.log(`   ${dir}/`);
    files.forEach(file => console.log(`     - ${file}`));
  });
  
  console.log('\n❓ Remove "use client" from these components? (y/n)');
  
  // For automation, we'll create a list file instead of interactive prompt
  const listPath = path.join(process.cwd(), 'server-component-candidates.txt');
  const listContent = serverCandidates.map(c => c.file).join('\n');
  fs.writeFileSync(listPath, listContent);
  
  console.log(`\n📄 List saved to: server-component-candidates.txt`);
  console.log('   Review the list and run: node scripts/convert-to-server-components.js');
}