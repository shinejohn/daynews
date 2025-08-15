// ISR Configuration



import { PublishPromotePage } from '@/components/PublishPromotePage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Publish | DayNews',
  description: 'Publish - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PublishPromotePage />;
}