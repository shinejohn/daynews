// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { MemorialsPage } from '@/components/memorials/MemorialsPage';

export default function Page() {
  return <MemorialsPage />;
}