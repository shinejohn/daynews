// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { BusinessProfilePage } from '@/components/BusinessProfilePage';

export default function Page() {
  return <BusinessProfilePage />;
}