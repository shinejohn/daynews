const fs = require('fs');

console.log('🔧 Fixing routes to match actual database...\n');

// Routes that need to be removed (no table exists)
const routesToRemove = [
  'src/app/classifieds',
  'src/app/legal', 
  'src/app/memorials',
  'src/app/archive',
  'src/app/photos' // Will be replaced with business-photos
];

// Routes to rename
const routesToRename = {
  'src/app/coupons': 'src/app/deals'
};

// Remove non-existent routes
routesToRemove.forEach(route => {
  if (fs.existsSync(route)) {
    fs.rmSync(route, { recursive: true });
    console.log(`❌ Removed ${route} (no matching table)`);
  }
});

// Rename routes
Object.entries(routesToRename).forEach(([oldPath, newPath]) => {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✏️  Renamed ${oldPath} → ${newPath}`);
  }
});

// Update deals routes to use correct table
if (fs.existsSync('src/app/deals')) {
  ['page.tsx', '[id]/page.tsx', 'create/page.tsx'].forEach(file => {
    const filePath = `src/app/deals/${file}`;
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/Coupon/g, 'Deal');
      content = content.replace(/coupon/g, 'deal');
      fs.writeFileSync(filePath, content);
    }
  });
  console.log('✅ Updated deals routes to use deals table');
}

// Create new routes for missing features
const newRoutes = [
  {
    path: 'src/app/reviews',
    component: 'ReviewsPage',
    table: 'reviews'
  },
  {
    path: 'src/app/journalists', 
    component: 'VirtualJournalistsPage',
    table: 'virtual_journalists'
  },
  {
    path: 'src/app/messages',
    component: 'MessagesPage', 
    table: 'messages'
  }
];

newRoutes.forEach(({ path, component, table }) => {
  fs.mkdirSync(path, { recursive: true });
  
  const pageContent = `import { ${component} } from '@/components/${component}'
import { createServerClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('${table}')
    .select('*')
    .order('created_at', { ascending: false })
    
  return <${component} data={data} />
}
`;
  
  fs.writeFileSync(`${path}/page.tsx`, pageContent);
  console.log(`✅ Created ${path} for ${table} table`);
});

console.log('\n📝 Routes now match your actual database!');
