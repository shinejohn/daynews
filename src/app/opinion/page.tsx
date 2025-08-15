// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { OpinionPage } from '@/components/opinion/OpinionPage';

export default function Page() {
  return <OpinionPage />;
}
