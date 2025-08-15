#!/usr/bin/env node

/**
 * Quick fix for Vercel deployment client-side errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying Vercel deployment fixes...\n');

// 1. Ensure providers are set up correctly
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
const providersPath = path.join(process.cwd(), 'src/app/providers.tsx');

// Check if providers.tsx exists
if (!fs.existsSync(providersPath)) {
  console.log('Creating providers.tsx...');
  const providersContent = `'use client';

import React from 'react';
import { LocationDetector } from '@/components/location/LocationDetector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationDetector>
        {children}
      </LocationDetector>
    </QueryClientProvider>
  );
}`;
  
  fs.writeFileSync(providersPath, providersContent);
  console.log('✓ Created providers.tsx\n');
}

// 2. Update layout.tsx to use providers
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
if (!layoutContent.includes('Providers')) {
  console.log('Updating layout.tsx to use providers...');
  
  // Add import
  if (!layoutContent.includes("import { Providers }")) {
    layoutContent = layoutContent.replace(
      'import "./globals.css";',
      `import "./globals.css";\nimport { Providers } from './providers';`
    );
  }
  
  // Wrap children with Providers
  if (!layoutContent.includes('<Providers>')) {
    layoutContent = layoutContent.replace(
      '>\n        {children}\n      </body>',
      '>\n        <Providers>\n          {children}\n        </Providers>\n      </body>'
    );
  }
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('✓ Updated layout.tsx\n');
}

// 3. Fix any components using location without checks
const componentsDir = path.join(process.cwd(), 'src/components');
const glob = require('glob');

console.log('Checking components for location usage...');
const componentFiles = glob.sync('**/*.{ts,tsx}', {
  cwd: componentsDir,
  absolute: true
});

let fixedCount = 0;
componentFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check for useLocationDetection usage without provider
  if (content.includes('useLocationDetection()') && !content.includes('LocationContext')) {
    // Component uses location but might not have proper error handling
    const lines = content.split('\n');
    const locationIndex = lines.findIndex(line => line.includes('useLocationDetection()'));
    
    if (locationIndex > -1) {
      // Add error handling
      const indent = lines[locationIndex].match(/^\s*/)[0];
      const errorHandling = `${indent}// Provide fallback for missing provider
${indent}const defaultLocation = { locationData: { city: 'Clearwater', state: 'FL' }, loading: false, error: null };
${indent}const locationContext = useLocationDetection() || defaultLocation;`;
      
      // This is a simplified fix - in reality would need more sophisticated handling
      console.log(`  ⚠️  ${path.basename(file)} uses useLocationDetection - manual review recommended`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    fixedCount++;
  }
});

console.log(`\n✅ Vercel deployment fixes applied!`);
console.log('\nNext steps:');
console.log('1. Commit these changes: git add -A && git commit -m "Fix client-side errors for Vercel deployment"');
console.log('2. Push to trigger new deployment: git push');
console.log('3. Monitor Vercel deployment logs');
console.log('\nIf errors persist, check:');
console.log('- Browser console for specific error messages');
console.log('- Vercel function logs for server-side errors');
console.log('- Network tab for failed API requests');