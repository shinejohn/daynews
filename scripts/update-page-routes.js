#!/usr/bin/env node

/**
 * Update page.tsx files to use the converted components
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../src/app');

// Page component mappings
const PAGE_MAPPINGS = {
  'classifieds/page.tsx': {
    component: 'ClassifiedsPage',
    import: "import { ClassifiedsPage } from '@/components/classifieds/ClassifiedsPage'"
  },
  'events/page.tsx': {
    component: 'EventsPage',
    import: "import { EventsPage } from '@/components/EventsPage'"
  },
  'sports/page.tsx': {
    component: 'SportsPage',
    import: "import { SportsPage } from '@/components/sports/SportsPage'"
  },
  'business/page.tsx': {
    component: 'BusinessDirectoryPage',
    import: "import { BusinessDirectoryPage } from '@/components/business/BusinessDirectoryPage'"
  },
  'photos/page.tsx': {
    component: 'PhotoGalleryPage',
    import: "import { PhotoGalleryPage } from '@/components/PhotoGalleryPage'"
  },
  'announcements/page.tsx': {
    component: 'AnnouncementsPage',
    import: "import { AnnouncementsPage } from '@/components/AnnouncementsPage'"
  },
  'about/page.tsx': {
    component: 'AboutUsPage',
    import: "import { AboutUsPage } from '@/components/about/AboutUsPage'"
  },
  'contact/page.tsx': {
    component: 'ContactUsPage',
    import: "import { ContactUsPage } from '@/components/contact/ContactUsPage'"
  }
};

// Template for simple page routes
const PAGE_TEMPLATE = (importStatement, componentName) => `${importStatement}

export default function Page() {
  return <${componentName} />
}
`;

// Template for pages with metadata
const PAGE_WITH_META_TEMPLATE = (importStatement, componentName, metadata) => `${importStatement}
import type { Metadata } from 'next'

export const metadata: Metadata = ${JSON.stringify(metadata, null, 2)}

export default function Page() {
  return <${componentName} />
}
`;

// Default metadata for pages
const DEFAULT_METADATA = {
  classifieds: {
    title: 'Community Classifieds - Buy, Sell & Trade Locally',
    description: 'Browse local classifieds for items for sale, housing, jobs, services and more in your community.'
  },
  events: {
    title: 'Local Events - Community Calendar',
    description: 'Discover upcoming events, activities, and gatherings in your local community.'
  },
  sports: {
    title: 'Sports News - Local Sports Coverage',
    description: 'Get the latest sports news, scores, and updates from your local teams and athletes.'
  },
  business: {
    title: 'Business Directory - Local Businesses',
    description: 'Find and support local businesses in your community. Browse by category or search for specific services.'
  },
  photos: {
    title: 'Photo Gallery - Community Photos',
    description: 'Browse photos from local events, news stories, and community gatherings.'
  }
};

// Update page files
function updatePageFile(pagePath, mapping) {
  const fullPath = path.join(PAGES_DIR, pagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating ${pagePath}...`);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } else {
    console.log(`Updating ${pagePath}...`);
  }
  
  // Determine metadata
  const pageType = pagePath.split('/')[0];
  const metadata = DEFAULT_METADATA[pageType];
  
  // Generate content
  const content = metadata 
    ? PAGE_WITH_META_TEMPLATE(mapping.import, mapping.component, metadata)
    : PAGE_TEMPLATE(mapping.import, mapping.component);
  
  fs.writeFileSync(fullPath, content);
  console.log(`  ✓ ${pagePath} updated`);
}

console.log('📄 Updating page routes...\n');

Object.entries(PAGE_MAPPINGS).forEach(([pagePath, mapping]) => {
  updatePageFile(pagePath, mapping);
});

console.log('\n✅ Page routes updated');