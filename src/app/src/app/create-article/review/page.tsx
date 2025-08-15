// ISR Configuration



import { ArticleReviewPage } from '@/components/ArticleReviewPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Review | DayNews',
  description: 'Review - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ArticleReviewPage />;
}