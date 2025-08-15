'use client';

import React, { Suspense } from 'react';

// Wrapper component to ensure hooks are only called on client side
export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}