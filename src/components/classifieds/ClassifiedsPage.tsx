'use client';
// Converted from Magic Patterns
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { SearchFilterHero } from './SearchFilterHero';
import { ClassifiedCard } from './ClassifiedCard';
import { SimpleHeroSection } from '../hero/SimpleHeroSection';
export const ClassifiedsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [listingCreated, setListingCreated] = useState(false);
  // Check if we've just created a listing
  useEffect(() => {
    if (false /* TODO: Convert location.state to searchParams or context - was: location.state?.listingCreated */) {
      setListingCreated(true);
      // Clear the state after showing notification
      setTimeout(() => {
        setListingCreated(false);
      }, 5000);
    }
  }, [/* TODO: Convert location.state to searchParams or context */]);
  // Mock classifieds data
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchClassifieds = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setClassifieds(data || []);
      } catch (error) {
        console.error('Error fetching marketplace_items:', error);
        setClassifieds([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassifieds();
  }, []);
  // Filter classifieds based on search query, category, and subcategory
  const filteredClassifieds = classifieds.filter(classified => {
    // Apply search filter
    const matchesSearch = searchQuery ? classified.title.toLowerCase().includes(searchQuery.toLowerCase()) || classified.description.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    // Apply category filter
    const matchesCategory = categoryFilter === 'all' ? true : classified.category === categoryFilter;
    // Apply subcategory filter
    const matchesSubcategory = subcategoryFilter === 'all' ? true : classified.subcategory === subcategoryFilter;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });
  return <div className="flex-1 overflow-auto bg-gray-50">
      <SimpleHeroSection title="Community Classifieds" subtitle="Buy, sell, and connect with your neighbors" />
      {/* Listing created notification */}
      {listingCreated && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">
            Your listing has been created and is now live.
          </span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setListingCreated(false)}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>}
      <SearchFilterHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} subcategoryFilter={subcategoryFilter} setSubcategoryFilter={setSubcategoryFilter} />
      <div className="container mx-auto px-4 py-8">
        {filteredClassifieds.length === 0 ? <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No listings found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search filters or check back later for new
              listings.
            </p>
            <button onClick={() => {
          setCategoryFilter('all');
          setSubcategoryFilter('all');
          setSearchQuery('');
        }} className="text-news-primary hover:underline">
              Clear all filters
            </button>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassifieds.map(classified => <ClassifiedCard key={classified.id} classified={classified} />)}
          </div>}
      </div>
    </div>;
};