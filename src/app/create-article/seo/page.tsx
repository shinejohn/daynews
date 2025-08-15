// ISR Configuration



// import { ArticleSeoPage } from '@/components/ArticleSeoPage'; // Component not found

// Rendering strategy: ISR

export const metadata = {
  title: 'Seo | DayNews',
  description: 'Seo - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <div>TODO: ArticleSeoPage</div>;
}
