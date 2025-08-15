// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { LegalNoticeCreatorPage } from '@/components/legal/LegalNoticeCreatorPage';

export default function Page() {
  return <LegalNoticeCreatorPage />;
}
