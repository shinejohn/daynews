// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { EventsCalendarPage } from '@/components/events/EventsCalendarPage';
export default function Page() {
  return <EventsCalendarPage />;
}
