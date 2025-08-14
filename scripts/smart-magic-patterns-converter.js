#!/usr/bin/env node

/**
 * Smart Magic Patterns to Next.js Converter
 * 
 * This script intelligently converts Magic Patterns components to work with Next.js
 * while preserving their original structure and integrating real Supabase data.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MAGIC_PATTERNS_DIR = '/Users/johnshine/Dropbox/Fibonacco/Day-News/Code/magic/src/components';
const TARGET_DIR = path.join(__dirname, '../src/components');

// Track conversions
const conversionLog = [];

// Conversion rules
const CONVERSIONS = {
  imports: [
    // React Router to Next.js
    { 
      from: /import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"]/g, 
      to: "import Link from 'next/link'" 
    },
    { 
      from: /import\s+{\s*useNavigate\s*}\s+from\s+['"]react-router-dom['"]/g, 
      to: "import { useRouter } from 'next/navigation'" 
    },
    { 
      from: /import\s+{\s*useLocation\s*}\s+from\s+['"]react-router-dom['"]/g, 
      to: "import { usePathname } from 'next/navigation'" 
    },
    { 
      from: /import\s+{\s*useParams\s*}\s+from\s+['"]react-router-dom['"]/g, 
      to: "import { useParams } from 'next/navigation'" 
    },
    { 
      from: /import\s+{\s*useNavigate\s*,\s*useLocation\s*}\s+from\s+['"]react-router-dom['"]/g, 
      to: "import { useRouter, usePathname } from 'next/navigation'" 
    },
  ],
  
  code: [
    // Navigate usage
    { from: /const\s+navigate\s*=\s*useNavigate\(\)/g, to: "const router = useRouter()" },
    { from: /navigate\(/g, to: "router.push(" },
    
    // Location usage
    { from: /const\s+location\s*=\s*useLocation\(\)/g, to: "const pathname = usePathname()" },
    { from: /location\.pathname/g, to: "pathname" },
    { from: /location\.state/g, to: "router.query /* TODO: Convert location.state */" },
    
    // Link props
    { from: /<Link\s+to=/g, to: "<Link href=" },
  ]
};

// Data integration mappings
const DATA_MAPPINGS = {
  'classifieds': {
    query: 'marketplaceQueries.all()',
    imports: ["import { marketplaceQueries } from '@/lib/supabase/queries/marketplace_items.queries'"],
    transform: `
      // Transform announcements to classifieds format
      const transformedData = data.map(item => ({
        id: item.id,
        title: item.title,
        category: item.type === 'for_sale' ? 'forSale' : item.type,
        subcategory: item.categories?.[0] || 'general',
        price: item.price || 0,
        location: item.location || 'Local',
        postedDate: item.created_at,
        description: item.content,
        images: item.images || [],
        featured: item.is_featured || false,
        condition: item.condition || 'Good',
        seller: {
          name: item.author_name || 'Local Seller',
          rating: 4.5,
          memberSince: item.created_at,
          responseRate: 95,
          responseTime: 'Within a day'
        }
      }));
      setClassifieds(transformedData);`
  },
  'events': {
    query: 'eventsQueries.all()',
    imports: ["import { eventsQueries } from '@/lib/supabase/queries/events.queries'"],
    transform: 'setEvents(data || []);'
  },
  'news': {
    query: 'newsQueries.all()',
    imports: ["import { newsQueries } from '@/lib/supabase/queries/news.queries'"],
    transform: 'setNews(data || []);'
  },
  'businesses': {
    query: 'businessesQueries.all()',
    imports: ["import { businessesQueries } from '@/lib/supabase/queries/businesses.queries'"],
    transform: 'setBusinesses(data || []);'
  }
};

// Helper to detect mock data patterns
function detectMockData(content) {
  const patterns = [
    /const\s+(\w+)\s*=\s*\[[\s\S]*?\];/g,  // const data = [...]
    /\/\/\s*Mock.*data/gi,                   // // Mock data comments
    /mock\w+/gi,                             // mockData, mockUsers, etc.
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      // Try to identify the data type
      const dataTypes = ['classifieds', 'events', 'news', 'businesses', 'announcements'];
      for (const type of dataTypes) {
        if (content.toLowerCase().includes(type)) {
          return { hasMockData: true, dataType: type, matches };
        }
      }
      return { hasMockData: true, dataType: 'unknown', matches };
    }
  }
  
  return { hasMockData: false };
}

