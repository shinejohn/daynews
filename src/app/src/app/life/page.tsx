// ISR Configuration
export const revalidate = 1800; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { LifePage } from '@/components/life/LifePage';

export default function Page() {
  return <LifePage />;
}