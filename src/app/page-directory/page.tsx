// ISR Configuration



import { PageDirectory } from '@/components/utility/PageDirectory';

// Rendering strategy: ISR

export const metadata = {
  title: 'Page directory | DayNews',
  description: 'Page directory - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PageDirectory />;
}
