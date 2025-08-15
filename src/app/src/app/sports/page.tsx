// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { SportsPage } from '@/components/sports/SportsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Sports | DayNews',
  description: 'Sports - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <SportsPage />;
}