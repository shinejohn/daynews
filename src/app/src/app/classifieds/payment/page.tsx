// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { PaymentPage } from '@/components/classifieds/PaymentPage';

export default function Page() {
  return <PaymentPage />;
}