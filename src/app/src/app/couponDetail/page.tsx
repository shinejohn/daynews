// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CouponDetailPage } from '@/components/coupons/CouponDetailPage';

export default function Page() {
  return <CouponDetailPage />;
}