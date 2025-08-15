#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Components that use hooks requiring dynamic rendering
const dynamicComponents = [
  'HomePage',
  'NationalHomePage',
  'AnnouncementsPage',
  'EventsCalendarPage',
  'BusinessDirectoryPage',
  'ClassifiedsPage',
  'CouponsPage',
  'CreateNewsPage',
  'EventsPage',
  'MemorialsPage',
  'PhotoGalleryPage',
  'CitySelectionPage',
  'ArchiveBrowserPage',
  'TrendingPage',
  'OpinionPage',
  'SportsPage',
  'LifePage'
];

function fixPageIfNeeded(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it imports any of the dynamic components
  const needsDynamic = dynamicComponents.some(comp => 
    content.includes(`import { ${comp} }`) || 
    content.includes(`import ${comp}`)
  );
  
  if (needsDynamic && content.includes("export const dynamic = 'force-static'")) {
    const updatedContent = content.replace(
      "export const dynamic = 'force-static'",
      "export const dynamic = 'force-dynamic' // Changed to support client-side hooks"
    );
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✓ Fixed dynamic rendering for: ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all page.tsx files
const pageFiles = glob.sync('src/app/**/page.tsx', {
  cwd: process.cwd(),
  absolute: true
});

let fixedCount = 0;

pageFiles.forEach(file => {
  if (fixPageIfNeeded(file)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} pages to use dynamic rendering.`);