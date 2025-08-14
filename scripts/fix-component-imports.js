#!/usr/bin/env node

/**
 * Fix component imports to use correct subdirectories
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map components to their actual locations
const componentMap = {
  'AboutUsPage': 'about/AboutUsPage',
  'AccessibilityPage': 'company/AccessibilityPage',
  'AdminDashboard': 'admin/AdminDashboard',
  'AdvertisingDetailPage': 'advertising/AdvertisingDetailPage',
  'AIAgentControl': 'admin/AIAgentControl',
  'AnnouncementCreatorPage': 'announcements/AnnouncementCreatorPage',
  'AnnouncementDetailPage': 'announcements/AnnouncementDetailPage',
  'ArchiveBrowserPage': 'archive/ArchiveBrowserPage',
  'ArticleDetailPage': 'article/ArticleDetailPage',
  'AuthorsPage': 'authors/AuthorsPage',
  'BusinessDirectoryPage': 'business/BusinessDirectoryPage',
  'CareersPage': 'company/CareersPage',
  'CitySelectionPage': 'city/CitySelectionPage',
  'ClassifiedDetailPage': 'classifieds/ClassifiedDetailPage',
  'ClassifiedsPage': 'classifieds/ClassifiedsPage',
  'CommunityAdsPage': 'ads/CommunityAdsPage',
  'CommunityDeploymentWizard': 'admin/CommunityDeploymentWizard',
  'ConfirmationPage': 'classifieds/ConfirmationPage',
  'ContactUsPage': 'contact/ContactUsPage',
  'ContentManagement': 'admin/ContentManagement',
  'CookiePolicyPage': 'company/CookiePolicyPage',
  'CouponCreatorPage': 'coupons/CouponCreatorPage',
  'CouponDetailPage': 'coupons/CouponDetailPage',
  'DoNotSellPage': 'company/DoNotSellPage',
  'EthicsPolicyPage': 'company/EthicsPolicyPage',
  'EventCreatorPage': 'events/EventCreatorPage',
  'EventDetailPage': 'events/EventDetailPage',
  'EventsCalendarPage': 'events/EventsCalendarPage',
  'LegalNoticeCreatorPage': 'legal/LegalNoticeCreatorPage',
  'LegalNoticeDetailPage': 'legal/LegalNoticeDetailPage',
  'LegalNoticesListPage': 'legal/LegalNoticesListPage',
  'LifePage': 'life/LifePage',
  'MemorialDetailPage': 'memorials/MemorialDetailPage',
  'MemorialsPage': 'memorials/MemorialsPage',
  'ModerationQueue': 'admin/ModerationQueue',
  'NationalHomePage': 'national/NationalPage',
  'NewsroomPage': 'company/NewsroomPage',
  'OpinionPage': 'opinion/OpinionPage',
  'PaymentPage': 'classifieds/PaymentPage',
  'PhotoDetailPage': 'photos/PhotoDetailPage',
  'PhotoGalleryPage': 'photos/PhotoGalleryPage',
  'PhotoUploadPage': 'photos/PhotoUploadPage',
  'PostListingPage': 'classifieds/PostListingPage',
  'PrivacyPolicyPage': 'company/PrivacyPolicyPage',
  'RerunAdPage': 'classifieds/RerunAdPage',
  'RevenueAnalytics': 'admin/RevenueAnalytics',
  'SearchResultsPage': 'search/SearchResultsPage',
  'SelectCommunitiesPage': 'classifieds/SelectCommunitiesPage',
  'SelectTimeframePage': 'classifieds/SelectTimeframePage',
  'SportsPage': 'sports/SportsPage',
  'SubscriptionOptionsPage': 'company/SubscriptionOptionsPage',
  'TagPage': 'tags/TagPage',
  'TermsOfServicePage': 'company/TermsOfServicePage',
  'TrendingPage': 'trending/TrendingPage',
  'UserRegistrationPage': 'auth/UserRegistrationPage'
};

// Get all page.tsx files
const pageFiles = glob.sync('src/app/**/page.tsx');

console.log(`Found ${pageFiles.length} page files to check`);

pageFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check each import
  Object.entries(componentMap).forEach(([component, actualPath]) => {
    const importRegex = new RegExp(`import ${component} from ['"]@/components/${component}['"]`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `import ${component} from '@/components/${actualPath}'`);
      modified = true;
      console.log(`✓ Fixed import for ${component} in ${file}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
  }
});

console.log('\n✅ Import fixes complete!');