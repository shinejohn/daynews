// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { CouponsPage } from '@/components/CouponsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Coupons | DayNews',
  description: 'Coupons - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CouponsPage />;
}
