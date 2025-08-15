// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { TrendingPage } from '@/components/trending/TrendingPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Trending | DayNews',
  description: 'Trending - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <TrendingPage />;
}
