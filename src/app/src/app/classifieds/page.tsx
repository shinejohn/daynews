// SSR Configuration

export const runtime = 'nodejs';

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