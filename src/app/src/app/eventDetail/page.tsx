// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { EventDetailPage } from '@/components/events/EventDetailPage';

export default function Page() {
  return <EventDetailPage />;
}