#!/usr/bin/env node

/**
 * Implement Page-Level Mock/Real Data Toggle
 * Each page can independently switch between mock and real data
 */

const fs = require('fs');
const path = require('path');

// Create a simple useDataSource hook
function createDataSourceHook() {
  const content = `import { useState, useEffect } from 'react';

export type DataSource = 'mock' | 'real';

interface UseDataSourceOptions<T> {
  mockData: T[];
  fetchRealData: () => Promise<T[]>;
  defaultSource?: DataSource;
  storageKey?: string;
}

export function useDataSource<T>({
  mockData,
  fetchRealData,
  defaultSource = 'real',
  storageKey
}: UseDataSourceOptions<T>) {
  // Get initial source from localStorage or use default
  const getInitialSource = (): DataSource => {
    if (typeof window !== 'undefined' && storageKey) {
      const stored = localStorage.getItem(\`dataSource_\${storageKey}\`);
      if (stored === 'mock' || stored === 'real') return stored;
    }
    return defaultSource;
  };

  const [dataSource, setDataSource] = useState<DataSource>(getInitialSource());
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update localStorage when source changes
  const changeDataSource = (source: DataSource) => {
    setDataSource(source);
    if (typeof window !== 'undefined' && storageKey) {
      localStorage.setItem(\`dataSource_\${storageKey}\`, source);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (dataSource === 'mock') {
          // Simulate network delay for mock data
          await new Promise(resolve => setTimeout(resolve, 300));
          if (!cancelled) {
            setData(mockData);
          }
        } else {
          const realData = await fetchRealData();
          if (!cancelled) {
            setData(realData || []);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching data:', err);
          setError(err.message || 'Failed to load data');
          // Optionally fall back to mock data on error
          setData(mockData);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [dataSource]);

  return {
    data,
    loading,
    error,
    dataSource,
    setDataSource: changeDataSource,
    isUsingMockData: dataSource === 'mock'
  };
}
`;

  const dir = './src/hooks';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dir, 'useDataSource.ts'), content);
  console.log('✓ Created useDataSource hook');
}

// Create DataSourceToggle component
function createDataSourceToggle() {
  const content = `'use client';

import React from 'react';

interface DataSourceToggleProps {
  dataSource: 'mock' | 'real';
  onToggle: (source: 'mock' | 'real') => void;
  className?: string;
  showInProduction?: boolean;
}

export const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  dataSource,
  onToggle,
  className = '',
  showInProduction = false
}) => {
  // Hide in production unless explicitly allowed
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  return (
    <div className={\`inline-flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2 \${className}\`}>
      <span className="text-xs font-medium text-gray-600">Data:</span>
      <div className="flex items-center bg-gray-100 rounded-md p-0.5">
        <button
          onClick={() => onToggle('real')}
          className={\`px-3 py-1 rounded text-xs font-medium transition-colors \${
            dataSource === 'real'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }\`}
        >
          Real
        </button>
        <button
          onClick={() => onToggle('mock')}
          className={\`px-3 py-1 rounded text-xs font-medium transition-colors \${
            dataSource === 'mock'
              ? 'bg-white text-yellow-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }\`}
        >
          Mock
        </button>
      </div>
    </div>
  );
};
`;

  const dir = './src/components/ui';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dir, 'DataSourceToggle.tsx'), content);
  console.log('✓ Created DataSourceToggle component');
}

