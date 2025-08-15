// ISR Configuration



import { TagPage } from '@/components/tags/TagPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Tag | DayNews',
  description: 'Tag - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <TagPage />;
}
