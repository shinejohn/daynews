'use client';
// Converted from Magic Patterns
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PageHeader } from '../PageHeader';
import { CurrentCityHeader } from './CurrentCityHeader';
import { NearbyCitiesGrid } from './NearbyCitiesGrid';
import { CitySearch } from './CitySearch';
import { PopularCities } from './PopularCities';
import { MultiCitySettings } from './MultiCitySettings';
import { useLocationDetection } from '../location/LocationDetector';
export const CitySelectionPage = () =>{
  const {
    locationData,
    updateLocation
  } = useLocationDetection();
  const [loading, setLoading] = useState(true);
  const [nearbyCities, setNearbyCities] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [followedCities, setFollowedCities] = useState([]);
  const [mapView, setMapView] = useState(true);
  const [multiCityMode, setMultiCityMode] = useState(false);
  // Simulate fetching nearby and popular cities
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      // Mock nearby cities data
      const [[], setMockNearbyCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMockNearbyCities = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMockNearbyCities(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setMockNearbyCities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMockNearbyCities();
  }, []);
      // Mock popular cities data
      const [] = [{
        id: 'tampa-fl',
        name: 'Tampa',
        state: 'FL',
        image: 'https://images.unsplash.com/photo-1580743244072-b8a0a46bc7af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        population: 384,
        '959': '',
        activeStories: 423,
        trending: true,
        isFollowed: false
      }, {
        id: 'st-petersburg-fl',
        name: 'St. Petersburg',
        state: 'FL',
        image: 'https://images.unsplash.com/photo-1590059590921-f0c2f8b6b1a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        population: 258,
        '308': '',
        activeStories: 312,
        trending: false,
        isFollowed: false
      }, {
        id: 'orlando-fl',
        name: 'Orlando',
        state: 'FL',
        image: 'https://images.unsplash.com/photo-1575089776834-8be34696ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        population: 307,
        '573': '',
        activeStories: 387,
        trending: true,
        isFollowed: false
      }, {
        id: 'miami-fl',
        name: 'Miami',
        state: 'FL',
        image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        population: 442,
        '241': '',
        activeStories: 489,
        trending: false,
        isFollowed: false
      }, {
        id: 'jacksonville-fl',
        name: 'Jacksonville',
        state: 'FL',
        image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        population: 911,
        '507': '',
        activeStories: 356,
        trending: false,
        isFollowed: false
      }, {
        id: 'fort-lauderdale-fl',
        name: 'Fort Lauderdale',
        state: 'FL',
        image: 'https://images.unsplash.com/photo-1627083692505-4a2cb42d1d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        population: 182,
        '760': '',
        activeStories: 278,
        trending: true,
        isFollowed: false
      }];
      // Set initial followed cities (just the current one)
      const initialFollowedCities = [[][0]];
      setNearbyCities([]);
      setPopularCities([]);
      setFollowedCities(initialFollowedCities);
      setLoading(false);
    }, 1000);
  }, []);
  const handleCitySelect = city => {
    updateLocation({
      city: city.name,
      state: city.state,
      country: 'US',
      communityId: city.id,
      coordinates: city.coordinates || {
        latitude: 0,
        longitude: 0
      }
    });
  };
  const handleToggleFollow = cityId => {
    // Toggle follow status in nearby cities
    setNearbyCities(prev => prev.map(city => city.id === cityId ? {
      ...city,
      isFollowed: !city.isFollowed
    } : city));
    // Toggle follow status in popular cities
    setPopularCities(prev => prev.map(city => city.id === cityId ? {
      ...city,
      isFollowed: !city.isFollowed
    } : city));
    // Update followed cities list
    const cityToToggle = [...nearbyCities, ...popularCities].find(city => city.id === cityId);
    if (cityToToggle) {
      if (cityToToggle.isFollowed) {
        // If it was followed, remove it
        setFollowedCities(prev => prev.filter(city => city.id !== cityId));
      } else {
        // If it wasn't followed, add it
        setFollowedCities(prev => [...prev, cityToToggle]);
      }
    }
  };
  const handleToggleMapView = () => {
    setMapView(!mapView);
  };
  const handleToggleMultiCityMode = () => {
    setMultiCityMode(!multiCityMode);
  };
  if (loading) {
    return<div className="flex-1 overflow-auto bg-gray-50">
        <PageHeader />
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>;
  }
  return <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Current City Header */}
        <CurrentCityHeader currentCity={locationData} followedCities={followedCities} />
        {/* Multi-City Mode Settings */}
        <div className="mt-6">
          <MultiCitySettings isEnabled={multiCityMode} onToggle={handleToggleMultiCityMode} followedCities={followedCities} />
        </div>
        {/* City Search */}
        <div className="mt-6">
          <CitySearch onCitySelect={handleCitySelect} />
        </div>
        {/* Nearby Cities Grid */}
        <div className="mt-8">
          <NearbyCitiesGrid cities={nearbyCities} onCitySelect={handleCitySelect} onToggleFollow={handleToggleFollow} mapView={mapView} onToggleMapView={handleToggleMapView} />
        </div>
        {/* Popular Cities */}
        <div className="mt-12">
          <PopularCities cities={popularCities} onCitySelect={handleCitySelect} onToggleFollow={handleToggleFollow} />
        </div>
        {/* Request Coverage */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Don't see your community?</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">We're expanding our coverage all the time. Let us know where you'd
            like to see Day.news next!</p>
          <button className="bg-news-primary hover:bg-news-primary-dark text-white font-medium px-6 py-3 rounded-md transition-colors">
            Request Coverage for Your Community
          </button>
        </div>
      </div>
    </div>;
};