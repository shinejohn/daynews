// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { CitySelectionPage } from '@/components/city/CitySelectionPage';

export default function Page() {
  return <CitySelectionPage />;
}