// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { HomePage } from '@/components/HomePage';

export default function Page() {
  return <HomePage />;
}
