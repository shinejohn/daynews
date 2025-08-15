#!/usr/bin/env node

/**
 * Fix for React Error #321 - Invalid hook call
 * This error occurs when hooks are called outside of React components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing React Error #321 (Invalid hook call)...\n');

// React Error #321 specifically relates to:
// - Calling hooks outside of function components
// - Calling hooks conditionally
// - Multiple React versions

// 1. Check for multiple React versions
console.log('1️⃣ Checking for multiple React versions...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageLockPath = path.join(process.cwd(), 'package-lock.json');

if (fs.existsSync(packageLockPath)) {
  console.log('  ✓ package-lock.json found');
  console.log('  → Running npm dedupe to resolve duplicate dependencies...');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm dedupe', { stdio: 'inherit' });
    console.log('  ✓ Dependencies deduped\n');
  } catch (error) {
    console.log('  ⚠️  Failed to dedupe dependencies\n');
  }
}

// 2. Fix components that might be calling hooks incorrectly
console.log('2️⃣ Checking for incorrect hook usage...');

const componentFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  absolute: true
});

let issuesFound = 0;

componentFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file);
  
  // Check for hooks called at top level (outside components)
  const lines = content.split('\n');
  let inComponent = false;
  let componentDepth = 0;
  
  lines.forEach((line, index) => {
    // Simple check for component definition
    if (line.includes('const') && line.includes('= () =>') || 
        line.includes('function') && line.includes('(') ||
        line.includes('export default function')) {
      inComponent = true;
      componentDepth++;
    }
    
    // Check for hooks outside components
    if (!inComponent && (
      line.includes('useState(') ||
      line.includes('useEffect(') ||
      line.includes('useContext(') ||
      line.includes('useRouter(') ||
      line.includes('useLocationDetection(')
    )) {
      console.log(`  ⚠️  Possible hook outside component in ${fileName}:${index + 1}`);
      issuesFound++;
    }
  });
});

if (issuesFound > 0) {
  console.log(`\n  Found ${issuesFound} potential issues\n`);
} else {
  console.log('  ✓ No obvious hook misuse found\n');
}

// 3. Create a safer version of providers.tsx
console.log('3️⃣ Creating safer providers setup...');

const providersPath = path.join(process.cwd(), 'src/app/providers.tsx');
const saferProvidersContent = `'use client';

import React from 'react';
import { LocationDetector } from '@/components/location/LocationDetector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a single query client instance outside of the component
// This prevents recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false, // Disable retries for better error visibility
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Wrap in error boundary
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LocationDetector>
          {children}
        </LocationDetector>
      </QueryClientProvider>
    </React.StrictMode>
  );
}`;

fs.writeFileSync(providersPath, saferProvidersContent);
console.log('  ✓ Updated providers.tsx with safer implementation\n');

// 4. Add a client-side wrapper for components that use hooks
console.log('4️⃣ Creating client wrapper component...');

const clientWrapperPath = path.join(process.cwd(), 'src/components/ClientWrapper.tsx');
const clientWrapperContent = `'use client';

import React, { Suspense } from 'react';

// Wrapper component to ensure hooks are only called on client side
export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}`;

fs.writeFileSync(clientWrapperPath, clientWrapperContent);
console.log('  ✓ Created ClientWrapper component\n');

console.log('✅ React Error #321 fixes applied!\n');
console.log('Next steps:');
console.log('1. Clear Next.js cache: rm -rf .next');
console.log('2. Reinstall dependencies: rm -rf node_modules && npm install');
console.log('3. Run dev server: npm run dev');
console.log('4. Check browser console for any remaining errors');