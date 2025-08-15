// ISR Configuration



import { CommunityAdsPage } from '@/components/ads/CommunityAdsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Community ads | DayNews',
  description: 'Community ads - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CommunityAdsPage />;
}