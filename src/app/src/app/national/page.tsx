// ISR Configuration
export const revalidate = 300; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { NationalHomePage } from '@/components/NationalHomePage';

export default function Page() {
  return <NationalHomePage />;
}