// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AnnouncementsPage } from '@/components/AnnouncementsPage';

export default function Page() {
  return <AnnouncementsPage />;
}
