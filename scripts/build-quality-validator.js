#!/usr/bin/env node

/**
 * Build Quality Validator
 * 
 * This script validates the codebase before build to catch systematic issues early.
 * Prevents export/import mismatches, missing components, and other build-blocking issues.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
let errors = [];
let warnings = [];
let validationsPassed = 0;

console.log('🔍 Build Quality Validator - Checking Codebase Health\n');

// 1. Validate component export consistency
console.log('📦 Step 1: Validating component exports...');

function validateComponentExports(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      validateComponentExports(path.join(dir, entry.name), path.join(basePath, entry.name));
    } else if (entry.name.endsWith('.tsx') && !entry.name.includes('.original.')) {
      const filePath = path.join(dir, entry.name);
      const componentName = path.basename(entry.name, '.tsx');
      const relativePath = path.join(basePath, componentName).replace(/\\/g, '/');
      
      validateSingleComponent(filePath, componentName, relativePath);
    }
  });
}

function validateSingleComponent(filePath, componentName, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for export patterns
  const hasNamedExport = content.includes(`export const ${componentName}`) ||
                        content.includes(`export function ${componentName}`);
  const hasDefaultExport = content.includes(`export default ${componentName}`) ||
                          content.includes('export default function') ||
                          content.includes(`export { ${componentName} as default }`);
  
  if (!hasNamedExport && !hasDefaultExport) {
    errors.push({
      type: 'MISSING_EXPORT',
      file: relativePath,
      message: `Component ${componentName} has no named or default export`
    });
  } else if (hasNamedExport && !hasDefaultExport) {
    // This is fine, but note for pages that might need it
    validationsPassed++;
  } else if (hasDefaultExport) {
    validationsPassed++;
  }
  
  // Check for wrapper pattern (should be eliminated)
  if (content.includes('.original') && content.includes('Data wrapper for')) {
    warnings.push({
      type: 'WRAPPER_PATTERN',
      file: relativePath,
      message: 'Component still uses wrapper pattern - consider direct integration'
    });
  }
  
  // Check for broken imports
  const brokenImportPatterns = [
    /import\s*{\s*mock\w+\s*}\s*from\s*[^;]+that doesn't exist/g,
    /import\s*{\s*\w+\s*}\s*from\s*['"]\.\/.+['"].*\/\/ This import will fail/g
  ];
  
  brokenImportPatterns.forEach((pattern, index) => {
    if (content.match(pattern)) {
      errors.push({
        type: 'BROKEN_IMPORT',
        file: relativePath,
        message: `Component has broken import pattern ${index + 1}`
      });
    }
  });
}

validateComponentExports(path.join(projectRoot, 'src/components'));

// 2. Validate page-component import consistency
console.log('🔗 Step 2: Validating page-component imports...');

function validatePageImports(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      validatePageImports(path.join(dir, entry.name), path.join(basePath, entry.name));
    } else if (entry.name === 'page.tsx') {
      const filePath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');
      
      validateSinglePageImport(filePath, relativePath);
    }
  });
}

function validateSinglePageImport(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find import statements
  const importMatches = content.matchAll(/import\s+(?:{?\s*(\w+)\s*}?|\w+)\s+from\s+['"]@\/components\/([^'"]+)['"]/g);
  
  for (const match of importMatches) {
    const componentName = match[1];
    const componentPath = match[2];
    const isNamedImport = content.includes(`{ ${componentName} }`);
    
    // Check if the component file exists
    const fullComponentPath = path.join(projectRoot, 'src', 'components', componentPath + '.tsx');
    
    if (!fs.existsSync(fullComponentPath)) {
      errors.push({
        type: 'COMPONENT_NOT_FOUND',
        file: relativePath,
        message: `Page imports component ${componentName} from ${componentPath} but file doesn't exist`
      });
      continue;
    }
    
    // Check if import type matches export type
    const componentContent = fs.readFileSync(fullComponentPath, 'utf8');
    const hasNamedExport = componentContent.includes(`export const ${componentName}`);
    const hasDefaultExport = componentContent.includes(`export default ${componentName}`) ||
                            componentContent.includes('export default function');
    
    if (isNamedImport && !hasNamedExport && hasDefaultExport) {
      errors.push({
        type: 'IMPORT_EXPORT_MISMATCH',
        file: relativePath,
        message: `Page uses named import for ${componentName} but component only has default export`
      });
    } else if (!isNamedImport && hasNamedExport && !hasDefaultExport) {
      errors.push({
        type: 'IMPORT_EXPORT_MISMATCH', 
        file: relativePath,
        message: `Page uses default import for ${componentName} but component only has named export`
      });
    } else {
      validationsPassed++;
    }
  }
}

validatePageImports(path.join(projectRoot, 'src/app'));

// 3. Validate route mapping consistency
console.log('🗺️  Step 3: Validating route mapping...');

const routeMappingFile = path.join(projectRoot, 'route-mapping.json');
if (fs.existsSync(routeMappingFile)) {
  const routeMapping = JSON.parse(fs.readFileSync(routeMappingFile, 'utf8'));
  const routes = routeMapping.routes || routeMapping;
  
  routes.forEach(mapping => {
    if (mapping.component === 'Unknown' || mapping.component === 'EmergencyFallback') {
      return; // Skip these
    }
    
    // Check if component exists
    const componentPath = getComponentPath(mapping.component);
    const fullPath = path.join(projectRoot, 'src', 'components', componentPath + '.tsx');
    
    if (!fs.existsSync(fullPath)) {
      errors.push({
        type: 'ROUTE_COMPONENT_MISSING',
        file: 'route-mapping.json',
        message: `Route ${mapping.path} references component ${mapping.component} which doesn't exist at ${componentPath}`
      });
    } else {
      validationsPassed++;
    }
    
    // Check if page exists
    if (mapping.file && !fs.existsSync(path.join(projectRoot, mapping.file))) {
      warnings.push({
        type: 'ROUTE_PAGE_MISSING',
        file: 'route-mapping.json', 
        message: `Route ${mapping.path} references page ${mapping.file} which doesn't exist`
      });
    }
  });
} else {
  warnings.push({
    type: 'ROUTE_MAPPING_MISSING',
    file: 'project',
    message: 'route-mapping.json file not found'
  });
}

// Helper function (copy from create-route-pages.js)
function getComponentPath(component) {
  const componentPaths = {
    'AboutUsPage': 'about/AboutUsPage',
    'AdminDashboard': 'admin/AdminDashboard',
    'CommunityAdsPage': 'ads/CommunityAdsPage',
    'AdvertisingDetailPage': 'advertising/AdvertisingDetailPage',
    'AnnouncementCreatorPage': 'announcements/AnnouncementCreatorPage',
    'AnnouncementDetailPage': 'announcements/AnnouncementDetailPage',
    'ArchiveBrowserPage': 'archive/ArchiveBrowserPage',
    'UserRegistrationPage': 'auth/UserRegistrationPage',
    'AuthorsPage': 'authors/AuthorsPage',
    'BusinessDirectoryPage': 'business/BusinessDirectoryPage',
    'CitySelectionPage': 'city/CitySelectionPage',
    'ClassifiedsPage': 'classifieds/ClassifiedsPage',
    'ClassifiedDetailPage': 'classifieds/ClassifiedDetailPage',
    'PostListingPage': 'classifieds/PostListingPage',
    'AccessibilityPage': 'company/AccessibilityPage',
    'CareersPage': 'company/CareersPage',
    'ContactUsPage': 'contact/ContactUsPage',
    'CouponCreatorPage': 'coupons/CouponCreatorPage',
    'EventCreatorPage': 'events/EventCreatorPage',
    'EventDetailPage': 'events/EventDetailPage',
    'EventsCalendarPage': 'events/EventsCalendarPage',
    'TagPage': 'tags/TagPage',
    'EditorPage': 'pages/EditorPage',
    'PageDirectory': 'utility/PageDirectory',
    'CommunityDeploymentWizard': 'admin/CommunityDeploymentWizard'
  };
  
  return componentPaths[component] || component;
}

// 4. Generate validation report
console.log('\n📊 Validation Results');
console.log('====================\n');

console.log(`✅ Validations passed: ${validationsPassed}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}\n`);

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(warning => {
    console.log(`  - ${warning.file}: ${warning.message}`);
  });
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS (Build Blockers):');
  errors.forEach(error => {
    console.log(`  - ${error.file}: ${error.message}`);
  });
  console.log('');
}

// 5. Exit with appropriate code
if (errors.length > 0) {
  console.log('💥 Validation FAILED - Fix errors before building');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Validation passed with warnings - Build should work but could be improved');
  process.exit(0);
} else {
  console.log('🎉 Validation PASSED - Codebase is healthy for building!');
  process.exit(0);
}