// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { SportsPage } from '@/components/sports/SportsPage';

export default function Page() {
  return <SportsPage />;
}
