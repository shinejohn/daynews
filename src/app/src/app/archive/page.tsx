// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ArchiveBrowserPage } from '@/components/archive/ArchiveBrowserPage';

export default function Page() {
  return <ArchiveBrowserPage />;
}