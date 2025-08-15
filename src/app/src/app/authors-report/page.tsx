// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AuthorsReportPage } from '@/components/AuthorsReportPage';

export default function Page() {
  return <AuthorsReportPage />;
}