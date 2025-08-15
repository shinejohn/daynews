// ISR Configuration



import { DoNotSellPage } from '@/components/company/DoNotSellPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Do not sell my information | DayNews',
  description: 'Do not sell my information - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <DoNotSellPage />;
}
