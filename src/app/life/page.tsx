// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { LifePage } from '@/components/life/LifePage';

export default function Page() {
  return <LifePage />;
}
