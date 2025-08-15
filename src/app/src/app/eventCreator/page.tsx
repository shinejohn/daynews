// ISR Configuration



import { EventCreatorPage } from '@/components/events/EventCreatorPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'EventCreator | DayNews',
  description: 'EventCreator - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <EventCreatorPage />;
}