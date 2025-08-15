// SSR Configuration

export const runtime = 'nodejs';

import { AnnouncementsPage } from '@/components/AnnouncementsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Announcements | DayNews',
  description: 'Announcements - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <AnnouncementsPage />;
}