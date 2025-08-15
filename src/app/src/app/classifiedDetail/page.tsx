// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ClassifiedDetailPage } from '@/components/classifieds/ClassifiedDetailPage';

export default function Page() {
  return <ClassifiedDetailPage />;
}