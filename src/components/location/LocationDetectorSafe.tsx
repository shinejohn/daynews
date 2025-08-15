'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';

type LocationData = {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

type LocationContextType = {
  locationData: LocationData | null;
  loading: boolean;
  error: string | null;
};

// Default location data
const DEFAULT_LOCATION: LocationData = {
  city: 'Clearwater',
  state: 'FL',
  country: 'USA',
  latitude: 27.9659,
  longitude: -82.8001
};

// Default context value
const DEFAULT_CONTEXT: LocationContextType = {
  locationData: DEFAULT_LOCATION,
  loading: false,
  error: null
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Safe hook that won't throw if used outside provider
export const useLocationDetection = (): LocationContextType => {
  const context = useContext(LocationContext);
  
  // If no context is available, return default values
  if (!context) {
    return DEFAULT_CONTEXT;
  }
  
  return context;
};

export const LocationDetector: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [locationData, setLocationData] = useState<LocationData | null>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false); // Start with false since we have default data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const detectLocation = async () => {
      try {
        // Set default location immediately
        if (mounted) {
          setLocationData(DEFAULT_LOCATION);
        }
        
        // In a real app, this would make an API call to get actual location
        // For now, we're just using the default
        setTimeout(() => {
          if (mounted) {
            setLoading(false);
          }
        }, 100);
      } catch (err) {
        if (mounted) {
          console.error('Location detection error:', err);
          setError('Failed to detect location');
          setLocationData(DEFAULT_LOCATION);
          setLoading(false);
        }
      }
    };
    
    detectLocation();
    
    return () => {
      mounted = false;
    };
  }, []);

  const value: LocationContextType = {
    locationData,
    loading,
    error
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};