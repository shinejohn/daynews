// ISR Configuration



import { AnnouncementDetailPage } from '@/components/announcements/AnnouncementDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'AnnouncementDetail | DayNews',
  description: 'AnnouncementDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <AnnouncementDetailPage />;
}
