const fs = require('fs');
const path = require('path');

// Read the components list
const components = fs.readFileSync('components-list.txt', 'utf8').split('\n').filter(Boolean);

// Find all "Page" components that need routes
const pageComponents = components.filter(comp => comp.includes('Page.tsx'));

console.log(`Found ${pageComponents.length} page components\n`);

// Map components to routes
const routeMap = {
  // Main pages
  'HomePage.tsx': '/',
  'NationalHomePage.tsx': '/national',
  
  // News & Articles
  'CreateNewsPage.tsx': '/news/create',
  'NewsContent.tsx': '/news',
  'ArticleDetailPage.tsx': '/article/[slug]',
  
  // Events
  'EventsPage.tsx': '/events',
  'EventsCalendarPage.tsx': '/events/calendar',
  'EventCreatorPage.tsx': '/events/create',
  'EventDetailPage.tsx': '/events/[id]',
  
  // Classifieds
  'ClassifiedsPage.tsx': '/classifieds',
  'PostListingPage.tsx': '/classifieds/post',
  'ClassifiedDetailPage.tsx': '/classifieds/[id]',
  'PaymentPage.tsx': '/classifieds/payment',
  'ConfirmationPage.tsx': '/classifieds/confirmation',
  'RerunAdPage.tsx': '/classifieds/rerun',
  'SelectCommunitiesPage.tsx': '/classifieds/communities',
  'SelectTimeframePage.tsx': '/classifieds/timeframe',
  
  // Business Directory
  'BusinessDirectoryPage.tsx': '/business',
  'BusinessProfile.tsx': '/business/[slug]',
  
  // Announcements
  'AnnouncementsPage.tsx': '/announcements',
  'AnnouncementCreatorPage.tsx': '/announcements/create',
  'AnnouncementDetailPage.tsx': '/announcements/[id]',
  
  // Photos
  'PhotoGalleryPage.tsx': '/photos',
  'PhotoDetailPage.tsx': '/photos/[id]',
  'PhotoUploadPage.tsx': '/photos/upload',
  
  // Coupons
  'CouponsPage.tsx': '/coupons',
  'CouponCreatorPage.tsx': '/coupons/create',
  'CouponDetailPage.tsx': '/coupons/[id]',
  
  // Advertising
  'CommunityAdsPage.tsx': '/advertising',
  'AdvertisingDetailPage.tsx': '/advertising/[id]',
  'PublishPromotePage.tsx': '/advertising/promote',
  
  // Legal
  'LegalNoticesListPage.tsx': '/legal',
  'LegalNoticeCreatorPage.tsx': '/legal/create',
  'LegalNoticeDetailPage.tsx': '/legal/[id]',
  
  // Other Sections
  'OpinionPage.tsx': '/opinion',
  'SportsPage.tsx': '/sports',
  'LifePage.tsx': '/life',
  'TrendingPage.tsx': '/trending',
  'ArchiveBrowserPage.tsx': '/archive',
  'MemorialsPage.tsx': '/memorials',
  'MemorialDetailPage.tsx': '/memorials/[id]',
  
  // User
  'UserProfilePage.tsx': '/profile',
  'UserSettingsPage.tsx': '/settings',
  'UserRegistrationPage.tsx': '/register',
  
  // Info Pages
  'AboutUsPage.tsx': '/about',
  'ContactUsPage.tsx': '/contact',
  'CareersPage.tsx': '/careers',
  'NewsroomPage.tsx': '/newsroom',
  
  // Legal/Company
  'PrivacyPolicyPage.tsx': '/privacy',
  'TermsOfServicePage.tsx': '/terms',
  'CookiePolicyPage.tsx': '/cookies',
  'AccessibilityPage.tsx': '/accessibility',
  'EthicsPolicyPage.tsx': '/ethics',
  'DoNotSellPage.tsx': '/do-not-sell',
  'SubscriptionOptionsPage.tsx': '/subscribe',
  
  // Search & Tags
  'SearchResultsPage.tsx': '/search',
  'TagPage.tsx': '/tags/[tag]',
  'AuthorsPage.tsx': '/authors',
  
  // Location
  'CitySelectionPage.tsx': '/city',
  
  // Admin
  'AdminDashboard.tsx': '/admin',
  'JournalistsAdminPage.tsx': '/admin/journalists'
};

// Create routes
Object.entries(routeMap).forEach(([component, route]) => {
  const componentName = component.replace('.tsx', '');
  const componentPath = pageComponents.find(p => p.includes(component));
  
  if (!componentPath) {
    console.log(`⚠️  Component ${component} not found`);
    return;
  }
  
  // Parse the route
  const routeParts = route.split('/').filter(Boolean);
  const routeDir = routeParts.length > 0 ? 
    `src/app/${routeParts.join('/')}` : 
    'src/app';
  
  // Handle dynamic routes
  const isDynamic = route.includes('[');
  const finalDir = isDynamic ? 
    routeDir.replace(/\[.*\]$/, routeParts[routeParts.length - 1]) : 
    routeDir;
  
  // Create directory
  fs.mkdirSync(finalDir, { recursive: true });
  
  // Create page.tsx
  const pageContent = `import { ${componentName} } from '@/components/${componentPath.replace('src/components/', '').replace('.tsx', '')}'

export default function Page() {
  return <${componentName} />
}
`;
  
  fs.writeFileSync(`${finalDir}/page.tsx`, pageContent);
  console.log(`✅ Created route: ${route} -> ${componentName}`);
});

console.log('\n📁 Route structure created successfully!');
