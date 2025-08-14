const fs = require('fs');

console.log('🔍 Comparing Routes to Database Tables\n');

// Get all current routes
const routes = [];
function findRoutes(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = `${dir}/${file}`;
    if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.')) {
      findRoutes(fullPath, `${basePath}/${file}`);
    } else if (file === 'page.tsx' && basePath !== '') {
      routes.push(basePath.substring(1)); // Remove leading /
    }
  });
}
findRoutes('src/app');

// Database tables from your schema
const dbTables = [
  'achievements',
  'analytics_events',
  'announcements',
  'business_hours',
  'business_photos',
  'business_responses',
  'business_subscriptions',
  'businesses',
  'categories',
  'chats',
  'check_ins',
  'comments',
  'communities',
  'connections',
  'deal_redemptions',
  'deals',
  'events',
  'favorites',
  'messages',
  'news',
  'notifications',
  'point_transactions',
  'referrals',
  'review_photos',
  'review_votes',
  'reviews',
  'subscription_plans_config',
  'user_achievements',
  'user_points',
  'users',
  'virtual_journalists'
];

// Expected routes based on UI components
const expectedRoutes = [
  'about',
  'accessibility',
  'admin',
  'admin/journalists',
  'advertising',
  'advertising/[id]',
  'advertising/promote',
  'announcements',
  'announcements/[id]',
  'announcements/create',
  'archive',          // DELETED - needs restore
  'article/[slug]',
  'authors',
  'business',
  'careers',
  'city',
  'classifieds',      // DELETED - needs restore
  'classifieds/[id]',
  'classifieds/post',
  'classifieds/payment',
  'contact',
  'cookies',
  'deals',            // Was coupons
  'deals/[id]',
  'deals/create',
  'do-not-sell',
  'ethics',
  'events',
  'events/[id]',
  'events/calendar',
  'events/create',
  'legal',           // DELETED - needs restore
  'legal/[id]',
  'legal/create',
  'life',
  'memorials',       // DELETED - needs restore
  'memorials/[id]',
  'messages',
  'national',
  'news/create',
  'newsroom',
  'opinion',
  'photos',          // DELETED - needs restore
  'photos/[id]',
  'photos/upload',
  'privacy',
  'profile',
  'register',
  'reviews',
  'search',
  'settings',
  'sports',
  'subscribe',
  'tags/[tag]',
  'terms',
  'trending'
];

// Compare
console.log('📊 CURRENT STATUS:\n');

console.log(`Total routes found: ${routes.length}`);
console.log(`Expected routes: ${expectedRoutes.length}`);
console.log(`Database tables: ${dbTables.length}\n`);

// Missing routes
const missingRoutes = expectedRoutes.filter(r => 
  !routes.some(existing => existing === r || existing === r.replace(/\[.*\]/, '[id]'))
);

console.log('❌ MISSING ROUTES (need to restore):');
missingRoutes.forEach(r => console.log(`   - /${r}`));

// Routes without tables
console.log('\n⚠️  ROUTES WITHOUT DIRECT TABLE MATCH:');
const routesWithoutTables = routes.filter(r => {
  const baseRoute = r.split('/')[0];
  return !dbTables.includes(baseRoute) && 
         !dbTables.includes(baseRoute + 's') &&
         !dbTables.includes(baseRoute.replace(/s$/, ''));
});
routesWithoutTables.forEach(r => console.log(`   - /${r}`));

// Tables without routes
console.log('\n📦 DATABASE TABLES WITHOUT ROUTES:');
const tablesWithoutRoutes = dbTables.filter(t => {
  return !routes.some(r => {
    const baseRoute = r.split('/')[0];
    return baseRoute === t || 
           baseRoute + 's' === t || 
           baseRoute === t.replace(/s$/, '') ||
           (t === 'virtual_journalists' && baseRoute === 'journalists') ||
           (t === 'deals' && baseRoute === 'deals');
  });
});
tablesWithoutRoutes.forEach(t => console.log(`   - ${t}`));

// Save report
const report = {
  currentRoutes: routes,
  missingRoutes,
  routesWithoutTables,
  tablesWithoutRoutes,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('ROUTE_DB_COMPARISON.json', JSON.stringify(report, null, 2));
console.log('\n📄 Full report saved to ROUTE_DB_COMPARISON.json');
