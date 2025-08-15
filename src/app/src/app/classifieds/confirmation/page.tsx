// ISR Configuration



import { ConfirmationPage } from '@/components/classifieds/ConfirmationPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Confirmation | DayNews',
  description: 'Confirmation - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ConfirmationPage />;
}