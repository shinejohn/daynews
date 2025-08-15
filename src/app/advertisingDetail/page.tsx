// ISR Configuration



import { AdvertisingDetailPage } from '@/components/advertising/AdvertisingDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'AdvertisingDetail | DayNews',
  description: 'AdvertisingDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <AdvertisingDetailPage />;
}
