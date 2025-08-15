// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { CreateArticlePage } from '@/components/CreateArticlePage';

export default function Page() {
  return <CreateArticlePage />;
}