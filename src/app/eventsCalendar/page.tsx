// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic'; // Changed to support client-side hooks

import { EventsCalendarPage } from '@/components/events/EventsCalendarPage';
export default function Page() {
  return <EventsCalendarPage />;
}
