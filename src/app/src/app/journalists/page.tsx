// ISR Configuration



import { JournalistsAdminPage } from '@/components/JournalistsAdminPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Journalists | DayNews',
  description: 'Journalists - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <JournalistsAdminPage />;
}