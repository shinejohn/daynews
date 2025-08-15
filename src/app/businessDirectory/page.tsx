// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { BusinessDirectoryPage } from '@/components/business/BusinessDirectoryPage';

export default function Page() {
  return <BusinessDirectoryPage />;
}
