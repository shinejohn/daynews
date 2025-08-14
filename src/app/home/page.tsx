// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import HomePage from '@/components/HomePage';

export default function Page() {
  return <HomePage />;
}
