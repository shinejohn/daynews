// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { EventCreatorPage } from '@/components/events/EventCreatorPage';

export default function Page() {
  return <EventCreatorPage />;
}
