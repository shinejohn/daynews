// ISR Configuration



import { CouponCreatorPage } from '@/components/coupons/CouponCreatorPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'CouponCreator | DayNews',
  description: 'CouponCreator - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CouponCreatorPage />;
}