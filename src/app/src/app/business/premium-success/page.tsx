// ISR Configuration



import { PremiumSuccess } from '@/components/PremiumSuccess';

// Rendering strategy: ISR

export const metadata = {
  title: 'Premium success | DayNews',
  description: 'Premium success - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PremiumSuccess />;
}