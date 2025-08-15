// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { MemorialsPage } from '@/components/memorials/MemorialsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Memorials | DayNews',
  description: 'Memorials - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <MemorialsPage />;
}