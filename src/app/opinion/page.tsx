// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { OpinionPage } from '@/components/opinion/OpinionPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Opinion | DayNews',
  description: 'Opinion - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <OpinionPage />;
}
