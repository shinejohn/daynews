#!/usr/bin/env node

/**
 * Create and Maintain Mock Data Registry
 * Tracks all mock data across the project for easy maintenance
 */

const fs = require('fs');
const path = require('path');

// Registry structure
const registry = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  summary: {
    totalFiles: 0,
    totalMockDataInstances: 0,
    byType: {},
    byStatus: {
      active: 0,
      converted: 0,
      pending: 0
    }
  },
  files: {},
  mockDataDefinitions: {}
};

// Mock data patterns to detect
const PATTERNS = {
  arrayLiteral: {
    regex: /const\s+(\w+)\s*=\s*\[([\s\S]*?)\];/gm,
    type: 'array'
  },
  objectLiteral: {
    regex: /const\s+(\w+)\s*=\s*\{([\s\S]*?)\};/gm,
    type: 'object'
  },
  useState: {
    regex: /useState\s*\(\s*\[([\s\S]*?)\]\s*\)/gm,
    type: 'state'
  },
  mockComment: {
    regex: /\/\/\s*(mock|sample|dummy|test|fake)\s*data/gi,
    type: 'comment'
  }
};

// Analyze a file for mock data
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const fileName = path.basename(filePath);
  
  const fileEntry = {
    path: relativePath,
    fileName: fileName,
    mockData: [],
    hasDataToggle: false,
    status: 'pending',
    lastModified: fs.statSync(filePath).mtime.toISOString()
  };

  // Check if already converted to use data toggle
  if (content.includes('useDataSource')) {
    fileEntry.hasDataToggle = true;
    fileEntry.status = 'converted';
  }

  // Find all mock data instances
  Object.entries(PATTERNS).forEach(([patternName, config]) => {
    const matches = [...content.matchAll(config.regex)];
    
    matches.forEach(match => {
      const startLine = content.substring(0, match.index).split('\n').length;
      
      let mockDataEntry = {
        type: config.type,
        pattern: patternName,
        line: startLine,
        preview: match[0].substring(0, 100) + '...'
      };

      // For array and object patterns, extract variable name and guess data type
      if (patternName === 'arrayLiteral' || patternName === 'objectLiteral') {
        const varName = match[1];
        mockDataEntry.variableName = varName;
        mockDataEntry.dataType = guessDataType(varName, match[0]);
        
        // Extract the actual mock data
        if (patternName === 'arrayLiteral') {
          try {
            // Store the mock data structure for potential reuse
            const mockDataId = `${fileName}_${varName}`;
            registry.mockDataDefinitions[mockDataId] = {
              variableName: varName,
              dataType: mockDataEntry.dataType,
              content: match[0],
              usedIn: [relativePath]
            };
            mockDataEntry.mockDataId = mockDataId;
          } catch (e) {
            // Parsing error
          }
        }
      }

      fileEntry.mockData.push(mockDataEntry);
    });
  });

  if (fileEntry.mockData.length > 0) {
    fileEntry.status = fileEntry.hasDataToggle ? 'converted' : 'active';
    registry.files[relativePath] = fileEntry;
    registry.summary.totalMockDataInstances += fileEntry.mockData.length;
  }

  return fileEntry;
}

// Guess data type from variable name and content
function guessDataType(varName, content) {
  const lower = varName.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (lower.includes('event') || contentLower.includes('start_date')) return 'events';
  if (lower.includes('classif') || lower.includes('listing')) return 'classifieds';
  if (lower.includes('news') || lower.includes('article')) return 'news';
  if (lower.includes('business')) return 'businesses';
  if (lower.includes('user') || lower.includes('profile')) return 'users';
  if (lower.includes('comment')) return 'comments';
  if (lower.includes('announce')) return 'announcements';
  if (lower.includes('photo') || lower.includes('image')) return 'photos';
  
  return 'unknown';
}

// Scan directory recursively
function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
      scanDirectory(fullPath);
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) && !entry.name.includes('.test.')) {
      analyzeFile(fullPath);
      registry.summary.totalFiles++;
    }
  });
}

// Generate actionable report
function generateReport() {
  const report = `# Mock Data Registry Report

Generated: ${new Date().toLocaleString()}

## Summary
- **Total Files Scanned**: ${registry.summary.totalFiles}
- **Files with Mock Data**: ${Object.keys(registry.files).length}
- **Total Mock Data Instances**: ${registry.summary.totalMockDataInstances}

## Status Breakdown
- **Active (Needs Conversion)**: ${registry.summary.byStatus.active}
- **Converted (Using Data Toggle)**: ${registry.summary.byStatus.converted}
- **Pending Review**: ${registry.summary.byStatus.pending}

## By Data Type
${Object.entries(registry.summary.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- **${type}**: ${count} instances`)
  .join('\n')}

