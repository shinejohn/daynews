// ISR Configuration



import { ArticleMetadataPage } from '@/components/ArticleMetadataPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Metadata | DayNews',
  description: 'Metadata - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ArticleMetadataPage />;
}