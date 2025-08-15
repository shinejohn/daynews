// ISR Configuration



import { PaymentPage } from '@/components/classifieds/PaymentPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Payment | DayNews',
  description: 'Payment - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PaymentPage />;
}