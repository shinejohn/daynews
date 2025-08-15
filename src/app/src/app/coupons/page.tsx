// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { CouponsPage } from '@/components/CouponsPage';

export default function Page() {
  return <CouponsPage />;
}