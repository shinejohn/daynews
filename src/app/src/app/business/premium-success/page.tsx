// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { PremiumSuccess } from '@/components/PremiumSuccess';

export default function Page() {
  return <PremiumSuccess />;
}