// Example conversion for a component
function createExampleConversion() {
  const content = `'use client';

import React from 'react';
import { useDataSource } from '@/hooks/useDataSource';
import { DataSourceToggle } from '@/components/ui/DataSourceToggle';
import { eventsQueries } from '@/lib/supabase/queries/events.queries';

// Mock data - preserved from original component
const mockEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Join us for an evening of live music featuring local bands.',
    start_date: '2024-07-15T18:00:00',
    location: 'Central Park Amphitheater',
    category: 'Music',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    price: 25
  },
  {
    id: '2',
    title: 'Farmers Market',
    description: 'Fresh local produce, artisan goods, and family fun.',
    start_date: '2024-07-16T08:00:00',
    location: 'Downtown Square',
    category: 'Community',
    image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9',
    price: 0
  }
  // ... more mock data
];

export const EventsPageExample = () => {
  // Use the data source hook
  const {
    data: events,
    loading,
    error,
    dataSource,
    setDataSource
  } = useDataSource({
    mockData: mockEvents,
    fetchRealData: async () => {
      // Real data fetching
      return await eventsQueries.all();
    },
    defaultSource: 'real', // or 'mock' for development
    storageKey: 'eventsPage' // Unique key for this page
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && dataSource === 'real') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">Error loading events</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => setDataSource('mock')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Use Mock Data Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header with Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        <DataSourceToggle
          dataSource={dataSource}
          onToggle={setDataSource}
        />
      </div>

      {/* Data source indicator */}
      {dataSource === 'mock' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            📊 Using mock data. Switch to "Real" to see live events.
          </p>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={event.image_url || '/images/placeholder-event.jpg'}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{event.location}</span>
                <span className="text-sm font-medium">
                  {event.price === 0 ? 'Free' : \`$\${event.price}\`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found.</p>
        </div>
      )}
    </div>
  );
};
`;

  fs.writeFileSync('./src/components/EventsPageExample.tsx', content);
  console.log('✓ Created example component');
}

// Generate conversion guide
function createConversionGuide() {
  const guide = `# Page-Level Data Toggle Implementation Guide

## Overview
This system allows each page/component to independently switch between mock and real data.

## How to Convert a Component

### 1. Import the Hook and Toggle
\`\`\`typescript
import { useDataSource } from '@/hooks/useDataSource';
import { DataSourceToggle } from '@/components/ui/DataSourceToggle';
import { yourQueries } from '@/lib/supabase/queries/your.queries';
\`\`\`

### 2. Move Mock Data Outside Component
\`\`\`typescript
// Preserve your existing mock data
const mockData = [
  // ... your mock data
];
\`\`\`

### 3. Use the Hook
\`\`\`typescript
const {
  data,
  loading,
  error,
  dataSource,
  setDataSource
} = useDataSource({
  mockData: mockData,
  fetchRealData: async () => {
    return await yourQueries.all();
  },
  defaultSource: 'real', // or 'mock' for dev
  storageKey: 'uniquePageKey' // Optional: remembers choice
});
\`\`\`

### 4. Add Toggle to UI
\`\`\`typescript
<DataSourceToggle
  dataSource={dataSource}
  onToggle={setDataSource}
/>
\`\`\`

## Benefits

1. **Page Independence**: Each page controls its own data source
2. **Development Friendly**: Work on one page with mock data while others use real
3. **Testing**: Easy to test with predictable mock data
4. **Debugging**: Isolate frontend issues from backend
5. **Demo Mode**: Show specific pages with sample data
6. **Offline Development**: Work without database connection
7. **Graceful Fallback**: Automatically use mock data if real data fails

## Environment Variables (Optional)

You can set default behavior per environment:

\`\`\`env
# .env.development
NEXT_PUBLIC_DEFAULT_DATA_SOURCE=mock

# .env.production  
NEXT_PUBLIC_DEFAULT_DATA_SOURCE=real
\`\`\`

Then use in your components:
\`\`\`typescript
defaultSource: process.env.NEXT_PUBLIC_DEFAULT_DATA_SOURCE as DataSource || 'real'
\`\`\`

## Advanced Usage

### Custom Loading States
\`\`\`typescript
if (loading) {
  return <YourCustomLoadingComponent />;
}
\`\`\`

### Error Handling with Fallback
\`\`\`typescript
if (error && dataSource === 'real') {
  // Offer to switch to mock data
  return (
    <ErrorDisplay
      message={error}
      onUseMockData={() => setDataSource('mock')}
    />
  );
}
\`\`\`

### Conditional Features
\`\`\`typescript
{dataSource === 'mock' && (
  <Banner>Using sample data</Banner>
)}
\`\`\`

## Quick Conversion Script

Run this to convert a component:
\`\`\`bash
node scripts/convert-component-to-toggle.js src/components/YourComponent.tsx
\`\`\`
`;

  fs.writeFileSync('./DATA_TOGGLE_GUIDE.md', guide);
  console.log('✓ Created implementation guide');
}

