// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import CouponsPage from '@/components/CouponsPage';

export default function Page() {
  return <CouponsPage />;
}
