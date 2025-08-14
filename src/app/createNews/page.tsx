// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import CreateNewsPage from '@/components/CreateNewsPage';

export default function Page() {
  return <CreateNewsPage />;
}