## Files Needing Conversion
${Object.entries(registry.files)
  .filter(([_, file]) => file.status === 'active')
  .map(([path, file]) => `- \`${path}\` (${file.mockData.length} instances)`)
  .join('\n')}

## Conversion Commands

### Convert All Active Files
\`\`\`bash
npm run convert-all-mockdata
\`\`\`

### Convert Specific File
\`\`\`bash
node scripts/convert-component-to-toggle.js <file-path>
\`\`\`

## Mock Data Definitions

The registry tracks ${Object.keys(registry.mockDataDefinitions).length} unique mock data definitions that can be reused across components.
`;

  fs.writeFileSync('./MOCKDATA_REGISTRY_REPORT.md', report);
}

// Create maintenance scripts
function createMaintenanceScripts() {
  // Create update script
  const updateScript = `#!/usr/bin/env node
// Update mock data registry
const { execSync } = require('child_process');
execSync('node scripts/create-mockdata-registry.js', { stdio: 'inherit' });
console.log('✓ Mock data registry updated');
`;
  
  fs.writeFileSync('./scripts/update-mockdata-registry.js', updateScript);
  fs.chmodSync('./scripts/update-mockdata-registry.js', '755');

  // Create convert all script
  const convertAllScript = `#!/usr/bin/env node
// Convert all files with active mock data
const registry = require('../mockdata-registry.json');
const { execSync } = require('child_process');

Object.entries(registry.files)
  .filter(([_, file]) => file.status === 'active')
  .forEach(([path]) => {
    console.log(\`Converting \${path}...\`);
    try {
      execSync(\`node scripts/convert-component-to-toggle.js \${path}\`, { stdio: 'inherit' });
    } catch (e) {
      console.error(\`Failed to convert \${path}\`);
    }
  });
`;

  fs.writeFileSync('./scripts/convert-all-mockdata.js', convertAllScript);
  fs.chmodSync('./scripts/convert-all-mockdata.js', '755');

  // Add npm scripts
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['mockdata:scan'] = 'node scripts/create-mockdata-registry.js';
  packageJson.scripts['mockdata:update'] = 'node scripts/update-mockdata-registry.js';
  packageJson.scripts['mockdata:convert-all'] = 'node scripts/convert-all-mockdata.js';
  packageJson.scripts['mockdata:report'] = 'cat MOCKDATA_REGISTRY_REPORT.md';
  
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
}

// Create a mock data library file
function createMockDataLibrary() {
  const library = `/**
 * Mock Data Library
 * Centralized mock data definitions for reuse
 * Generated from mockdata-registry.json
 */

`;

  const libraryContent = Object.entries(registry.mockDataDefinitions)
    .map(([id, def]) => {
      return `// ${def.dataType} - Used in: ${def.usedIn.join(', ')}
export ${def.content.replace(/const/, 'const exported_')}
`;
    })
    .join('\n');

  fs.writeFileSync('./src/lib/mock-data/index.ts', library + libraryContent);
}

// Main execution
console.log('📊 Creating Mock Data Registry...\n');

// Scan the project
console.log('Scanning for mock data...');
scanDirectory('./src');

// Update summary statistics
Object.values(registry.files).forEach(file => {
  registry.summary.byStatus[file.status]++;
  
  file.mockData.forEach(mock => {
    if (mock.dataType) {
      registry.summary.byType[mock.dataType] = (registry.summary.byType[mock.dataType] || 0) + 1;
    }
  });
});

// Save registry
fs.writeFileSync('./mockdata-registry.json', JSON.stringify(registry, null, 2));
console.log('\n✓ Saved registry to mockdata-registry.json');

// Generate report
generateReport();
console.log('✓ Generated report: MOCKDATA_REGISTRY_REPORT.md');

// Create maintenance scripts
createMaintenanceScripts();
console.log('✓ Created maintenance scripts');

// Create mock data library
const mockDataDir = './src/lib/mock-data';
if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir, { recursive: true });
}
createMockDataLibrary();
console.log('✓ Created mock data library');

// Summary
console.log('\n📊 Registry Summary:');
console.log(`- Files with mock data: ${Object.keys(registry.files).length}`);
console.log(`- Total instances: ${registry.summary.totalMockDataInstances}`);
console.log(`- Active (needs conversion): ${registry.summary.byStatus.active}`);
console.log(`- Already converted: ${registry.summary.byStatus.converted}`);

console.log('\n🛠️  Available Commands:');
console.log('- npm run mockdata:scan     - Rescan and update registry');
console.log('- npm run mockdata:report   - View the report');
console.log('- npm run mockdata:convert-all - Convert all active files');

console.log('\n📁 Files Created:');
console.log('- mockdata-registry.json - Complete registry data');
console.log('- MOCKDATA_REGISTRY_REPORT.md - Human-readable report');
console.log('- src/lib/mock-data/index.ts - Reusable mock data library');