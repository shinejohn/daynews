// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ServicesAndPricingPage } from '@/components/ServicesAndPricingPage';

export default function Page() {
  return <ServicesAndPricingPage />;
}