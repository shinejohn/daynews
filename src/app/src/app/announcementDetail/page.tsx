// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AnnouncementDetailPage } from '@/components/announcements/AnnouncementDetailPage';

export default function Page() {
  return <AnnouncementDetailPage />;
}