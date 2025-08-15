// ISR Configuration



import { MemorialDetailPage } from '@/components/memorials/MemorialDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'MemorialDetail | DayNews',
  description: 'MemorialDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <MemorialDetailPage />;
}