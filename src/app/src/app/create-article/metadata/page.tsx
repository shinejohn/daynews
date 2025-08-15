// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ArticleMetadataPage } from '@/components/ArticleMetadataPage';

export default function Page() {
  return <ArticleMetadataPage />;
}