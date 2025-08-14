#!/usr/bin/env node

console.log('📦 Running post-install setup...\n');

const fs = require('fs');
const path = require('path');

// Ensure required directories exist
const dirs = [
  'src/app',
  'src/components',
  'src/lib',
  'src/hooks',
  'src/types',
  'public',
  '.vercel'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created ${dir}`);
  }
});

// Create .env.local template if it doesn't exist
if (!fs.existsSync('.env.local')) {
  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Mock Data Toggle (set to 'false' for production)
NEXT_PUBLIC_USE_MOCK_DATA=false

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;
  fs.writeFileSync('.env.local', envTemplate);
  console.log('✓ Created .env.local template');
}

console.log('\n✅ Post-install setup complete');
