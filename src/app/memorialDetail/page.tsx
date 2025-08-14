// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import MemorialDetailPage from '@/components/memorials/MemorialDetailPage';

export default function Page() {
  return <MemorialDetailPage />;
}
