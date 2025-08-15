#!/usr/bin/env node

/**
 * Page Component Assembly Fixer
 * Ensures all pages properly render with all their required components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing Page Component Assembly...\n');

// Define complete page structures based on news site patterns
const PAGE_STRUCTURES = {
  'page.tsx': { // Homepage
    name: 'HomePage',
    sections: [
      { component: 'NewspaperMasthead', props: {} },
      { component: 'BreakingNewsBar', props: {} },
      { component: 'HeroSection', props: { showFeaturedStory: true } },
      { 
        component: 'Container',
        children: [
          {
            component: 'Grid',
            props: { cols: 3, gap: 8 },
            children: [
              {
                component: 'Column',
                props: { span: 2 },
                children: [
                  { component: 'FeaturedStories', props: { limit: 5 } },
                  { component: 'LocalEventsSection', props: { limit: 4 } },
                  { component: 'CommunityVoices', props: {} },
                  { component: 'OpinionSection', props: { limit: 3 } },
                  { component: 'PhotoGallerySection', props: { limit: 6 } }
                ]
              },
              {
                component: 'Column',
                props: { span: 1 },
                children: [
                  { component: 'TrendingSection', props: {} },
                  { component: 'MarketplacePreview', props: {} },
                  { component: 'EventsPreview', props: {} },
                  { component: 'CouponsPreview', props: {} },
                  { component: 'AdvertisingColumn', props: {} }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  'national/page.tsx': {
    name: 'NationalPage',
    sections: [
      { component: 'NationalNewsMasthead', props: {} },
      { component: 'CategoryTabs', props: { category: 'national' } },
      {
        component: 'Container',
        children: [
          {
            component: 'Grid',
            props: { cols: 3, gap: 8 },
            children: [
              {
                component: 'Column',
                props: { span: 2 },
                children: [
                  { component: 'HeroStory', props: { category: 'national' } },
                  { component: 'MoreNewsSection', props: { category: 'national' } },
                  { component: 'EssentialReads', props: { category: 'national' } }
                ]
              },
              {
                component: 'Column',
                props: { span: 1 },
                children: [
                  { component: 'TrendingSection', props: { category: 'national' } },
                  { component: 'AdvertisingColumn', props: {} }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  'events/page.tsx': {
    name: 'EventsPage',
    sections: [
      { component: 'CalendarHeader', props: {} },
      { component: 'EventFiltersBar', props: {} },
      {
        component: 'Container',
        children: [
          { component: 'FeaturedEventsCarousel', props: {} },
          {
            component: 'Grid',
            props: { cols: 3, gap: 8 },
            children: [
              {
                component: 'Column',
                props: { span: 2 },
                children: [
                  { component: 'TimeBasedEventList', props: {} },
                  { component: 'EventMapView', props: {} }
                ]
              },
              {
                component: 'Column',
                props: { span: 1 },
                children: [
                  { component: 'EventTypeFilters', props: {} },
                  { component: 'AddEventButton', props: {} },
                  { component: 'AdvertisingColumn', props: {} }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  'classifieds/page.tsx': {
    name: 'ClassifiedsPage',
    sections: [
      { component: 'SearchFilterHero', props: {} },
      {
        component: 'Container',
        children: [
          {
            component: 'Grid',
            props: { cols: 4, gap: 6 },
            children: [
              {
                component: 'Column',
                props: { span: 1 },
                children: [
                  { component: 'CategoryBrowser', props: {} },
                  { component: 'AdvancedFilters', props: {} },
                  { component: 'SafetyTips', props: {} }
                ]
              },
              {
                component: 'Column',
                props: { span: 3 },
                children: [
                  { component: 'FeaturedListings', props: {} },
                  { component: 'ListingToggle', props: {} },
                  { component: 'ListingGrid', props: {} }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  'business-directory/page.tsx': {
    name: 'BusinessDirectoryPage',
    sections: [
      { component: 'BusinessSearchBar', props: {} },
      {
        component: 'Container',
        children: [
          { component: 'PromotedBusinesses', props: {} },
          {
            component: 'Grid',
            props: { cols: 4, gap: 6 },
            children: [
              {
                component: 'Column',
                props: { span: 1 },
                children: [
                  { component: 'CategoryGrid', props: {} },
                  { component: 'FilterSidebar', props: {} }
                ]
              },
              {
                component: 'Column',
                props: { span: 3 },
                children: [
                  { component: 'BusinessMap', props: {} },
                  { component: 'BusinessGrid', props: {} }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

// Component import paths mapping
const COMPONENT_IMPORTS = {
  // Layout
  Container: '@/components/layout/Container',
  Grid: '@/components/layout/Grid',
  Column: '@/components/layout/Column',
  
  // Navigation
  NewspaperMasthead: '@/components/navigation/NewspaperMasthead',
  NationalNewsMasthead: '@/components/navigation/NationalNewsMasthead',
  CategoryTabs: '@/components/navigation/CategoryTabs',
  
  // Hero
  BreakingNewsBar: '@/components/hero/BreakingNewsBar',
  HeroSection: '@/components/hero/HeroSection',
  
  // Content sections
  FeaturedStories: '@/components/content/FeaturedStories',
  LocalEventsSection: '@/components/content/LocalEventsSection',
  CommunityVoices: '@/components/content/CommunityVoices',
  OpinionSection: '@/components/content/OpinionSection',
  PhotoGallerySection: '@/components/content/PhotoGallerySection',
  TrendingSection: '@/components/content/TrendingSection',
  HeroStory: '@/components/content/HeroStory',
  MoreNewsSection: '@/components/content/MoreNewsSection',
  EssentialReads: '@/components/content/EssentialReads',
  
  // Previews
  MarketplacePreview: '@/components/previews/MarketplacePreview',
  EventsPreview: '@/components/previews/EventsPreview',
  CouponsPreview: '@/components/previews/CouponsPreview',
  
  // Advertising
  AdvertisingColumn: '@/components/AdvertisingColumn',
  
  // Events
  CalendarHeader: '@/components/events/CalendarHeader',
  EventFiltersBar: '@/components/events/EventFiltersBar',
  FeaturedEventsCarousel: '@/components/events/FeaturedEventsCarousel',
  TimeBasedEventList: '@/components/events/TimeBasedEventList',
  EventMapView: '@/components/events/EventMapView',
  EventTypeFilters: '@/components/events/EventTypeFilters',
  AddEventButton: '@/components/events/AddEventButton',
  
  // Classifieds
  SearchFilterHero: '@/components/classifieds/SearchFilterHero',
  CategoryBrowser: '@/components/classifieds/CategoryBrowser',
  AdvancedFilters: '@/components/classifieds/AdvancedFilters',
  SafetyTips: '@/components/classifieds/SafetyTips',
  FeaturedListings: '@/components/classifieds/FeaturedListings',
  ListingToggle: '@/components/classifieds/ListingToggle',
  ListingGrid: '@/components/classifieds/ListingGrid',
  
  // Business
  BusinessSearchBar: '@/components/business/BusinessSearchBar',
  PromotedBusinesses: '@/components/business/PromotedBusinesses',
  CategoryGrid: '@/components/business/CategoryGrid',
  FilterSidebar: '@/components/business/FilterSidebar',
  BusinessMap: '@/components/business/BusinessMap',
  BusinessGrid: '@/components/business/BusinessGrid',
};

// Generate component JSX
function generateComponentJSX(section, indent = 2) {
  const spaces = ' '.repeat(indent);
  const componentName = section.component;
  
  // Generate props string
  const propsStr = Object.entries(section.props || {})
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : `${key}={false}`;
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(' ');
  
  if (section.children) {
    const childrenJSX = section.children
      .map(child => generateComponentJSX(child, indent + 2))
      .join('\n');
    
    return `${spaces}<${componentName}${propsStr ? ' ' + propsStr : ''}>
${childrenJSX}
${spaces}</${componentName}>`;
  }
  
  return `${spaces}<${componentName}${propsStr ? ' ' + propsStr : ''} />`;
}

// Generate complete page file
function generatePageFile(pageConfig, isHomePage = false) {
  // Collect all required imports
  const requiredComponents = new Set();
  
  function collectComponents(section) {
    requiredComponents.add(section.component);
    if (section.children) {
      section.children.forEach(collectComponents);
    }
  }
  
  pageConfig.sections.forEach(collectComponents);
  
  // Generate import statements
  const imports = Array.from(requiredComponents)
    .filter(comp => COMPONENT_IMPORTS[comp])
    .map(comp => `import ${comp} from '${COMPONENT_IMPORTS[comp]}';`)
    .join('\n');
  
  // Generate sections JSX
  const sectionsJSX = pageConfig.sections
    .map(section => generateComponentJSX(section, 6))
    .join('\n');
  
  // Generate metadata
  const pageName = pageConfig.name.replace('Page', '');
  const metadata = `
export const metadata = {
  title: '${pageName} | DayNews',
  description: '${pageName} - Your trusted local news source',
};`;

  // Add ISR for news pages
  const revalidate = isHomePage || pageName.includes('National') || pageName.includes('Events') 
    ? '\nexport const revalidate = 300; // ISR - updates every 5 minutes\n' 
    : '';

  return `// ${pageName} - Server Component
import { Metadata } from 'next';
${imports}

${metadata}
${revalidate}
export default function ${pageConfig.name}() {
  return (
    <div className="min-h-screen bg-gray-50">
${sectionsJSX}
    </div>
  );
}`;
}

// Create missing layout components
function createLayoutComponents() {
  // Grid component
  const gridComponent = `interface GridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  className?: string;
}

export default function Grid({ children, cols = 1, gap = 4, className = '' }: GridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[cols] || 'grid-cols-1';
  
  return (
    <div className={\`grid \${colsClass} gap-\${gap} \${className}\`}>
      {children}
    </div>
  );
}`;

  // Column component
  const columnComponent = `interface ColumnProps {
  children: React.ReactNode;
  span?: number;
  className?: string;
}

export default function Column({ children, span = 1, className = '' }: ColumnProps) {
  const spanClass = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
  }[span] || 'col-span-1';
  
  return (
    <div className={\`\${spanClass} \${className}\`}>
      {children}
    </div>
  );
}`;

  // Container component (if not exists)
  const containerComponent = `interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Container({ children, className = '', size = 'xl' }: ContainerProps) {
  const sizeClass = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];
  
  return (
    <div className={\`container mx-auto px-4 sm:px-6 lg:px-8 \${sizeClass} \${className}\`}>
      {children}
    </div>
  );
}`;

  // Create layout components
  const layoutDir = path.join(process.cwd(), 'src/components/layout');
  fs.mkdirSync(layoutDir, { recursive: true });
  
  fs.writeFileSync(path.join(layoutDir, 'Grid.tsx'), gridComponent);
  fs.writeFileSync(path.join(layoutDir, 'Column.tsx'), columnComponent);
  
  if (!fs.existsSync(path.join(layoutDir, 'Container.tsx'))) {
    fs.writeFileSync(path.join(layoutDir, 'Container.tsx'), containerComponent);
  }
  
  console.log('✅ Created layout components');
}

// Main execution
let fixedPages = 0;
let errors = [];

// Create layout components first
createLayoutComponents();

// Fix each page
Object.entries(PAGE_STRUCTURES).forEach(([pagePath, pageConfig]) => {
  const fullPath = path.join(process.cwd(), 'src/app', pagePath);
  
  try {
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    
    // Generate page content
    const isHomePage = pagePath === 'page.tsx';
    const pageContent = generatePageFile(pageConfig, isHomePage);
    
    // Write file
    fs.writeFileSync(fullPath, pageContent);
    
    console.log(`✅ Fixed page assembly: ${pagePath}`);
    fixedPages++;
    
  } catch (error) {
    console.error(`❌ Failed to fix ${pagePath}: ${error.message}`);
    errors.push({ page: pagePath, error: error.message });
  }
});

// Create placeholder components for any missing ones
const allComponents = Object.keys(COMPONENT_IMPORTS);
allComponents.forEach(componentName => {
  const importPath = COMPONENT_IMPORTS[componentName];
  const componentPath = path.join(process.cwd(), importPath.replace('@/', 'src/') + '.tsx');
  
  if (!fs.existsSync(componentPath)) {
    const dir = path.dirname(componentPath);
    fs.mkdirSync(dir, { recursive: true });
    
    // Create placeholder component
    const placeholderComponent = `// ${componentName} Component
export default function ${componentName}(props: any) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">${componentName}</h3>
      <p className="text-gray-600">Component placeholder - implement with real content</p>
      {/* TODO: Implement ${componentName} */}
    </div>
  );
}`;
    
    fs.writeFileSync(componentPath, placeholderComponent);
    console.log(`📝 Created placeholder: ${componentName}`);
  }
});

// Summary
console.log(`
✨ Page Assembly Fix Complete!

📊 Results:
- Fixed ${fixedPages} pages with proper component structure
- Created layout components (Grid, Column, Container)
- Generated placeholder components for missing ones
${errors.length > 0 ? `- Errors: ${errors.length}` : ''}

🎯 What was done:
1. Each page now has complete component hierarchy
2. All sections properly structured with containers and grids
3. Components properly imported and organized
4. Layout follows responsive design patterns
5. Server-side rendering configured for SEO

📝 Next steps:
1. Implement placeholder components with real functionality
2. Connect data sources to components
3. Style components to match design
4. Test responsive layout on different devices
`);

if (errors.length > 0) {
  console.log('\n❌ Errors encountered:');
  errors.forEach(({ page, error }) => {
    console.log(`  - ${page}: ${error}`);
  });
}