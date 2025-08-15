// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { CreateNewsPage } from '@/components/CreateNewsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'CreateNews | DayNews',
  description: 'CreateNews - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CreateNewsPage />;
}