
// Auto-generated route configuration with database knowledge
export const routeConfig = {
  "routes": {
    "/settings": {
      "component": "UserSettingsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "user"
    },
    "/:community/settings": {
      "component": "UserSettingsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "user",
      "communityScoped": true
    },
    "/profile/:username": {
      "component": "UserProfilePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "user"
    },
    "/:community/profile/:username": {
      "component": "UserProfilePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "user",
      "communityScoped": true
    },
    "/publishpromote": {
      "component": "PublishPromotePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/publishpromote": {
      "component": "PublishPromotePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/nationalhome": {
      "component": "NationalHomePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/nationalhome": {
      "component": "NationalHomePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/journalistsadmin": {
      "component": "JournalistsAdminPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/journalistsadmin": {
      "component": "JournalistsAdminPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/": {
      "component": "HomePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/": {
      "component": "HomePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/events": {
      "component": "EventsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": true,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/events": {
      "component": "EventsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": true,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/create/news": {
      "component": "CreateNewsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "forms"
    },
    "/:community/create/news": {
      "component": "CreateNewsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "forms",
      "communityScoped": true
    },
    "/coupons": {
      "component": "CouponsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/coupons": {
      "component": "CouponsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/announcements": {
      "component": "AnnouncementsPage",
      "renderingMode": "ISR",
      "ttl": 1800,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/announcements": {
      "component": "AnnouncementsPage",
      "renderingMode": "ISR",
      "ttl": 1800,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/trending/trending": {
      "component": "TrendingPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/trending/trending": {
      "component": "TrendingPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/sports/sports": {
      "component": "SportsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/sports/sports": {
      "component": "SportsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/tags/tag": {
      "component": "TagPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/tags/tag": {
      "component": "TagPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/opinion/opinion": {
      "component": "OpinionPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/opinion/opinion": {
      "component": "OpinionPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/memorials": {
      "component": "MemorialsPage",
      "renderingMode": "ISR",
      "ttl": 86400,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/memorials": {
      "component": "MemorialsPage",
      "renderingMode": "ISR",
      "ttl": 86400,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/memorial/:id": {
      "component": "MemorialDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/memorial/:id": {
      "component": "MemorialDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/photos/photoupload": {
      "component": "PhotoUploadPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/photos/photoupload": {
      "component": "PhotoUploadPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/photos": {
      "component": "PhotoGalleryPage",
      "renderingMode": "ISR",
      "ttl": 3600,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/photos": {
      "component": "PhotoGalleryPage",
      "renderingMode": "ISR",
      "ttl": 3600,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/photos/photodetail": {
      "component": "PhotoDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/photos/photodetail": {
      "component": "PhotoDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/life/life": {
      "component": "LifePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/life/life": {
      "component": "LifePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/legal/legalnoticeslist": {
      "component": "LegalNoticesListPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/legal/legalnoticeslist": {
      "component": "LegalNoticesListPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/legal/legalnoticedetail": {
      "component": "LegalNoticeDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/legal/legalnoticedetail": {
      "component": "LegalNoticeDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/legal/legalnoticecreator": {
      "component": "LegalNoticeCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/legal/legalnoticecreator": {
      "component": "LegalNoticeCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/search": {
      "component": "SearchResultsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": true,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/search": {
      "component": "SearchResultsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": true,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/coupons/coupondetail": {
      "component": "CouponDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/coupons/coupondetail": {
      "component": "CouponDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/coupons/couponcreator": {
      "component": "CouponCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/coupons/couponcreator": {
      "component": "CouponCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/events/calendar": {
      "component": "EventsCalendarPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "events"
    },
    "/:community/events/calendar": {
      "component": "EventsCalendarPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "events",
      "communityScoped": true
    },
    "/event/:slug": {
      "component": "EventDetailPage",
      "renderingMode": "ISR",
      "ttl": 1800,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "events"
    },
    "/:community/event/:slug": {
      "component": "EventDetailPage",
      "renderingMode": "ISR",
      "ttl": 1800,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "events",
      "communityScoped": true
    },
    "/events/eventcreator": {
      "component": "EventCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "events"
    },
    "/:community/events/eventcreator": {
      "component": "EventCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "events",
      "communityScoped": true
    },
    "/company/termsofservice": {
      "component": "TermsOfServicePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/termsofservice": {
      "component": "TermsOfServicePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/subscriptionoptions": {
      "component": "SubscriptionOptionsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/subscriptionoptions": {
      "component": "SubscriptionOptionsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/servicesandpricing": {
      "component": "ServicesAndPricingPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/servicesandpricing": {
      "component": "ServicesAndPricingPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/privacypolicy": {
      "component": "PrivacyPolicyPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/privacypolicy": {
      "component": "PrivacyPolicyPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/newsroom": {
      "component": "NewsroomPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/newsroom": {
      "component": "NewsroomPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/ethicspolicy": {
      "component": "EthicsPolicyPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/ethicspolicy": {
      "component": "EthicsPolicyPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/donotsell": {
      "component": "DoNotSellPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/donotsell": {
      "component": "DoNotSellPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/cookiepolicy": {
      "component": "CookiePolicyPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/cookiepolicy": {
      "component": "CookiePolicyPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/careers": {
      "component": "CareersPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/careers": {
      "component": "CareersPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/company/accessibility": {
      "component": "AccessibilityPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/company/accessibility": {
      "component": "AccessibilityPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/city/cityselection": {
      "component": "CitySelectionPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/city/cityselection": {
      "component": "CitySelectionPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/contact/contactus": {
      "component": "ContactUsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/contact/contactus": {
      "component": "ContactUsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/businesses": {
      "component": "BusinessDirectoryPage",
      "renderingMode": "ISR",
      "ttl": 21600,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "business"
    },
    "/:community/businesses": {
      "component": "BusinessDirectoryPage",
      "renderingMode": "ISR",
      "ttl": 21600,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "business",
      "communityScoped": true
    },
    "/authors": {
      "component": "AuthorsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/auth/userregistration": {
      "component": "UserRegistrationPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "auth"
    },
    "/article/:slug": {
      "component": "ArticleDetailPage",
      "renderingMode": "ISR",
      "ttl": 3600,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "news"
    },
    "/:community/article/:slug": {
      "component": "ArticleDetailPage",
      "renderingMode": "ISR",
      "ttl": 3600,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "news",
      "communityScoped": true
    },
    "/advertising/advertisingdetail": {
      "component": "AdvertisingDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/advertising/advertisingdetail": {
      "component": "AdvertisingDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/announcement/:slug": {
      "component": "AnnouncementDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/announcement/:slug": {
      "component": "AnnouncementDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/announcements/announcementcreator": {
      "component": "AnnouncementCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/announcements/announcementcreator": {
      "component": "AnnouncementCreatorPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/classifieds/selecttimeframe": {
      "component": "SelectTimeframePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds/selecttimeframe": {
      "component": "SelectTimeframePage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classifieds/selectcommunities": {
      "component": "SelectCommunitiesPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds/selectcommunities": {
      "component": "SelectCommunitiesPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classifieds/rerunad": {
      "component": "RerunAdPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds/rerunad": {
      "component": "RerunAdPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classifieds/postlisting": {
      "component": "PostListingPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": true,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds/postlisting": {
      "component": "PostListingPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": true,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classifieds/payment": {
      "component": "PaymentPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds/payment": {
      "component": "PaymentPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classifieds/confirmation": {
      "component": "ConfirmationPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds/confirmation": {
      "component": "ConfirmationPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": true,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classifieds": {
      "component": "ClassifiedsPage",
      "renderingMode": "ISR",
      "ttl": 900,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classifieds": {
      "component": "ClassifiedsPage",
      "renderingMode": "ISR",
      "ttl": 900,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/classified/:id": {
      "component": "ClassifiedDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace"
    },
    "/:community/classified/:id": {
      "component": "ClassifiedDetailPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "marketplace",
      "communityScoped": true
    },
    "/archive/archivebrowser": {
      "component": "ArchiveBrowserPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/archive/archivebrowser": {
      "component": "ArchiveBrowserPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/ads/communityads": {
      "component": "CommunityAdsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/ads/communityads": {
      "component": "CommunityAdsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    },
    "/about/aboutus": {
      "component": "AboutUsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general"
    },
    "/:community/about/aboutus": {
      "component": "AboutUsPage",
      "renderingMode": "ISR",
      "ttl": 300,
      "needsAuth": false,
      "hasDataFetch": false,
      "dataQueries": [],
      "category": "general",
      "communityScoped": true
    }
  },
  "isrRoutes": [
    "/settings",
    "/profile/:username",
    "/publishpromote",
    "/nationalhome",
    "/journalistsadmin",
    "/",
    "/events",
    "/create/news",
    "/coupons",
    "/announcements",
    "/trending/trending",
    "/sports/sports",
    "/tags/tag",
    "/opinion/opinion",
    "/memorials",
    "/memorial/:id",
    "/photos/photoupload",
    "/photos",
    "/photos/photodetail",
    "/life/life",
    "/legal/legalnoticeslist",
    "/legal/legalnoticedetail",
    "/legal/legalnoticecreator",
    "/search",
    "/coupons/coupondetail",
    "/coupons/couponcreator",
    "/events/calendar",
    "/event/:slug",
    "/events/eventcreator",
    "/company/termsofservice",
    "/company/subscriptionoptions",
    "/company/servicesandpricing",
    "/company/privacypolicy",
    "/company/newsroom",
    "/company/ethicspolicy",
    "/company/donotsell",
    "/company/cookiepolicy",
    "/company/careers",
    "/company/accessibility",
    "/city/cityselection",
    "/contact/contactus",
    "/businesses",
    "/authors",
    "/auth/userregistration",
    "/article/:slug",
    "/advertising/advertisingdetail",
    "/announcements",
    "/announcement/:slug",
    "/announcements/announcementcreator",
    "/classifieds/selecttimeframe",
    "/classifieds/selectcommunities",
    "/classifieds/rerunad",
    "/classifieds/postlisting",
    "/classifieds/payment",
    "/classifieds/confirmation",
    "/classifieds",
    "/classified/:id",
    "/archive/archivebrowser",
    "/ads/communityads",
    "/about/aboutus",
    "/"
  ],
  "csrRoutes": [],
  "ttlConfig": {
    "/settings": 300,
    "/profile/:username": 300,
    "/publishpromote": 300,
    "/nationalhome": 300,
    "/journalistsadmin": 300,
    "/": 300,
    "/events": 300,
    "/create/news": 300,
    "/coupons": 300,
    "/announcements": 1800,
    "/trending/trending": 300,
    "/sports/sports": 300,
    "/tags/tag": 300,
    "/opinion/opinion": 300,
    "/memorials": 86400,
    "/memorial/:id": 300,
    "/photos/photoupload": 300,
    "/photos": 3600,
    "/photos/photodetail": 300,
    "/life/life": 300,
    "/legal/legalnoticeslist": 300,
    "/legal/legalnoticedetail": 300,
    "/legal/legalnoticecreator": 300,
    "/search": 300,
    "/coupons/coupondetail": 300,
    "/coupons/couponcreator": 300,
    "/events/calendar": 300,
    "/event/:slug": 1800,
    "/events/eventcreator": 300,
    "/company/termsofservice": 300,
    "/company/subscriptionoptions": 300,
    "/company/servicesandpricing": 300,
    "/company/privacypolicy": 300,
    "/company/newsroom": 300,
    "/company/ethicspolicy": 300,
    "/company/donotsell": 300,
    "/company/cookiepolicy": 300,
    "/company/careers": 300,
    "/company/accessibility": 300,
    "/city/cityselection": 300,
    "/contact/contactus": 300,
    "/businesses": 21600,
    "/authors": 300,
    "/auth/userregistration": 300,
    "/article/:slug": 3600,
    "/advertising/advertisingdetail": 300,
    "/announcement/:slug": 300,
    "/announcements/announcementcreator": 300,
    "/classifieds/selecttimeframe": 300,
    "/classifieds/selectcommunities": 300,
    "/classifieds/rerunad": 300,
    "/classifieds/postlisting": 300,
    "/classifieds/payment": 300,
    "/classifieds/confirmation": 300,
    "/classifieds": 900,
    "/classified/:id": 300,
    "/archive/archivebrowser": 300,
    "/ads/communityads": 300,
    "/about/aboutus": 300
  },
  "categories": {
    "user": [
      "/settings",
      "/profile/:username"
    ],
    "general": [
      "/publishpromote",
      "/nationalhome",
      "/journalistsadmin",
      "/",
      "/events",
      "/coupons",
      "/announcements",
      "/trending/trending",
      "/sports/sports",
      "/tags/tag",
      "/opinion/opinion",
      "/memorials",
      "/memorial/:id",
      "/photos/photoupload",
      "/photos",
      "/photos/photodetail",
      "/life/life",
      "/legal/legalnoticeslist",
      "/legal/legalnoticedetail",
      "/legal/legalnoticecreator",
      "/search",
      "/coupons/coupondetail",
      "/coupons/couponcreator",
      "/company/termsofservice",
      "/company/subscriptionoptions",
      "/company/servicesandpricing",
      "/company/privacypolicy",
      "/company/newsroom",
      "/company/ethicspolicy",
      "/company/donotsell",
      "/company/cookiepolicy",
      "/company/careers",
      "/company/accessibility",
      "/city/cityselection",
      "/contact/contactus",
      "/authors",
      "/advertising/advertisingdetail",
      "/announcements",
      "/announcement/:slug",
      "/announcements/announcementcreator",
      "/archive/archivebrowser",
      "/ads/communityads",
      "/about/aboutus",
      "/"
    ],
    "forms": [
      "/create/news"
    ],
    "events": [
      "/events/calendar",
      "/event/:slug",
      "/events/eventcreator"
    ],
    "business": [
      "/businesses"
    ],
    "auth": [
      "/auth/userregistration"
    ],
    "news": [
      "/article/:slug"
    ],
    "marketplace": [
      "/classifieds/selecttimeframe",
      "/classifieds/selectcommunities",
      "/classifieds/rerunad",
      "/classifieds/postlisting",
      "/classifieds/payment",
      "/classifieds/confirmation",
      "/classifieds",
      "/classified/:id"
    ]
  }
};

// Cache invalidation rules based on database triggers
export const invalidationRules = {
  'news:publish': ['/news', '/', '/author/:authorId'],
  'event:update': ['/events', '/event/:slug', '/events/calendar'],
  'business:review': ['/business/:slug', '/businesses', '/reviews'],
  'deal:activate': ['/deals', '/business/:slug'],
  'announcement:create': ['/announcements', '/'],
  'hub:post': ['/hub/:slug', '/']
};

export function getRouteConfig(route) {
  // Handle dynamic routes
  for (const [pattern, config] of Object.entries(routeConfig.routes)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(route)) {
        return config;
      }
    }
  }
  
  return routeConfig.routes[route] || null;
}

export function shouldUseISR(route) {
  const config = getRouteConfig(route);
  return config?.renderingMode === 'ISR';
}

export function getTTL(route) {
  const config = getRouteConfig(route);
  return config?.ttl || 300;
}

// Get routes that need invalidation when content changes
export function getInvalidationTargets(type, action, data = {}) {
  const key = `${type}:${action}`;
  const patterns = invalidationRules[key] || [];
  
  return patterns.map(pattern => {
    // Replace placeholders with actual values
    return pattern.replace(/:(w+)/g, (match, param) => {
      return data[param] || match;
    });
  });
}
