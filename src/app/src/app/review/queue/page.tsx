// ISR Configuration



import { CommunityReviewQueuePage } from '@/components/CommunityReviewQueuePage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Queue | DayNews',
  description: 'Queue - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CommunityReviewQueuePage />;
}