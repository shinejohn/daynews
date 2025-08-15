'use client';
// Converted from Magic Patterns
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, MapPin, Search, X } from 'lucide-react';
import { useLocationDetection } from './LocationDetector';
// Mock data for communities search
const searchCommunities = query => {
  if (!query || query.length < 2) return [];
  const [[], setMockCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() =>{
    const fetchMockCommunities = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMockCommunities(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMockCommunities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMockCommunities();
  }, []);
  const lowercaseQuery = query.toLowerCase();
  return [].filter(community => community.name.toLowerCase().includes(lowercaseQuery) || community.state.toLowerCase().includes(lowercaseQuery)).slice(0, 5); // Limit to first 5 results
};
export const CommunitySwitcher = ({
  onClose
}) => {
  const {
    locationData,
    updateLocation
  } = useLocationDetection();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        const results = searchCommunities(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  const handleCommunitySelect = community => {
    setSelectedCommunity(community);
    setSearchQuery(`${community.name}, ${community.state}`);
    setSearchResults([]);
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (selectedCommunity) {
      updateLocation({
        city: selectedCommunity.name,
        state: selectedCommunity.state,
        country: selectedCommunity.country,
        communityId: selectedCommunity.id,
        coordinates: locationData?.coordinates || {
          latitude: 0,
          longitude: 0
        }
      });
      if (onClose) onClose();
    }
  };
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCommunity(null);
    setSearchResults([]);
  };
  return<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
        <h3 className="text-news-primary font-medium mb-2 md:mb-0">
          Find News from Your Community
        </h3>
        <div className="text-xs text-gray-500">
          Serving over 9,000 communities nationwide
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Enter city and state (e.g. Tampa, FL)" value={searchQuery} onChange={e =>setSearchQuery(e.target.value)} className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-news-primary" />
          {searchQuery &&<button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>}
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <ul className="py-1">
                {searchResults.map(community => <li key={community.id}>
                    <button type="button" onClick={() =>handleCommunitySelect(community)} className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100"><MapPin className="h-4 w-4 mr-2 text-news-primary" />
                      <span>
                        {community.name}, {community.state}
                      </span>
                    </button>
                  </li>)}
              </ul>
            </div>}
          {/* Loading indicator */}
          {isSearching && <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10 p-3 text-center">
              <div className="animate-pulse text-sm text-gray-500">
                Searching communities...
              </div>
            </div>}
        </div>
        <button type="submit" disabled={!selectedCommunity} className={`px-4 py-2.5 rounded-md text-sm font-medium flex items-center justify-center 
            ${selectedCommunity ? 'bg-news-primary text-white hover:bg-news-primary-dark' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
          <span>Go to Community</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="text-xs text-gray-500 mr-1">Popular:</div>{['Tampa, FL', 'Orlando, FL', 'Miami, FL', 'Atlanta, GA', 'New York, NY'].map(location =><button key={location} type="button" onClick={() =>setSearchQuery(location)} className="text-xs bg-white hover:bg-gray-100 text-news-primary px-2 py-1 rounded-full border border-gray-200">
            {location}</button>)}
      </div>
    </div>;
};