// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { LegalNoticeDetailPage } from '@/components/legal/LegalNoticeDetailPage';

export default function Page() {
  return <LegalNoticeDetailPage />;
}
