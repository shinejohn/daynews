// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { HomePage } from '@/components/HomePage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Home | DayNews',
  description: 'Home - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <HomePage />;
}
