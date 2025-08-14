const fs = require('fs');
const path = require('path');

console.log('📰 Applying News Site SEO-First Rendering Strategy\n');

// CRITICAL PAGES THAT MUST BE SSR FOR SEO
const FORCE_SSR_PAGES = [
  'HomePage',
  'NationalHomePage',
  'ArticleDetailPage',
  'NewsArticle',
  'NewsContent',
  'ArticleHeader',
  'ArticleRelated',
  'ArticleSidebar',
  'EventsPage',
  'EventDetailPage',
  'ClassifiedsPage',
  'ClassifiedDetailPage',
  'BusinessDirectoryPage',
  'BusinessProfile',
  'AnnouncementsPage',
  'AnnouncementDetailPage',
  'PhotoGalleryPage',
  'PhotoDetailPage',
  'CouponsPage',
  'CouponDetailPage',
  'OpinionPage',
  'SportsPage',
  'LifePage',
  'TrendingPage',
  'ArchiveBrowserPage',
  'MemorialsPage',
  'MemorialDetailPage',
  'AboutUsPage',
  'ContactUsPage',
  'AuthorsPage',
  'TagPage',
  'SearchResultsPage'
];

// Components that MUST be CSR
const FORCE_CSR_COMPONENTS = [
  // Creation/Admin
  'CreateNewsPage',
  'EventCreatorPage',
  'PostListingPage',
  'AnnouncementCreatorPage',
  'PhotoUploadPage',
  'CouponCreatorPage',
  'LegalNoticeCreatorPage',
  'AdminDashboard',
  'JournalistsAdminPage',
  'ContentManagement',
  'ModerationQueue',
  
  // User Interactive
  'UserRegistrationPage',
  'UserProfilePage',
  'UserSettingsPage',
  'PaymentPage',
  'CitySelectionPage',
  
  // Interactive Widgets
  'EventsCalendarPage',
  'CommunitySwitcher',
  'EditJournalistModal',
  'Modal',
  'Dropdown',
  'Carousel'
];

const components = fs.readFileSync('components-list.txt', 'utf8')
  .split('\n')
  .filter(Boolean);

const updates = [];
const refactorSuggestions = [];

components.forEach(componentPath => {
  const fileName = path.basename(componentPath, '.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  
  let rendering = 'ssr'; // DEFAULT TO SSR!
  let reason = 'Default SSR for SEO';
  
  // Check if it's a forced SSR page
  if (FORCE_SSR_PAGES.some(page => fileName.includes(page))) {
    rendering = 'ssr';
    reason = 'Critical page - MUST be SSR for SEO';
    
    // Check if it has client-side code that needs refactoring
    if (content.includes('useState') || content.includes('useEffect')) {
      refactorSuggestions.push({
        file: fileName,
        issue: 'Has client-side hooks but needs to be SSR',
        suggestion: 'Move interactive parts to client components or use hybrid approach'
      });
    }
  }
  // Check if it's forced CSR
  else if (FORCE_CSR_COMPONENTS.some(comp => fileName.includes(comp))) {
    rendering = 'csr';
    reason = 'Interactive component - requires CSR';
  }
  // For others, be conservative
  else {
    // Only make it CSR if it really needs to be
    const hasStrongCSR = 
      fileName.includes('Creator') ||
      fileName.includes('Upload') ||
      fileName.includes('Admin') ||
      fileName.includes('Settings') ||
      fileName.includes('Payment') ||
      fileName.includes('Registration') ||
      (content.includes('FileReader') || content.includes('FormData'));
    
    if (hasStrongCSR) {
      rendering = 'csr';
      reason = 'Interactive functionality requires CSR';
    }
  }
  
  updates.push({
    file: componentPath,
    name: fileName,
    rendering,
    reason
  });
});

// Generate report
const ssrCount = updates.filter(u => u.rendering === 'ssr').length;
const csrCount = updates.filter(u => u.rendering === 'csr').length;

const report = `# News Site SEO-First Rendering Strategy

Generated: ${new Date().toISOString()}

## 📊 Summary
- Total components: ${components.length}
- SSR components: ${ssrCount} (${Math.round(ssrCount/components.length*100)}%)
- CSR components: ${csrCount} (${Math.round(csrCount/components.length*100)}%)

## 🎯 Strategy
1. Default to SSR for all content pages
2. Use CSR only for forms, admin, and interactive widgets
3. Refactor pages that have client code but need SSR

## ⚠️ Components Needing Refactoring
${refactorSuggestions.map(s => `
### ${s.file}
- Issue: ${s.issue}
- Suggestion: ${s.suggestion}`).join('\n')}

## 📄 Critical SSR Pages (for SEO)
${updates.filter(u => u.rendering === 'ssr' && FORCE_SSR_PAGES.some(p => u.name.includes(p)))
  .map(u => `- ${u.name}`).join('\n')}

## 🔧 CSR Components (Interactive)
${updates.filter(u => u.rendering === 'csr')
  .map(u => `- ${u.name}: ${u.reason}`).join('\n')}
`;

fs.writeFileSync('NEWS_SITE_RENDERING_STRATEGY.md', report);

// Create update script
const updateScript = `const fs = require('fs');

const updates = ${JSON.stringify(updates, null, 2)};

let updated = 0;
updates.forEach(({file, rendering}) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Remove old hint if exists
  let newContent = content.replace(/\\/\\/ ssr-csr=\\w+\\n/, '');
  
  // Add new hint at top
  newContent = \`// ssr-csr=\${rendering}\\n\${newContent}\`;
  
  fs.writeFileSync(file, newContent);
  console.log(\`✅ \${file} -> \${rendering}\`);
  updated++;
});

console.log(\`\\n✅ Updated \${updated} components\`);
`;

fs.writeFileSync('apply-news-rendering.js', updateScript);

console.log('✅ News Site Strategy Ready!');
console.log(`📊 New split: ${ssrCount} SSR / ${csrCount} CSR`);
console.log(`📝 Report: NEWS_SITE_RENDERING_STRATEGY.md`);
console.log(`�� To apply: node apply-news-rendering.js`);

// Show refactoring needs
if (refactorSuggestions.length > 0) {
  console.log(`\n⚠️  ${refactorSuggestions.length} components need refactoring for proper SSR`);
}
