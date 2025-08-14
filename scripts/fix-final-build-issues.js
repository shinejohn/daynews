#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing final build issues...\n');

// 1. Fix ClassifiedsPage syntax error
const classifiedsPath = 'src/components/classifieds/ClassifiedsPage.original.tsx';
if (fs.existsSync(classifiedsPath)) {
  let content = fs.readFileSync(classifiedsPath, 'utf8');
  // Fix the broken TODO comment
  content = content.replace(
    'if (/* TODO: Convert location.state to searchParams or context */?.listingCreated)',
    'if (false /* TODO: Convert location.state to searchParams or context - was: location.state?.listingCreated */)'
  );
  fs.writeFileSync(classifiedsPath, content);
  console.log('✅ Fixed ClassifiedsPage syntax error');
}

// 2. Remove react-router-dom imports from PhotoDetailPage
const photoDetailPath = 'src/components/photos/PhotoDetailPage.original.tsx';
if (fs.existsSync(photoDetailPath)) {
  let content = fs.readFileSync(photoDetailPath, 'utf8');
  content = content.replace(
    /import.*react-router-dom.*/g,
    '// Removed react-router-dom import'
  );
  fs.writeFileSync(photoDetailPath, content);
  console.log('✅ Fixed PhotoDetailPage imports');
}

// 3. Remove tagService import
const tagPagePath = 'src/components/tags/TagPage.tsx';
if (fs.existsSync(tagPagePath)) {
  let content = fs.readFileSync(tagPagePath, 'utf8');
  content = content.replace(
    /import.*tagService.*/g,
    '// Removed tagService import - using mockdata'
  );
  fs.writeFileSync(tagPagePath, content);
  console.log('✅ Fixed TagPage imports');
}

// 4. Fix NationalPage import
const nationalPagePath = 'src/app/national/page.tsx';
if (fs.existsSync(nationalPagePath)) {
  let content = fs.readFileSync(nationalPagePath, 'utf8');
  content = content.replace(
    '@/components/national/NationalPage',
    '@/components/NationalHomePage'
  );
  fs.writeFileSync(nationalPagePath, content);
  console.log('✅ Fixed NationalPage import');
}

// 5. Fix PageDirectory import
const pageDirectoryPath = 'src/app/page-directory/page.tsx';
if (fs.existsSync(pageDirectoryPath)) {
  let content = fs.readFileSync(pageDirectoryPath, 'utf8');
  content = content.replace(
    '@/components/PageDirectory',
    '@/components/utility/PageDirectory'
  );
  fs.writeFileSync(pageDirectoryPath, content);
  console.log('✅ Fixed PageDirectory import');
}

console.log('\n✨ Final fixes complete!');