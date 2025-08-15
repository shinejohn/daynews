// ISR Configuration



import { AnnouncementCreatorPage } from '@/components/announcements/AnnouncementCreatorPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'AnnouncementCreator | DayNews',
  description: 'AnnouncementCreator - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <AnnouncementCreatorPage />;
}