// ISR Configuration



import { PremiumEnrollment } from '@/components/PremiumEnrollment';

// Rendering strategy: ISR

export const metadata = {
  title: 'Premium enrollment | DayNews',
  description: 'Premium enrollment - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PremiumEnrollment />;
}