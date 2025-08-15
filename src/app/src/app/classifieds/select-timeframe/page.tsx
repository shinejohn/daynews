// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { SelectTimeframePage } from '@/components/classifieds/SelectTimeframePage';

export default function Page() {
  return <SelectTimeframePage />;
}