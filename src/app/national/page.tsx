// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic'; // Changed from 'force-static' to support client-side hooks

import { NationalHomePage } from '@/components/NationalHomePage';

export default function Page() {
  return <NationalHomePage />;
}
