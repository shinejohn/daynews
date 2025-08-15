// Server Component - No 'use client' directive
import React from 'react';
import { HeroSection } from './hero/HeroSection';
import { CategoryTabs } from './CategoryTabs';
import { MarketplaceSection } from './MarketplaceSection';
import { AnnouncementsSection } from './AnnouncementsSection';
import { AdvertisingColumn } from './AdvertisingColumn';
import { HeroStory } from './content/HeroStory';
import { EssentialReads } from './content/EssentialReads';
import { FeaturedStories } from './content/FeaturedStories';
import { PhotoGallerySection } from './content/PhotoGallerySection';
import { TrendingSection } from './content/TrendingSection';
import { CommunityVoices } from './content/CommunityVoices';
import { LocalEventsSection } from './content/LocalEventsSection';
import { OpinionSection } from './content/OpinionSection';
import { MoreNewsSection } from './content/MoreNewsSection';
import { MarketplacePreview } from './previews/MarketplacePreview';
import { CouponsPreview } from './previews/CouponsPreview';
import { EventsPreview } from './previews/EventsPreview';
import { LegalNoticesPreview } from './previews/LegalNoticesPreview';

// Get time-based greeting on server
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

// Get initial data on server
async function getHomePageData() {
  // In a real app, these would be database queries
  return {
    greeting: getGreeting(),
    location: 'Clearwater', // Default location, can be from cookies/headers
    activeReaders: Math.floor(Math.random() * 100) + 200, // Random initial value
    featuredStories: [], // Would fetch from database
    announcements: [], // Would fetch from database
    events: [], // Would fetch from database
  };
}

export async function HomePageServer() {
  const data = await getHomePageData();
  
  return (
    <div className="min-h-screen bg-bg-primary w-full overflow-x-hidden">
      <main className="overflow-auto">
        <HeroSection 
          greeting={data.greeting} 
          location={data.location} 
          activeReaders={data.activeReaders} 
        />
        
        <div className="container mx-auto px-4 py-4">
          {/* Category Tabs - Can be interactive with client component wrapper if needed */}
          <div className="border-b border-gray-200 mb-6">
            <CategoryTabs />
          </div>
          
          <div className="grid grid-cols-12 gap-4 md:gap-8">
            {/* Left news column - 5 columns */}
            <div className="col-span-12 md:col-span-5 space-y-8">
              <HeroStory />
              <EssentialReads />
              <FeaturedStories />
              <PhotoGallerySection />
            </div>
            
            {/* Center marketplace/events column - 4 columns */}
            <div className="col-span-12 md:col-span-4 space-y-8">
              <MarketplaceSection />
              <AnnouncementsSection />
              <TrendingSection />
              <CommunityVoices />
              <LocalEventsSection />
            </div>
            
            {/* Right advertising column - 3 columns */}
            <div className="col-span-12 md:col-span-3 space-y-8">
              <AdvertisingColumn />
              <OpinionSection />
              
              {/* Service sections */}
              <div className="space-y-6">
                <MarketplacePreview />
                <CouponsPreview />
                <EventsPreview />
                <LegalNoticesPreview />
              </div>
              
              <MoreNewsSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}