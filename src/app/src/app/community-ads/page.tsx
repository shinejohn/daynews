// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CommunityAdsPage } from '@/components/ads/CommunityAdsPage';

export default function Page() {
  return <CommunityAdsPage />;
}