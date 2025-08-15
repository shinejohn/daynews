// ISR Configuration



import { EventsCalendarPage } from '@/components/events/EventsCalendarPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'EventsCalendar | DayNews',
  description: 'EventsCalendar - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes
export default function Page() {
  return <EventsCalendarPage />;
}