// Create a component converter script
function createComponentConverter() {
  const content = `#!/usr/bin/env node

/**
 * Convert a single component to use data toggle
 * Usage: node convert-component-to-toggle.js path/to/component.tsx
 */

const fs = require('fs');
const path = require('path');

const componentPath = process.argv[2];
if (!componentPath) {
  console.error('Usage: node convert-component-to-toggle.js path/to/component.tsx');
  process.exit(1);
}

if (!fs.existsSync(componentPath)) {
  console.error('File not found:', componentPath);
  process.exit(1);
}

const content = fs.readFileSync(componentPath, 'utf8');

// Extract mock data
const mockDataMatch = content.match(/const\\s+(\\w+)\\s*=\\s*\\[([\\s\\S]*?)\\];/);
if (!mockDataMatch) {
  console.log('No mock data array found in component');
  process.exit(0);
}

const varName = mockDataMatch[1];
const mockData = mockDataMatch[0];

// Detect data type
let queryImport = '';
let fetchFunction = '';

if (varName.toLowerCase().includes('event')) {
  queryImport = "import { eventsQueries } from '@/lib/supabase/queries/events.queries';";
  fetchFunction = 'eventsQueries.all()';
} else if (varName.toLowerCase().includes('classif')) {
  queryImport = "import { marketplaceQueries } from '@/lib/supabase/queries/marketplace_items.queries';";
  fetchFunction = 'marketplaceQueries.all()';
} else {
  queryImport = "// TODO: Import your query functions";
  fetchFunction = "[] // TODO: Add real data fetching";
}

// Generate new component
const componentName = path.basename(componentPath, '.tsx');
const newContent = \`'use client';

import React from 'react';
import { useDataSource } from '@/hooks/useDataSource';
import { DataSourceToggle } from '@/components/ui/DataSourceToggle';
\${queryImport}

// Preserved mock data
\${mockData.replace(/const\\s+\\w+/, 'const mock' + varName.charAt(0).toUpperCase() + varName.slice(1))}

export const \${componentName} = () => {
  const {
    data: \${varName},
    loading,
    error,
    dataSource,
    setDataSource
  } = useDataSource({
    mockData: mock\${varName.charAt(0).toUpperCase() + varName.slice(1)},
    fetchRealData: async () => {
      return await \${fetchFunction};
    },
    defaultSource: 'real',
    storageKey: '\${componentName.toLowerCase()}'
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && dataSource === 'real') {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => setDataSource('mock')}>Use Mock Data</button>
      </div>
    );
  }

  return (
    <div>
      <DataSourceToggle dataSource={dataSource} onToggle={setDataSource} />
      {/* Rest of your component */}
    </div>
  );
};\`;

// Create backup
fs.writeFileSync(componentPath + '.backup', content);
console.log('✓ Created backup:', componentPath + '.backup');

// Write new content
fs.writeFileSync(componentPath, newContent);
console.log('✓ Converted:', componentPath);
console.log('\\nNext steps:');
console.log('1. Review and complete the TODO items');
console.log('2. Copy the rest of your component logic');
console.log('3. Test with both mock and real data');
`;

  fs.writeFileSync('./scripts/convert-component-to-toggle.js', content);
  fs.chmodSync('./scripts/convert-component-to-toggle.js', '755');
  console.log('✓ Created component converter script');
}

// Main execution
console.log('🔄 Implementing Page-Level Data Toggle System\n');

// Create infrastructure
createDataSourceHook();
createDataSourceToggle();
createExampleConversion();
createConversionGuide();
createComponentConverter();

console.log('\n✅ Page-level data toggle system created!');
console.log('\nFeatures:');
console.log('- Each page controls its own data source');
console.log('- Remembers choice per page (localStorage)');
console.log('- Graceful fallback to mock on errors');
console.log('- Clean, simple implementation');
console.log('- Development-friendly toggle UI');
console.log('\nSee DATA_TOGGLE_GUIDE.md for implementation details');
console.log('See EventsPageExample.tsx for a complete example');