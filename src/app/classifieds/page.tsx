// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { ClassifiedsPage } from '@/components/classifieds/ClassifiedsPage';

export default function Page() {
  return <ClassifiedsPage />;
}
