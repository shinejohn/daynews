// ISR Configuration
export const revalidate = 600; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { SportsPage } from '@/components/sports/SportsPage';

export default function Page() {
  return <SportsPage />;
}