// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { NationalHomePage } from '@/components/NationalHomePage';

// Rendering strategy: ISR

export const metadata = {
  title: 'National | DayNews',
  description: 'National - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <NationalHomePage />;
}