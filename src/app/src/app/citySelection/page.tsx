// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { CitySelectionPage } from '@/components/city/CitySelectionPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'CitySelection | DayNews',
  description: 'CitySelection - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CitySelectionPage />;
}