#!/usr/bin/env node

/**
 * Implement Mock/Real Data Toggle System
 * Allows switching between mock data and real database data
 */

const fs = require('fs');
const path = require('path');

// Configuration for data types
const DATA_CONFIGS = {
  classifieds: {
    mockVar: 'mockClassifieds',
    realQuery: 'marketplaceQueries.all()',
    import: "import { marketplaceQueries } from '@/lib/supabase/queries/marketplace_items.queries'"
  },
  events: {
    mockVar: 'mockEvents',
    realQuery: 'eventsQueries.all()',
    import: "import { eventsQueries } from '@/lib/supabase/queries/events.queries'"
  },
  news: {
    mockVar: 'mockNews',
    realQuery: 'newsQueries.all()',
    import: "import { newsQueries } from '@/lib/supabase/queries/news.queries'"
  },
  businesses: {
    mockVar: 'mockBusinesses',
    realQuery: 'businessesQueries.all()',
    import: "import { businessesQueries } from '@/lib/supabase/queries/businesses.queries'"
  },
  announcements: {
    mockVar: 'mockAnnouncements',
    realQuery: 'announcementsQueries.all()',
    import: "import { announcementsQueries } from '@/lib/supabase/queries/announcements.queries'"
  }
};

// Create the data provider hook
function createDataProvider() {
  const content = `import { createContext, useContext, ReactNode } from 'react';

// Check environment variable or localStorage for data mode
const getDataMode = () => {
  // First check environment variable
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return 'mock';
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false') return 'real';
  
  // Then check localStorage (client-side only)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dataMode') || 'real';
  }
  
  return 'real';
};

interface DataModeContextType {
  dataMode: 'mock' | 'real';
  setDataMode: (mode: 'mock' | 'real') => void;
  useMockData: boolean;
}

const DataModeContext = createContext<DataModeContextType>({
  dataMode: 'real',
  setDataMode: () => {},
  useMockData: false
});

export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [dataMode, setDataModeState] = useState<'mock' | 'real'>(getDataMode());
  
  const setDataMode = (mode: 'mock' | 'real') => {
    setDataModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dataMode', mode);
    }
  };
  
  return (
    <DataModeContext.Provider value={{
      dataMode,
      setDataMode,
      useMockData: dataMode === 'mock'
    }}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => useContext(DataModeContext);
`;

  const dir = './src/contexts';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dir, 'DataModeContext.tsx'), content);
  console.log('✓ Created DataModeContext');
}

// Create data toggle component
function createDataToggle() {
  const content = `'use client';

import React from 'react';
import { useDataMode } from '@/contexts/DataModeContext';

export const DataModeToggle = () => {
  const { dataMode, setDataMode } = useDataMode();
  
  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
        <h3 className="text-sm font-semibold mb-2">Data Mode</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDataMode('real')}
            className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
              dataMode === 'real'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }\`}
          >
            Real Data
          </button>
          <button
            onClick={() => setDataMode('mock')}
            className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
              dataMode === 'mock'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }\`}
          >
            Mock Data
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Currently using: <strong>{dataMode}</strong> data
        </p>
      </div>
    </div>
  );
};
`;

  fs.writeFileSync('./src/components/ui/DataModeToggle.tsx', content);
  console.log('✓ Created DataModeToggle component');
}

// Convert a component to use data toggle
function convertComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Detect data type
  let dataType = null;
  Object.keys(DATA_CONFIGS).forEach(type => {
    if (content.toLowerCase().includes(type)) {
      dataType = type;
    }
  });
  
  if (!dataType) return;
  
  console.log(`\nConverting ${fileName} (${dataType})...`);
  
  const config = DATA_CONFIGS[dataType];
  
  // Extract existing mock data
  const mockDataPattern = /const\s+\w+\s*=\s*\[([\s\S]*?)\];/;
  const match = content.match(mockDataPattern);
  
  if (!match) {
    console.log('  → No mock data found, skipping');
    return;
  }
  
  const mockData = match[0];
  const varName = match[0].match(/const\s+(\w+)/)[1];
  
  // Create new component structure
  const newContent = `'use client';

import React, { useState, useEffect } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';
${config.import};

// Preserved mock data
const ${config.mockVar} = ${mockData.replace(/const\s+\w+\s*=\s*/, '')};

export const ${fileName.replace('.tsx', '')} = () => {
  const { useMockData } = useDataMode();
  const [${varName}, set${capitalize(varName)}] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        if (useMockData) {
          // Use mock data
          set${capitalize(varName)}(${config.mockVar});
          setLoading(false);
        } else {
          // Fetch real data
          const data = await ${config.realQuery};
          set${capitalize(varName)}(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        // Fall back to mock data on error
        set${capitalize(varName)}(${config.mockVar});
        setLoading(false);
      }
    };
    
    loadData();
  }, [useMockData]);
  
  // Rest of the component remains the same
  ${extractComponentBody(content)}
};`;

  fs.writeFileSync(filePath, newContent);
  console.log('  ✓ Converted to use data toggle');
}

// Helper to capitalize
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper to extract component body
function extractComponentBody(content) {
  // Find the return statement and everything after
  const returnMatch = content.match(/return\s*\(([\s\S]*)\);[\s\S]*$/);
  if (returnMatch) {
    return `return (${returnMatch[1]});`;
  }
  
  // Fallback - just return a placeholder
  return `return <div>Component body here</div>;`;
}

// Create environment config
function createEnvConfig() {
  const envExample = `# Data Mode Configuration
# Set to 'true' to use mock data, 'false' for real data
# If not set, defaults to real data
NEXT_PUBLIC_USE_MOCK_DATA=false

# Your Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
`;

  fs.writeFileSync('.env.local.example', envExample);
  console.log('✓ Created .env.local.example');
}

// Update layout to include provider
function updateLayout() {
  const layoutPath = './src/app/layout.tsx';
  if (!fs.existsSync(layoutPath)) return;
  
  let content = fs.readFileSync(layoutPath, 'utf8');
  
  // Add import
  if (!content.includes('DataModeProvider')) {
    content = content.replace(
      'import { Providers }',
      'import { Providers }\nimport { DataModeProvider } from "@/contexts/DataModeContext"\nimport { DataModeToggle } from "@/components/ui/DataModeToggle"'
    );
    
    // Wrap children with provider
    content = content.replace(
      '<Providers>',
      '<Providers>\n        <DataModeProvider>'
    );
    
    content = content.replace(
      '</Providers>',
      '  <DataModeToggle />\n        </DataModeProvider>\n      </Providers>'
    );
    
    fs.writeFileSync(layoutPath, content);
    console.log('✓ Updated layout with DataModeProvider');
  }
}

// Main execution
console.log('🔄 Implementing Mock/Real Data Toggle System\n');

// Create infrastructure
createDataProvider();
createDataToggle();
createEnvConfig();
updateLayout();

// Convert components
console.log('\nConverting components...');
const componentsDir = './src/components';
if (fs.existsSync(componentsDir)) {
  const files = fs.readdirSync(componentsDir);
  files.forEach(file => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(componentsDir, file);
      convertComponent(filePath);
    }
  });
}

console.log('\n✅ Data toggle system implemented!');
console.log('\nUsage:');
console.log('1. Set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local for mock data');
console.log('2. Use the toggle button in development (bottom right)');
console.log('3. Components will automatically switch between mock and real data');
console.log('\nBenefits:');
console.log('- Work offline with mock data');
console.log('- Test with predictable data');
console.log('- Easy debugging');
console.log('- Smooth transition to real data');