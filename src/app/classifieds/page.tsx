// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { ClassifiedsPage } from '@/components/classifieds/ClassifiedsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Classifieds | DayNews',
  description: 'Classifieds - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ClassifiedsPage />;
}
