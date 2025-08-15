// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { PublishPromotePage } from '@/components/PublishPromotePage';

export default function Page() {
  return <PublishPromotePage />;
}