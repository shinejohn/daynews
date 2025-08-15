// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { SubscriptionOptionsPage } from '@/components/company/SubscriptionOptionsPage';

export default function Page() {
  return <SubscriptionOptionsPage />;
}