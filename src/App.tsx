import React, { useEffect, useState, lazy, memo } from 'react';
// ISRCSR=CSR
// mockdata=no
// mockdataon=no
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { JournalistsAdminPage } from './components/JournalistsAdminPage';
import { UserProfilePage } from './components/UserProfilePage';
import { UserSettingsPage } from './components/UserSettingsPage';
import { PublishPromotePage } from './components/PublishPromotePage';
import { CreateNewsPage } from './components/CreateNewsPage';
import { AnnouncementsPage } from './components/announcements/AnnouncementsPage';
import { ClassifiedsPage } from './components/classifieds/ClassifiedsPage';
import { ClassifiedDetailPage } from './components/classifieds/ClassifiedDetailPage';
import { PostListingPage } from './components/classifieds/PostListingPage';
import { SelectCommunitiesPage } from './components/classifieds/SelectCommunitiesPage';
import { SelectTimeframePage } from './components/classifieds/SelectTimeframePage';
import { PaymentPage } from './components/classifieds/PaymentPage';
import { ConfirmationPage } from './components/classifieds/ConfirmationPage';
import { RerunAdPage } from './components/classifieds/RerunAdPage';
import { CouponsPage } from './components/CouponsPage';
import { HomePage } from './components/HomePage';
import { NationalHomePage } from './components/NationalHomePage';
import { AnnouncementCreatorPage } from './components/announcements/AnnouncementCreatorPage';
import { CouponCreatorPage } from './components/coupons/CouponCreatorPage';
import { LocationDetector } from './components/location/LocationDetector';
import { FloatingNavMenu } from './components/navigation/FloatingNavMenu';
import { BusinessDirectoryPage } from './components/business/BusinessDirectoryPage';
import { EventsCalendarPage } from './components/events/EventsCalendarPage';
import { EventCreatorPage } from './components/events/EventCreatorPage';
import { SearchResultsPage } from './components/search/SearchResultsPage';
import { TagPage } from './components/tags/TagPage';
import { CitySelectionPage } from './components/city/CitySelectionPage';
import { ArchiveBrowserPage } from './components/archive/ArchiveBrowserPage';
import { TrendingPage } from './components/trending/TrendingPage';
import { AboutUsPage } from './components/about/AboutUsPage';
import { ContactUsPage } from './components/contact/ContactUsPage';
import { Footer } from './components/layout/Footer';
import { EventDetailPage } from './components/events/EventDetailPage';
import { AdvertisingDetailPage } from './components/advertising/AdvertisingDetailPage';
import { CouponDetailPage } from './components/coupons/CouponDetailPage';
import { UserRegistrationPage } from './components/auth/UserRegistrationPage';
import { AnnouncementDetailPage } from './components/announcements/AnnouncementDetailPage';
import { MemorialsPage } from './components/memorials/MemorialsPage';
import { MemorialDetailPage } from './components/memorials/MemorialDetailPage';
import { LegalNoticeCreatorPage } from './components/legal/LegalNoticeCreatorPage';
import { LegalNoticesListPage } from './components/legal/LegalNoticesListPage';
import { LegalNoticeDetailPage } from './components/legal/LegalNoticeDetailPage';
import { NewspaperMasthead } from './components/navigation/NewspaperMasthead';
import { CommunityAdsPage } from './components/ads/CommunityAdsPage';
import CreateArticlePage from './pages/create-article';
import ArticleMetadataPage from './pages/create-article/metadata';
import ArticleSeoPage from './pages/create-article/seo';
import ArticleReviewPage from './pages/create-article/review';
import CommunityReviewQueuePage from './pages/review/queue';
import AuthorProfilePage from './pages/author/[authorId]';
import AuthorProfileCreatorPage from './pages/author/profile-creator';
import AuthorsReportPage from './pages/authors-report';
import { PageDirectory } from './components/utility/PageDirectory';
import { PageDirectoryButton } from './components/utility/PageDirectoryButton';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ContentManagement } from './components/admin/ContentManagement';
import { RevenueAnalytics } from './components/admin/RevenueAnalytics';
import { AIAgentControl } from './components/admin/AIAgentControl';
import { ModerationQueue } from './components/admin/ModerationQueue';
import { CommunityDeploymentWizard } from './components/admin/CommunityDeploymentWizard';
import { PhotoGalleryPage } from './components/photos/PhotoGalleryPage';
import { PhotoUploadPage } from './components/photos/PhotoUploadPage';
import { PhotoDetailPage } from './components/photos/PhotoDetailPage';
import { AuthorsPage } from './components/authors/AuthorsPage';
import BusinessProfilePage from './pages/business/[slug]';
import BusinessProfileCreator from './pages/business/create';
import PremiumEnrollment from './pages/business/premium-enrollment';
import PremiumSuccess from './pages/business/premium-success';
import BusinessDashboard from './pages/business-dashboard';
import { SportsPage } from './components/sports/SportsPage';
import { LifePage } from './components/life/LifePage';
import { OpinionPage } from './components/opinion/OpinionPage';
import { CareersPage } from './components/company/CareersPage';
import { EthicsPolicyPage } from './components/company/EthicsPolicyPage';
import { SubscriptionOptionsPage } from './components/company/SubscriptionOptionsPage';
import { NewsroomPage } from './components/company/NewsroomPage';
import { PrivacyPolicyPage } from './components/company/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/company/TermsOfServicePage';
import { CookiePolicyPage } from './components/company/CookiePolicyPage';
import { AccessibilityPage } from './components/company/AccessibilityPage';
import { DoNotSellPage } from './components/company/DoNotSellPage';
import EditorPage from './pages/editor/[articleId]';
import { ServicesAndPricingPage } from './components/company/ServicesAndPricingPage';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
});
export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = location.pathname.substring(1) || 'home';
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('News');
  const [hasError, setHasError] = useState(false);
  // List of pages that don't use the sidebar
  const noSidebarPages = ['home', 'national', 'announcementCreator', 'couponCreator', 'businessDirectory', 'eventsCalendar', 'eventCreator', 'classifieds', 'classifiedDetail', 'postListing', 'classifieds/select-communities', 'classifieds/select-timeframe', 'classifieds/payment', 'classifieds/confirmation', 'classifieds/rerun', 'search', 'tag', 'citySelection', 'archive', 'trending', 'about', 'contact', 'eventDetail', 'advertisingDetail', 'couponDetail', 'register', 'announcementDetail', 'memorials', 'memorialDetail', 'legalNoticeCreator', 'legalNoticesList', 'legalNoticeDetail', 'create-article', 'create-article/metadata', 'create-article/seo', 'create-article/review', 'create-article/publish', 'review/queue', 'author', 'authors', 'authors-report', 'page-directory', 'community-ads', 'admin-dashboard', 'content-management', 'revenue-analytics', 'ai-agent-control', 'moderation-queue', 'community-deployment', 'business', 'settings', 'sports', 'life', 'opinion', 'careers', 'ethics-policy', 'subscription-options', 'newsroom', 'privacy-policy', 'terms-of-service', 'cookie-policy', 'accessibility', 'do-not-sell-my-information', 'editor', 'services-pricing'];
  const showSidebar = !noSidebarPages.includes(currentPage);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleCategoryChange = category => {
    setActiveCategory(category);
  };
  const handleMainSectionChange = section => {
    if (section) {
      const sectionPath = section.toLowerCase().replace(' ', '');
      if (location.pathname !== `/${sectionPath}`) {
        navigate(`/${sectionPath}`);
      }
    }
  };
  // Check if we're on the editor page to hide all navigation and UI elements
  const isEditorPage = location.pathname.startsWith('/editor');
  // Fallback component in case of routing issues
  const EmergencyFallback = () => <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-news-primary mb-4">
          Navigation Issue Detected
        </h1>
        <p className="text-gray-600 mb-6">
          We're having trouble loading the requested page. Please try one of
          these options:
        </p>
        <div className="space-y-4">
          <button onClick={() => navigate('/')} className="w-full bg-news-primary text-white px-4 py-2 rounded-md hover:bg-news-primary-dark transition-colors">
            Go to Home Page
          </button>
          <button onClick={() => window.location.reload()} className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
            Refresh Page
          </button>
        </div>
      </div>
    </div>;
  if (isEditorPage) {
    return <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/editor/:articleId" element={<EditorPage />} />
            <Route path="*" element={<EmergencyFallback />} />
          </Routes>
        </QueryClientProvider>
      </ErrorBoundary>;
  }
  return <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen bg-gray-50">
          {currentPage !== 'community-ads' && currentPage !== 'admin-dashboard' && currentPage !== 'content-management' && currentPage !== 'revenue-analytics' && currentPage !== 'ai-agent-control' && currentPage !== 'moderation-queue' && currentPage !== 'community-deployment' && currentPage !== 'national' && <NewspaperMasthead scrolled={scrolled} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} onMainSectionChange={handleMainSectionChange} isFixed={false} key="global-masthead" />}
          <div className="flex flex-1 overflow-hidden">
            {showSidebar && <Sidebar currentPage={currentPage} />}
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/national" element={<NationalHomePage />} />
                <Route path="/journalists" element={<JournalistsAdminPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/settings" element={<UserSettingsPage />} />
                <Route path="/publish" element={<PublishPromotePage />} />
                <Route path="/createNews" element={<CreateNewsPage />} />
                <Route path="/announcementCreator" element={<AnnouncementCreatorPage />} />
                <Route path="/couponCreator" element={<CouponCreatorPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/classifieds" element={<ClassifiedsPage />} />
                <Route path="/classifiedDetail" element={<ClassifiedDetailPage />} />
                <Route path="/postListing" element={<PostListingPage />} />
                <Route path="/classifieds/select-communities" element={<SelectCommunitiesPage />} />
                <Route path="/classifieds/select-timeframe" element={<SelectTimeframePage />} />
                <Route path="/classifieds/payment" element={<PaymentPage />} />
                <Route path="/classifieds/confirmation" element={<ConfirmationPage />} />
                <Route path="/classifieds/rerun" element={<RerunAdPage />} />
                <Route path="/coupons" element={<CouponsPage />} />
                <Route path="/businessDirectory" element={<BusinessDirectoryPage />} />
                <Route path="/eventsCalendar" element={<EventsCalendarPage />} />
                <Route path="/eventCreator" element={<EventCreatorPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/tag" element={<TagPage />} />
                <Route path="/citySelection" element={<CitySelectionPage />} />
                <Route path="/archive" element={<ArchiveBrowserPage />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/eventDetail" element={<EventDetailPage />} />
                <Route path="/advertisingDetail" element={<AdvertisingDetailPage />} />
                <Route path="/announcementDetail" element={<AnnouncementDetailPage />} />
                <Route path="/couponDetail" element={<CouponDetailPage />} />
                <Route path="/register" element={<UserRegistrationPage />} />
                <Route path="/memorials" element={<MemorialsPage />} />
                <Route path="/memorialDetail" element={<MemorialDetailPage />} />
                <Route path="/legalNoticeCreator" element={<LegalNoticeCreatorPage />} />
                <Route path="/legalNoticesList" element={<LegalNoticesListPage />} />
                <Route path="/legalNoticeDetail" element={<LegalNoticeDetailPage />} />
                <Route path="/create-article" element={<CreateArticlePage />} />
                <Route path="/create-article/metadata" element={<ArticleMetadataPage />} />
                <Route path="/create-article/seo" element={<ArticleSeoPage />} />
                <Route path="/create-article/review" element={<ArticleReviewPage />} />
                <Route path="/review/queue" element={<CommunityReviewQueuePage />} />
                <Route path="/author/:authorId" element={<AuthorProfilePage />} />
                <Route path="/author/profile-creator" element={<AuthorProfileCreatorPage />} />
                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/authors-report" element={<AuthorsReportPage />} />
                <Route path="/page-directory" element={<PageDirectory />} />
                <Route path="/community-ads" element={<CommunityAdsPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/content-management" element={<ContentManagement />} />
                <Route path="/revenue-analytics" element={<RevenueAnalytics />} />
                <Route path="/ai-agent-control" element={<AIAgentControl />} />
                <Route path="/moderation-queue" element={<ModerationQueue />} />
                <Route path="/community-deployment" element={<CommunityDeploymentWizard />} />
                <Route path="/photos" element={<PhotoGalleryPage />} />
                <Route path="/photos/upload" element={<PhotoUploadPage />} />
                <Route path="/photos/:photoId" element={<PhotoDetailPage />} />
                <Route path="/business/:slug" element={<BusinessProfilePage />} />
                <Route path="/business/create" element={<BusinessProfileCreator />} />
                <Route path="/business/premium-enrollment" element={<PremiumEnrollment />} />
                <Route path="/business/premium-success" element={<PremiumSuccess />} />
                <Route path="/business-dashboard" element={<BusinessDashboard />} />
                <Route path="/sports" element={<SportsPage />} />
                <Route path="/life" element={<LifePage />} />
                <Route path="/opinion" element={<OpinionPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/ethics-policy" element={<EthicsPolicyPage />} />
                <Route path="/subscription-options" element={<SubscriptionOptionsPage />} />
                <Route path="/newsroom" element={<NewsroomPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/do-not-sell-my-information" element={<DoNotSellPage />} />
                <Route path="/editor/:articleId" element={<EditorPage />} />
                <Route path="*" element={<EmergencyFallback />} />
                <Route path="/services-pricing" element={<ServicesAndPricingPage />} />
              </Routes>
            </div>
          </div>
          {currentPage !== 'community-ads' && currentPage !== 'admin-dashboard' && currentPage !== 'content-management' && currentPage !== 'revenue-analytics' && currentPage !== 'ai-agent-control' && currentPage !== 'moderation-queue' && currentPage !== 'community-deployment' && <FloatingNavMenu currentPage={currentPage} />}
          {currentPage !== 'community-ads' && currentPage !== 'admin-dashboard' && currentPage !== 'content-management' && currentPage !== 'revenue-analytics' && currentPage !== 'ai-agent-control' && currentPage !== 'moderation-queue' && currentPage !== 'community-deployment' && <PageDirectoryButton />}
          {currentPage !== 'community-ads' && currentPage !== 'admin-dashboard' && currentPage !== 'content-management' && currentPage !== 'revenue-analytics' && currentPage !== 'ai-agent-control' && currentPage !== 'moderation-queue' && currentPage !== 'community-deployment' && <Footer currentPage={currentPage} />}
        </div>
      </QueryClientProvider>
    </ErrorBoundary>;
}