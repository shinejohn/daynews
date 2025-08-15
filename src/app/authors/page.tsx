// ISR Configuration



import { AuthorsPage } from '@/components/authors/AuthorsPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Authors | DayNews',
  description: 'Authors - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <AuthorsPage />;
}