// Helper to inject Supabase data fetching
function injectDataFetching(content, dataType) {
  const mapping = DATA_MAPPINGS[dataType];
  if (!mapping) {
    console.warn(`  ⚠️  No data mapping found for type: ${dataType}`);
    return content;
  }
  
  // Add imports
  const importIndex = content.indexOf('import');
  if (importIndex !== -1) {
    const lines = content.split('\n');
    const firstImportLine = lines.findIndex(line => line.includes('import'));
    
    // Add Supabase imports after React imports
    lines.splice(firstImportLine + 1, 0, ...mapping.imports);
    content = lines.join('\n');
  }
  
  // Replace mock data with Supabase fetch
  const mockDataPattern = /const\s+(\w+)\s*=\s*\[[\s\S]*?\];/;
  const match = content.match(mockDataPattern);
  
  if (match) {
    const variableName = match[1];
    const replacement = `const [${variableName}, set${variableName.charAt(0).toUpperCase() + variableName.slice(1)}] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ${mapping.query};
        ${mapping.transform}
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);`;
    
    content = content.replace(mockDataPattern, replacement);
    
    // Add useState and useEffect imports if not present
    if (!content.includes('useState')) {
      content = content.replace(
        "import React",
        "import React, { useState, useEffect }"
      );
    } else if (!content.includes('useEffect')) {
      content = content.replace(
        "useState",
        "useState, useEffect"
      );
    }
  }
  
  return content;
}

// Main conversion function
function convertComponent(sourceFile, targetFile) {
  const componentName = path.basename(sourceFile, '.tsx');
  console.log(`\n📦 Processing: ${componentName}`);
  
  // Read source
  let content = fs.readFileSync(sourceFile, 'utf8');
  const originalContent = content;
  
  // Step 1: Apply routing conversions
  CONVERSIONS.imports.forEach(rule => {
    if (content.match(rule.from)) {
      content = content.replace(rule.from, rule.to);
      console.log(`  ✓ Converted imports: ${rule.from.source}`);
    }
  });
  
  CONVERSIONS.code.forEach(rule => {
    if (content.match(rule.from)) {
      content = content.replace(rule.from, rule.to);
      console.log(`  ✓ Converted code: ${rule.from.source}`);
    }
  });
  
  // Step 2: Check for mock data and inject Supabase
  const mockDataInfo = detectMockData(content);
  if (mockDataInfo.hasMockData) {
    console.log(`  📊 Found mock data (type: ${mockDataInfo.dataType})`);
    content = injectDataFetching(content, mockDataInfo.dataType);
    console.log(`  ✓ Injected Supabase data fetching`);
  }
  
  // Step 3: Add 'use client' if needed
  const needsClient = content.includes('useState') || 
                     content.includes('useEffect') || 
                     content.includes('onClick') ||
                     content.includes('onChange') ||
                     content.includes('useRouter');
                     
  if (needsClient && !content.startsWith("'use client'")) {
    content = "'use client';\n" + content;
    console.log(`  ✓ Added 'use client' directive`);
  }
  
  // Step 4: Save the converted file
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(targetFile, content);
  console.log(`  ✅ Saved to: ${targetFile}`);
  
  // Log the conversion
  conversionLog.push({
    component: componentName,
    hasMockData: mockDataInfo.hasMockData,
    dataType: mockDataInfo.dataType,
    needsClient: needsClient,
    path: targetFile
  });
}

// Process directory recursively
function processDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    return;
  }
  
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(sourcePath, targetPath);
    } else if (entry.name.endsWith('.tsx')) {
      convertComponent(sourcePath, targetPath);
    }
  });
}

// Main execution
console.log('🎨 Smart Magic Patterns to Next.js Converter');
console.log('==========================================\n');

console.log(`📂 Source: ${MAGIC_PATTERNS_DIR}`);
console.log(`📂 Target: ${TARGET_DIR}\n`);

// Create backup
const backupDir = path.join(__dirname, '../src/components.backup.' + Date.now());
if (fs.existsSync(TARGET_DIR)) {
  console.log(`💾 Creating backup at: ${backupDir}`);
  fs.cpSync(TARGET_DIR, backupDir, { recursive: true });
}

// Process all components
processDirectory(MAGIC_PATTERNS_DIR, TARGET_DIR);

// Generate summary report
console.log('\n\n📊 Conversion Summary');
console.log('====================\n');

const withData = conversionLog.filter(c => c.hasMockData);
const clientComponents = conversionLog.filter(c => c.needsClient);

console.log(`Total components converted: ${conversionLog.length}`);
console.log(`Components with mock data: ${withData.length}`);
console.log(`Client components: ${clientComponents.length}\n`);

if (withData.length > 0) {
  console.log('Components that need data review:');
  withData.forEach(c => {
    console.log(`  - ${c.component} (${c.dataType})`);
  });
}

console.log('\n✅ Conversion complete!\n');
console.log('Next steps:');
console.log('1. Review components with mock data conversions');
console.log('2. Test each component for proper functionality');
console.log('3. Update any remaining location.state usage');
console.log('4. Ensure all data transformations match your schema');