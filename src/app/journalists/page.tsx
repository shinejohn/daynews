// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { JournalistsAdminPage } from '@/components/JournalistsAdminPage';

export default function Page() {
  return <JournalistsAdminPage />;
}
