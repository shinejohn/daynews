// ISR Configuration



import { SubscriptionOptionsPage } from '@/components/company/SubscriptionOptionsPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Subscription options | DayNews',
  description: 'Subscription options - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <SubscriptionOptionsPage />;
}