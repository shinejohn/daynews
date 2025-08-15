// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { PrivacyPolicyPage } from '@/components/company/PrivacyPolicyPage';

export default function Page() {
  return <PrivacyPolicyPage />;
}