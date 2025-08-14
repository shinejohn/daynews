// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import BusinessDirectoryPage from '@/components/business/BusinessDirectoryPage';

export default function Page() {
  return <BusinessDirectoryPage />;
}
