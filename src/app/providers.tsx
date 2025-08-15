'use client';

import React from 'react';
import { LocationDetector } from '@/components/location/LocationDetector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a single query client instance outside of the component
// This prevents recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false, // Disable retries for better error visibility
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Wrap in error boundary
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LocationDetector>
          {children}
        </LocationDetector>
      </QueryClientProvider>
    </React.StrictMode>
  );
}