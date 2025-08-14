// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import AdvertisingDetailPage from '@/components/advertising/AdvertisingDetailPage';

export default function Page() {
  return <AdvertisingDetailPage />;
}
