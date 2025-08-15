// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { BusinessDashboard } from '@/components/BusinessDashboard';

export default function Page() {
  return <BusinessDashboard />;
}