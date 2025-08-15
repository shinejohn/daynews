// ISR Configuration
export const revalidate = 1800; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { OpinionPage } from '@/components/opinion/OpinionPage';

export default function Page() {
  return <OpinionPage />;
}