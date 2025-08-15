// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ArticleReviewPage } from '@/components/ArticleReviewPage';

export default function Page() {
  return <ArticleReviewPage />;
}