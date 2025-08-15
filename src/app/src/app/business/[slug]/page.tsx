// ISR Configuration



import { BusinessProfilePage } from '@/components/BusinessProfilePage';

// Rendering strategy: ISR

export const metadata = {
  title: '[slug] | DayNews',
  description: '[slug] - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <BusinessProfilePage />;
}