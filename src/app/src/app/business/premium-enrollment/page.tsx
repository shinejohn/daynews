// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { PremiumEnrollment } from '@/components/PremiumEnrollment';

export default function Page() {
  return <PremiumEnrollment />;
}