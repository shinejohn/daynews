// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { RerunAdPage } from '@/components/classifieds/RerunAdPage';

export default function Page() {
  return <RerunAdPage />;
}
