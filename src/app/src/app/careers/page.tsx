// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CareersPage } from '@/components/company/CareersPage';

export default function Page() {
  return <CareersPage />;
}