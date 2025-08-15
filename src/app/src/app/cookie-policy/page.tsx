// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CookiePolicyPage } from '@/components/company/CookiePolicyPage';

export default function Page() {
  return <CookiePolicyPage />;
}