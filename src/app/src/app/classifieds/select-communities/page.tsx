// ISR Configuration



import { SelectCommunitiesPage } from '@/components/classifieds/SelectCommunitiesPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Select communities | DayNews',
  description: 'Select communities - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <SelectCommunitiesPage />;
}