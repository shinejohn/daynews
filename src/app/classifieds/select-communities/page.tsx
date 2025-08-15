// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { SelectCommunitiesPage } from '@/components/classifieds/SelectCommunitiesPage';

export default function Page() {
  return <SelectCommunitiesPage />;
}
