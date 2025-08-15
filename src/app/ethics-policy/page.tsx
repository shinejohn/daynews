// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { EthicsPolicyPage } from '@/components/company/EthicsPolicyPage';

export default function Page() {
  return <EthicsPolicyPage />;
}
