// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AnnouncementCreatorPage } from '@/components/announcements/AnnouncementCreatorPage';

export default function Page() {
  return <AnnouncementCreatorPage />;
}