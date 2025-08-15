// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ClassifiedsPage } from '@/components/classifieds/ClassifiedsPage';

export default function Page() {
  return <ClassifiedsPage />;
}
