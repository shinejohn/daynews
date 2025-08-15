'use client';

import React from 'react';
import { LocationDetector } from '@/components/location/LocationDetector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationDetector>
        {children}
      </LocationDetector>
    </QueryClientProvider>
  );
}