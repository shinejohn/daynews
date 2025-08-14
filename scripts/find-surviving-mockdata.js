#!/usr/bin/env node

/**
 * Find Surviving Mock Data
 * This script finds ALL instances of mock data that survived conversion
 */

const fs = require('fs');
const path = require('path');

// Track findings
const findings = {
  mockArrays: [],
  hardcodedData: [],
  mockComments: [],
  suspiciousPatterns: [],
  total: 0
};

// Patterns that indicate mock data
const MOCK_INDICATORS = [
  // Direct mock data
  { pattern: /=\s*\[\s*{[\s\S]*?}\s*\]/g, type: 'array' },
  { pattern: /useState\(\[\s*{[\s\S]*?}\s*\]\)/g, type: 'useState' },
  
  // Hardcoded objects that look like data
  { pattern: /{\s*id:\s*\d+,\s*\w+:\s*['"][^'"]+['"]/g, type: 'object' },
  
  // Comments indicating mock data
  { pattern: /\/\/.*mock.*data/gi, type: 'comment' },
  { pattern: /\/\/.*sample.*data/gi, type: 'comment' },
  { pattern: /\/\/.*dummy.*data/gi, type: 'comment' },
  { pattern: /\/\/.*fake.*data/gi, type: 'comment' },
  { pattern: /\/\/.*test.*data/gi, type: 'comment' },
  
  // Specific mock patterns
  { pattern: /Lorem ipsum/gi, type: 'lorem' },
  { pattern: /John Doe|Jane Doe/g, type: 'placeholder' },
  { pattern: /example\.com/gi, type: 'placeholder' },
  { pattern: /https:\/\/via\.placeholder\.com/g, type: 'placeholder' },
  { pattern: /https:\/\/randomuser\.me/g, type: 'placeholder' },
  
  // Dates that look hardcoded
  { pattern: /['"]2023-\d{2}-\d{2}/g, type: 'date' },
  { pattern: /['"]2024-\d{2}-\d{2}/g, type: 'date' },
  
  // Hardcoded IDs
  { pattern: /id:\s*['"]?\d+['"]?/g, type: 'id' },
  
  // Arrays with multiple similar objects
  { pattern: /\[\s*{\s*\w+:.*?},\s*{\s*\w+:.*?},\s*{\s*\w+:.*?}/g, type: 'array' }
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(process.cwd(), filePath);
  const lines = content.split('\n');
  const fileFindings = [];
  
  MOCK_INDICATORS.forEach(({ pattern, type }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Find line number
        let lineNum = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(match.split('\n')[0])) {
            lineNum = i + 1;
            break;
          }
        }
        
        fileFindings.push({
          type,
          match: match.substring(0, 100),
          line: lineNum
        });
      });
    }
  });
  
  // Check for specific mock data patterns
  const suspiciousPatterns = [
    /const\s+\w+\s*=\s*\[[\s\S]{50,}?\];/g,  // Long arrays
    /return\s*\[[\s\S]{50,}?\];/g,           // Return arrays
    /export\s+const\s+\w+\s*=\s*\[/g,        // Exported arrays
    /\w+:\s*\[[^\]]{50,}\]/g                 // Property arrays
  ];
  
  suspiciousPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Check if it contains object-like structures
        if (match.includes('{') && match.includes('}')) {
          fileFindings.push({
            type: 'suspicious',
            match: match.substring(0, 100),
            line: 0
          });
        }
      });
    }
  });
  
  if (fileFindings.length > 0) {
    findings.total += fileFindings.length;
    findings[fileName] = fileFindings;
    
    console.log(`\n📄 ${fileName}`);
    fileFindings.forEach(finding => {
      console.log(`   ${finding.line ? 'Line ' + finding.line : '???'}: ${finding.type} - ${finding.match}...`);
    });
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      scanDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      checkFile(fullPath);
    }
  });
}

// Main execution
console.log('🔍 Searching for surviving mock data...\n');

// Scan src directory
scanDirectory('./src');

// Generate report
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Summary: Found ${findings.total} instances of potential mock data\n`);

// Group by type
const byType = {};
Object.entries(findings).forEach(([file, items]) => {
  if (Array.isArray(items)) {
    items.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
    });
  }
});

console.log('By Type:');
Object.entries(byType).forEach(([type, count]) => {
  console.log(`  • ${type}: ${count}`);
});

// Save detailed report
const report = {
  summary: {
    total: findings.total,
    byType: byType,
    filesAffected: Object.keys(findings).filter(k => k !== 'total').length
  },
  findings: findings
};

fs.writeFileSync('./surviving-mockdata-report.json', JSON.stringify(report, null, 2));
console.log('\n✓ Detailed report saved to surviving-mockdata-report.json');

// Create actionable fixes
console.log('\n🛠️  Suggested Fixes:');
console.log('1. Run: npm run remove-mockdata');
console.log('2. Manually review files with "suspicious" patterns');
console.log('3. Replace placeholder images with real image URLs');
console.log('4. Update hardcoded dates to dynamic values');