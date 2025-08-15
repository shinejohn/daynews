// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { RevenueAnalytics } from '@/components/admin/RevenueAnalytics';

export default function Page() {
  return <RevenueAnalytics />;
}
