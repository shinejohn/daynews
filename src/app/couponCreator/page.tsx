// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import CouponCreatorPage from '@/components/coupons/CouponCreatorPage';

export default function Page() {
  return <CouponCreatorPage />;
}
