'use client';
// Converted from Magic Patterns
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BusinessSearchBar } from './BusinessSearchBar';
import { CategoryGrid } from './CategoryGrid';
import { FilterSidebar } from './FilterSidebar';
import { BusinessCard } from './BusinessCard';
import { BusinessMap } from './BusinessMap';
import { PromotedBusinesses } from './PromotedBusinesses';
import { List, Map, MapPin } from 'lucide-react';
import { SimpleHeroSection } from '../hero/SimpleHeroSection';
import { useLocationDetection } from '../location/LocationDetector';
export const BusinessDirectoryPage = () =>{
  const [viewMode, setViewMode] = useState('list'); // list or map
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const {
    locationData
  } = useLocationDetection();
  const [filters, setFilters] = useState({
    openNow: false,
    deliveryAvailable: false,
    newBusinesses: false,
    distance: 10,
    priceRange: [],
    minRating: 0
  });
  // Mock business data
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setBusinesses(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, []);
  // Filter businesses based on search, category, and filters
  const filteredBusinesses = businesses.filter(business => {
    // Filter by search query
    if (searchQuery && !business.name.toLowerCase().includes(searchQuery.toLowerCase()) && !business.category.toLowerCase().includes(searchQuery.toLowerCase()) && !business.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Filter by category
    if (selectedCategory && business.category !== selectedCategory) {
      return false;
    }
    // Filter by open now
    if (filters.openNow && !business.isOpen) {
      return false;
    }
    // Filter by delivery available
    if (filters.deliveryAvailable && !business.deliveryAvailable) {
      return false;
    }
    // Filter by new businesses
    if (filters.newBusinesses && !business.isNew) {
      return false;
    }
    // Filter by price range
    if (filters.priceRange.length > 0 && !filters.priceRange.includes(business.priceRange)) {
      return false;
    }
    // Filter by rating
    if (filters.minRating > 0 && business.rating< filters.minRating) {
      return false;
    }
    // Filter by distance
    if (business.distance >filters.distance) {
      return false;
    }
    return true;
  });
  // Debug: Log filter changes
  useEffect(() => {
    console.log('Filters updated:', filters);
    console.log('Filtered businesses:', filteredBusinesses.length);
  }, [filters]);
  return<div className="flex-1 overflow-auto bg-gray-50">
      {/* Directory-specific hero section with title */}
      <SimpleHeroSection title="Business Directory" subtitle="Support local - discover amazing right in your neighborhood" />
      {/* Directory-specific search section */}
      <div className="bg-news-primary py-6">
        <div className="container mx-auto px-4">
          <BusinessSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
      </div>
      {/* Category grid */}
      <div className="container mx-auto px-4 py-6">
        <CategoryGrid selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      </div>
      {/* View toggle */}
      <div className="container mx-auto px-4 pb-4 flex justify-end">
        <div className="inline-flex bg-white rounded-md shadow-sm border border-gray-200">
          <button onClick={() =>setViewMode('list')} className={`px-4 py-2 text-sm font-medium rounded-l-md flex items-center ${viewMode === 'list' ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}><List className="h-4 w-4 mr-1.5" />
            List
          </button>
          <button onClick={() =>setViewMode('map')} className={`px-4 py-2 text-sm font-medium rounded-r-md flex items-center ${viewMode === 'map' ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}><Map className="h-4 w-4 mr-1.5" />
            Map
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
            {/* Add pricing information banner */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">List Your Business</h3>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-news-primary">
                      $29
                    </span>
                    <span className="text-gray-600 text-sm">/month</span>
                    <p className="text-xs text-gray-500">
                      or $299/year (save $49)
                    </p>
                  </div>
                  <button onClick={() =>router.push('/business/create')} className="bg-news-primary text-white px-4 py-2 rounded-md text-sm">
                    Get Started</button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Reach local customers with a premium business listing in our
                  directory.
                </p>
              </div>
            </div>
          </div>
          {/* Business listings or map */}
          <div className="flex-1">
            {/* Promoted businesses section */}
            <div className="mb-8">
              <PromotedBusinesses />
            </div>
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{filteredBusinesses.length}{' '}
                {filteredBusinesses.length === 1 ? 'Business' : 'Businesses'}{' '}
                Found</h2>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{locationData?.city || 'Clearwater'}, FL</span>
              </div>
            </div>{viewMode === 'list' /* List view */ ?<div className="space-y-6">
                {filteredBusinesses.map(business => <BusinessCard key={business.id} business={business} />)}
                {filteredBusinesses.length === 0 && <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                    <div className="text-gray-400 mb-4">
                      <Map className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No businesses found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria to see more
                      results.
                    </p>
                    <button onClick={() =>{
                setFilters({
                  openNow: false,
                  deliveryAvailable: false,
                  newBusinesses: false,
                  distance: 10,
                  priceRange: [],
                  minRating: 0
                });
                setSearchQuery('');
                setSelectedCategory(null);
              }} className="text-news-primary font-medium hover:underline">
                      Reset all filters</button>
                  </div>}
              </div> /* Map view */ : <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <BusinessMap businesses={filteredBusinesses} />
              </div>}
          </div>
        </div>
      </div>
    </div>;
};