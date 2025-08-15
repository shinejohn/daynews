// ISR Configuration



import { CouponDetailPage } from '@/components/coupons/CouponDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'CouponDetail | DayNews',
  description: 'CouponDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CouponDetailPage />;
}