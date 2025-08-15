// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { TrendingPage } from '@/components/trending/TrendingPage';

export default function Page() {
  return <TrendingPage />;
}