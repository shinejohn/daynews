// ISR Configuration



import { ContentManagement } from '@/components/admin/ContentManagement';

// Rendering strategy: ISR

export const metadata = {
  title: 'Content management | DayNews',
  description: 'Content management - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ContentManagement />;
}
