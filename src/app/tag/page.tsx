// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { TagPage } from '@/components/tags/TagPage';

export default function Page() {
  return <TagPage />;
}
