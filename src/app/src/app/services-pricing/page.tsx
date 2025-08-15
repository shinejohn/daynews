// ISR Configuration



import { ServicesAndPricingPage } from '@/components/ServicesAndPricingPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Services pricing | DayNews',
  description: 'Services pricing - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <ServicesAndPricingPage />;
}