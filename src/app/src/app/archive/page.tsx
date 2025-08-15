// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { ArchiveBrowserPage } from '@/components/archive/ArchiveBrowserPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Archive | DayNews',
  description: 'Archive - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ArchiveBrowserPage />;
}