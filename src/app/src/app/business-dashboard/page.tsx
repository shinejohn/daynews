// ISR Configuration



import { BusinessDashboard } from '@/components/BusinessDashboard';

// Rendering strategy: ISR

export const metadata = {
  title: 'Business dashboard | DayNews',
  description: 'Business dashboard - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <BusinessDashboard />;
}