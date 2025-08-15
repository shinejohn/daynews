// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CitySelectionPage } from '@/components/city/CitySelectionPage';

export default function Page() {
  return <CitySelectionPage />;
}