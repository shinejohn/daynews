// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { LegalNoticesListPage } from '@/components/legal/LegalNoticesListPage';

export default function Page() {
  return <LegalNoticesListPage />;
}