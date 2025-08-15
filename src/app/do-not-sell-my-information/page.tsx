// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { DoNotSellPage } from '@/components/company/DoNotSellPage';

export default function Page() {
  return <DoNotSellPage />;
}
