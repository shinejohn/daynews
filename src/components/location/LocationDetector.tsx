'use client';
// Converted from Magic Patterns
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
const LocationContext = createContext<LocationContextType>({
  locationData: null,
  loading: true,
  error: null
});
export const useLocationDetection = () => {
  const context = useContext(LocationContext);
  return context;
};
export const LocationDetector: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const detectLocation = async () => {
      try {
        // Default location data to use immediately
        const defaultLocation = {
          city: 'Clearwater',
          state: 'FL',
          country: 'USA',
          latitude: 27.9659,
          longitude: -82.8001
        };
        // Set default location immediately to prevent race conditions
        if (mounted) {
          setLocationData(defaultLocation);
        }
        // In a real app, this would make an API call to get actual location
        // For now, we're just using the default after a small delay to simulate an API call
        setTimeout(() => {
          if (mounted) {
            setLoading(false);
          }
        }, 500);
      } catch (err) {
        if (mounted) {
          console.error('Location detection error:', err);
          setError('Failed to detect location');
          // Even on error, set default location to prevent UI issues
          setLocationData({
            city: 'Clearwater',
            state: 'FL',
            country: 'USA',
            latitude: 27.9659,
            longitude: -82.8001
          });
          setLoading(false);
        }
      }
    };
    detectLocation();
    return () => {
      mounted = false;
    };
  }, []);
  const value = {
    locationData,
    loading,
    error
  };
  return<LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>;
};