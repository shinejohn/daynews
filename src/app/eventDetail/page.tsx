// ISR Configuration



import { EventDetailPage } from '@/components/events/EventDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'EventDetail | DayNews',
  description: 'EventDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <EventDetailPage />;
}
