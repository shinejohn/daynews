#!/usr/bin/env node

console.log('🔨 Running pre-build checks...\n');

const fs = require('fs');
const path = require('path');

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missing = [];

// Check both .env.local and process.env
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    // Try to load from .env.local
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const regex = new RegExp(`^${varName}=(.+)$`, 'm');
      const match = envContent.match(regex);
      if (!match || match[1] === 'your-project-url-here' || match[1] === 'your-anon-key-here') {
        missing.push(varName);
      }
    } else {
      missing.push(varName);
    }
  }
});

if (missing.length > 0) {
  console.warn('⚠️  Missing required environment variables:');
  missing.forEach(v => console.warn(`   - ${v}`));
  console.warn('\nThe build will continue, but the app may not function properly.');
  console.warn('Please set these in your Vercel dashboard or .env.local file.\n');
}

// Ensure TypeScript declaration files exist
const declarationsPath = path.join('src', 'types', 'declarations.d.ts');
if (!fs.existsSync(declarationsPath)) {
  const declarations = `// Type declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

// Extend window interface if needed
declare global {
  interface Window {
    // Add custom window properties here
  }
}

export {};
`;
  fs.mkdirSync(path.dirname(declarationsPath), { recursive: true });
  fs.writeFileSync(declarationsPath, declarations);
  console.log('✓ Created TypeScript declarations');
}

// Set production data source
if (process.env.NODE_ENV === 'production') {
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
  console.log('✓ Set production data source to real data');
}

console.log('\n✅ Pre-build checks complete');
