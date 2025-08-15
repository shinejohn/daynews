// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CommunityReviewQueuePage } from '@/components/CommunityReviewQueuePage';

export default function Page() {
  return <CommunityReviewQueuePage />;
}