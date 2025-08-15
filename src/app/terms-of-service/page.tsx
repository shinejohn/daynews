// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { TermsOfServicePage } from '@/components/company/TermsOfServicePage';

export default function Page() {
  return <TermsOfServicePage />;
}
