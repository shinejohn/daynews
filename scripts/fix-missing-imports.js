#!/usr/bin/env node

/**
 * Fix missing imports by commenting them out
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Components that don't exist
const missingComponents = [
  'StickyNav',
  'ServicesAndPricingPage',
  'BusinessProfilePage',
  'BusinessProfileCreator',
  'PremiumEnrollment',
  'PremiumSuccess',
  'BusinessDashboard',
  'CreateArticlePage',
  'ArticleMetadataPage',
  'ArticleSeoPage',
  'ArticleReviewPage',
  'CommunityReviewQueuePage',
  'AuthorProfilePage',
  'AuthorProfileCreatorPage',
  'AuthorsReportPage',
  'EditorPage'
];

// Get all .tsx and .ts files
const files = glob.sync('src/**/*.{ts,tsx}');

console.log(`Checking ${files.length} files for missing imports...`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  missingComponents.forEach(component => {
    // Comment out imports
    const importRegex = new RegExp(`^import.*${component}.*$`, 'gm');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, match => `// ${match} // Component not found`);
      modified = true;
      console.log(`✓ Commented out ${component} import in ${file}`);
    }
    
    // Replace usage with placeholder
    const usageRegex = new RegExp(`<${component}[^>]*/>`, 'g');
    if (usageRegex.test(content)) {
      content = content.replace(usageRegex, `<div>TODO: ${component}</div>`);
      modified = true;
    }
    
    const usageRegex2 = new RegExp(`<${component}[^>]*>.*</${component}>`, 'gs');
    if (usageRegex2.test(content)) {
      content = content.replace(usageRegex2, `<div>TODO: ${component}</div>`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
  }
});

// Also create placeholder components for critical missing ones
const placeholderComponents = [
  'ServicesAndPricingPage',
  'BusinessProfilePage',
  'BusinessProfileCreator',
  'PremiumEnrollment', 
  'PremiumSuccess',
  'BusinessDashboard',
  'CreateArticlePage',
  'ArticleMetadataPage',
  'ArticleSeoPage',
  'ArticleReviewPage',
  'CommunityReviewQueuePage',
  'AuthorProfilePage',
  'AuthorProfileCreatorPage',
  'AuthorsReportPage',
  'EditorPage'
];

console.log('\nCreating placeholder components...');

// Create pages directory
const pagesDir = 'src/components/pages';
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

placeholderComponents.forEach(component => {
  const filePath = path.join(pagesDir, `${component}.tsx`);
  const content = `export default function ${component}() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">${component}</h1>
        <p className="text-gray-600">This component is coming soon.</p>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created placeholder for ${component}`);
});

console.log('\n✅ Missing imports fixed!');