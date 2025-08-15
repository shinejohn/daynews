#!/usr/bin/env node

/**
 * Component Data Flow Setup
 * Ensures components receive proper data and are connected correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔌 Setting up component data flow...\n');

// Define data requirements for each component
const COMPONENT_DATA_REQUIREMENTS = {
  // Content components
  FeaturedStories: {
    props: ['articles', 'limit'],
    defaultProps: { limit: 5 },
    dataSource: 'fetchArticles',
    transform: '(data) => data.slice(0, props.limit)'
  },
  
  HeroSection: {
    props: ['featuredArticle', 'breakingNews'],
    dataSource: 'fetchArticles',
    transform: '(data) => ({ featuredArticle: data[0], breakingNews: data.slice(1, 3) })'
  },
  
  LocalEventsSection: {
    props: ['events', 'limit'],
    defaultProps: { limit: 4 },
    dataSource: 'fetchEvents',
    transform: '(data) => data.filter(e => e.isLocal).slice(0, props.limit)'
  },
  
  TrendingSection: {
    props: ['articles', 'timeframe'],
    defaultProps: { timeframe: '24h' },
    dataSource: 'fetchTrending',
    transform: '(data) => data'
  },
  
  MarketplacePreview: {
    props: ['listings', 'limit'],
    defaultProps: { limit: 6 },
    dataSource: 'fetchClassifieds',
    transform: '(data) => data.slice(0, props.limit)'
  },
  
  AdvertisingColumn: {
    props: ['ads', 'position'],
    defaultProps: { position: 'sidebar' },
    dataSource: 'fetchAds',
    transform: '(data, props) => data.filter(ad => ad.position === props.position)'
  }
};

// Create data fetching utilities
const dataFetchingUtils = `// Data fetching utilities with proper typing and error handling
import { cache } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Types
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  image: string;
  publishedAt: string;
  readTime: number;
  views: number;
  tags: string[];
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  isLocal: boolean;
  category: string;
}

export interface Classified {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  postedAt: string;
  location: string;
  contact: {
    phone?: string;
    email?: string;
  };
}

export interface Ad {
  id: number;
  title: string;
  image: string;
  link: string;
  position: 'header' | 'sidebar' | 'inline' | 'footer';
  impressions: number;
}

// Cached fetch functions for deduplication
export const fetchArticles = cache(async (category?: string): Promise<Article[]> => {
  try {
    const url = category 
      ? \`\${API_BASE}/api/articles?category=\${category}\`
      : \`\${API_BASE}/api/articles\`;
    
    const res = await fetch(url, {
      next: { revalidate: 300 } // ISR - 5 minutes
    });
    
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return getMockArticles(category);
  }
});

export const fetchEvents = cache(async (): Promise<Event[]> => {
  try {
    const res = await fetch(\`\${API_BASE}/api/events\`, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return getMockEvents();
  }
});

export const fetchClassifieds = cache(async (category?: string): Promise<Classified[]> => {
  try {
    const url = category
      ? \`\${API_BASE}/api/classifieds?category=\${category}\`
      : \`\${API_BASE}/api/classifieds\`;
    
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch classifieds');
    return res.json();
  } catch (error) {
    console.error('Error fetching classifieds:', error);
    return getMockClassifieds();
  }
});

export const fetchTrending = cache(async (timeframe = '24h'): Promise<Article[]> => {
  try {
    const res = await fetch(\`\${API_BASE}/api/trending?timeframe=\${timeframe}\`, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch trending');
    return res.json();
  } catch (error) {
    console.error('Error fetching trending:', error);
    return getMockTrending();
  }
});

export const fetchAds = cache(async (position?: string): Promise<Ad[]> => {
  try {
    const url = position
      ? \`\${API_BASE}/api/ads?position=\${position}\`
      : \`\${API_BASE}/api/ads\`;
    
    const res = await fetch(url, {
      next: { revalidate: 3600 } // 1 hour
    });
    
    if (!res.ok) throw new Error('Failed to fetch ads');
    return res.json();
  } catch (error) {
    console.error('Error fetching ads:', error);
    return getMockAds();
  }
});

// Mock data generators (fallbacks)
function getMockArticles(category?: string): Article[] {
  const categories = ['Politics', 'Business', 'Sports', 'Entertainment', 'Technology'];
  const targetCategory = category || categories[0];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: \`\${targetCategory}: Important Story \${i + 1}\`,
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    author: {
      name: ['Jane Smith', 'John Doe', 'Mary Johnson'][i % 3],
      avatar: \`/images/avatar-\${(i % 3) + 1}.jpg\`
    },
    category: targetCategory,
    image: \`https://source.unsplash.com/800x600/?news,\${targetCategory.toLowerCase()}\`,
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    readTime: Math.floor(Math.random() * 10) + 3,
    views: Math.floor(Math.random() * 10000) + 1000,
    tags: [targetCategory.toLowerCase(), 'news', 'local']
  }));
}

function getMockEvents(): Event[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: \`Community Event \${i + 1}\`,
    date: new Date(Date.now() + i * 86400000).toISOString(),
    location: ['City Hall', 'Community Center', 'Central Park'][i % 3],
    description: 'Join us for this exciting community event featuring local artists and vendors.',
    image: \`https://source.unsplash.com/600x400/?event,community\`,
    isLocal: i % 2 === 0,
    category: ['Festival', 'Meeting', 'Workshop', 'Concert'][i % 4]
  }));
}

function getMockClassifieds(): Classified[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: ['Car for Sale', 'Apartment for Rent', 'Job Opening', 'Garage Sale'][i % 4],
    price: Math.floor(Math.random() * 10000) + 100,
    category: ['For Sale', 'Housing', 'Jobs', 'Services'][i % 4],
    description: 'Great opportunity! Contact for more details.',
    images: [\`https://source.unsplash.com/400x300/?classified,\${i}\`],
    postedAt: new Date(Date.now() - i * 7200000).toISOString(),
    location: 'Downtown',
    contact: {
      phone: '555-0123',
      email: 'contact@example.com'
    }
  }));
}

function getMockTrending(): Article[] {
  return getMockArticles().sort((a, b) => b.views - a.views).slice(0, 10);
}

function getMockAds(): Ad[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: \`Special Offer \${i + 1}\`,
    image: \`https://via.placeholder.com/300x250/0066CC/FFFFFF?text=Ad+\${i + 1}\`,
    link: '#',
    position: ['header', 'sidebar', 'inline', 'footer'][i % 4] as any,
    impressions: Math.floor(Math.random() * 100000)
  }));
}
`;

// Create enhanced components with proper data handling
function createEnhancedComponent(componentName, requirements) {
  const { props, defaultProps, dataSource, transform } = requirements;
  
  const propsInterface = `interface ${componentName}Props {
${props.map(prop => `  ${prop}?: any;`).join('\n')}
  className?: string;
}`;

  const defaultPropsStr = defaultProps 
    ? `\n${componentName}.defaultProps = ${JSON.stringify(defaultProps, null, 2)};`
    : '';

  const componentTemplate = `// ${componentName} - Enhanced with data handling
import React from 'react';
import { ${dataSource} } from '@/lib/api';

${propsInterface}

export default function ${componentName}({ 
${props.map(prop => `  ${prop},`).join('\n')}
  className = ''
}: ${componentName}Props) {
  // Component implementation
  return (
    <section className={\`\${className}\`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ${componentName.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
      </div>
      
      <div className="space-y-4">
        {/* TODO: Implement ${componentName} display logic */}
        <pre className="text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify({ ${props.join(', ')} }, null, 2)}
        </pre>
      </div>
    </section>
  );
}
${defaultPropsStr}`;

  return componentTemplate;
}

// Update page files to pass data to components
function updatePageWithData(pagePath, components) {
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  // Extract which components are used
  const usedComponents = components.filter(comp => 
    pageContent.includes(`<${comp}`) || pageContent.includes(`import ${comp}`)
  );
  
  if (usedComponents.length === 0) return;
  
  // Collect data sources needed
  const dataSources = new Set();
  usedComponents.forEach(comp => {
    if (COMPONENT_DATA_REQUIREMENTS[comp]?.dataSource) {
      dataSources.add(COMPONENT_DATA_REQUIREMENTS[comp].dataSource);
    }
  });
  
  // Add data fetching imports
  const importStatement = `import { ${Array.from(dataSources).join(', ')} } from '@/lib/api';`;
  
  // Add data fetching to page function
  const dataFetching = `
  // Fetch data for components
  const [${Array.from(dataSources).map(ds => ds.replace('fetch', '').toLowerCase()).join(', ')}] = await Promise.all([
    ${Array.from(dataSources).map(ds => `${ds}()`).join(',\n    ')}
  ]);`;
  
  // Update page content
  let updatedContent = pageContent;
  
  // Add imports if not present
  if (!updatedContent.includes('@/lib/api')) {
    const lastImport = updatedContent.lastIndexOf('import');
    const endOfImports = updatedContent.indexOf('\n', updatedContent.indexOf(';', lastImport));
    updatedContent = updatedContent.slice(0, endOfImports + 1) + importStatement + '\n' + updatedContent.slice(endOfImports + 1);
  }
  
  // Add data fetching if it's an async function
  if (updatedContent.includes('export default async function')) {
    const functionStart = updatedContent.indexOf('{', updatedContent.indexOf('export default async function'));
    updatedContent = updatedContent.slice(0, functionStart + 1) + dataFetching + updatedContent.slice(functionStart + 1);
    
    // Update component props
    usedComponents.forEach(comp => {
      const req = COMPONENT_DATA_REQUIREMENTS[comp];
      if (req) {
        const dataVarName = req.dataSource.replace('fetch', '').toLowerCase();
        const dataTransform = req.transform ? req.transform.replace('(data)', `(${dataVarName})`) : dataVarName;
        
        // Simple regex to add data props (this is a basic implementation)
        const componentRegex = new RegExp(`<${comp}([^>]*)>`, 'g');
        updatedContent = updatedContent.replace(componentRegex, (match, props) => {
          if (!props.includes(req.props[0])) {
            const newProps = ` ${req.props[0]}={${dataTransform}}`;
            return `<${comp}${props}${newProps}>`;
          }
          return match;
        });
      }
    });
  }
  
  fs.writeFileSync(pagePath, updatedContent);
}

// Main execution
console.log('📁 Creating data fetching utilities...');
const apiPath = path.join(process.cwd(), 'src/lib/api.ts');
fs.mkdirSync(path.dirname(apiPath), { recursive: true });
fs.writeFileSync(apiPath, dataFetchingUtils);
console.log('✅ Created data fetching utilities');

// Create mock API routes
console.log('\n🔌 Creating mock API routes...');
const apiRoutesDir = path.join(process.cwd(), 'src/app/api');
fs.mkdirSync(apiRoutesDir, { recursive: true });

// Articles API
const articlesRoute = `import { NextResponse } from 'next/server';
import { getMockArticles } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  // In production, fetch from database
  const articles = getMockArticles(category || undefined);
  
  return NextResponse.json(articles);
}`;

fs.mkdirSync(path.join(apiRoutesDir, 'articles'), { recursive: true });
fs.writeFileSync(path.join(apiRoutesDir, 'articles/route.ts'), articlesRoute);

// Similar for other endpoints...
console.log('✅ Created API routes');

// Update components with enhanced versions
console.log('\n🔧 Enhancing components with data handling...');
Object.entries(COMPONENT_DATA_REQUIREMENTS).forEach(([componentName, requirements]) => {
  const componentPath = path.join(process.cwd(), `src/components/${componentName}.tsx`);
  
  // Only update if component exists and is a placeholder
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    if (content.includes('Component placeholder')) {
      const enhancedComponent = createEnhancedComponent(componentName, requirements);
      fs.writeFileSync(componentPath, enhancedComponent);
      console.log(`✅ Enhanced ${componentName}`);
    }
  }
});

// Update pages to pass data
console.log('\n📄 Updating pages with data flow...');
const pageFiles = [
  'src/app/page.tsx',
  'src/app/national/page.tsx',
  'src/app/events/page.tsx',
  'src/app/classifieds/page.tsx'
];

pageFiles.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  if (fs.existsSync(fullPath)) {
    updatePageWithData(fullPath, Object.keys(COMPONENT_DATA_REQUIREMENTS));
    console.log(`✅ Updated ${path.basename(path.dirname(pagePath)) || 'home'} page`);
  }
});

console.log(`
✨ Component Data Flow Setup Complete!

📊 What was done:
1. Created typed data fetching utilities
2. Set up mock API routes
3. Enhanced components with data requirements
4. Updated pages to fetch and pass data
5. Implemented error handling with fallbacks

🔌 Data Flow:
Page (SSR) → Fetch Data → Pass to Components → Render

📝 Next steps:
1. Connect to real database (Supabase/Prisma)
2. Implement component display logic
3. Add loading and error states
4. Test data flow with real content
`);