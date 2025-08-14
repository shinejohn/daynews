#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files containing mock data
const filesWithMockData = [
  'src/components/authors/AuthorsPage.tsx',
  'src/components/photos/PhotoGalleryPage.tsx',
  'src/components/memorials/MemorialDetailPage.tsx',
  'src/components/trending/TrendingPage.tsx',
  'src/components/UserSettingsPage.tsx',
  'src/components/UserProfilePage.tsx',
  'src/components/tags/TagPage.tsx',
  'src/components/search/SearchResultsPage.tsx',
  'src/components/photos/PhotoDetailPage.tsx',
  'src/components/location/CommunitySwitcher.tsx',
  'src/components/location/CommunitySelector.tsx',
  'src/components/legal/LegalNoticesListPage.tsx',
  'src/components/events/EventDetailPage.tsx',
  'src/components/editor/SidePanel.tsx',
  'src/components/classifieds/SelectCommunitiesPage.tsx',
  'src/components/classifieds/ClassifiedsPage.tsx',
  'src/components/archive/ArchiveBrowserPage.tsx',
  'src/components/classifieds/ClassifiedDetailPage.tsx',
  'src/components/legal/LegalNoticeDetailPage.tsx',
  'src/components/events/EventsCalendarPage.tsx',
  'src/components/article/ArticleDetailPage.tsx',
  'src/components/previews/LegalNoticesPreview.tsx',
  'src/components/advertising/AdvertisingDetailPage.tsx',
  'src/components/CouponsPage.tsx',
  'src/components/announcements/AnnouncementDetailPage.tsx',
  'src/components/content/PhotoGallerySection.tsx',
  'src/components/admin/AuthorComplaintsManagement.tsx',
  'src/components/business/BusinessDirectoryPage.tsx',
  'src/components/business/PromotedBusinesses.tsx',
  'src/components/BusinessProfile.tsx',
  'src/components/city/CitySearch.tsx',
  'src/components/city/CitySelectionPage.tsx',
  'src/components/ads/TargetCommunities.tsx',
  'src/components/ads/AdPreview.tsx'
];

function commentOutMockData(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Pattern to match mock data assignments
    const patterns = [
      // setTimeout with mock data
      /(setTimeout\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?(?:setMock|set[A-Z]\w*\s*\(\s*(?:\[[\s\S]*?\]|\{[\s\S]*?\}))\s*\)[\s\S]*?\},\s*\d+\))/g,
      // Mock data arrays
      /(const\s+mock\w+\s*(?::\s*\w+(?:\[\])?)\s*=\s*\[[\s\S]*?\];)/g,
      // Mock data objects
      /(const\s+mock\w+\s*(?::\s*\w+)?\s*=\s*\{[\s\S]*?\};)/g,
      // generateMock functions
      /(const\s+generateMock\w+\s*=[\s\S]*?^\};)/gm,
      // Direct set calls with inline data
      /(set\w+\s*\(\s*\[[\s\S]*?\]\s*\);)/g,
    ];

    patterns.forEach(pattern => {
      content = content.replace(pattern, (match) => {
        modified = true;
        // Comment out each line
        return match.split('\n').map(line => '// ' + line).join('\n');
      });
    });

    // Special handling for mockdataon comment
    content = content.replace(/\/\/\s*mockdataon=yes/gi, '// mockdataon=no');

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Commented out mock data in: ${filePath}`);
    } else {
      console.log(`⚠ No mock data patterns found in: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Starting to comment out mock data in all files...\n');

filesWithMockData.forEach(file => {
  commentOutMockData(file);
});

console.log('\nCompleted processing all files!');