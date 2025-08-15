// ISR Configuration



import { SelectTimeframePage } from '@/components/classifieds/SelectTimeframePage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Select timeframe | DayNews',
  description: 'Select timeframe - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <SelectTimeframePage />;
}
