// ISR Configuration



import { RerunAdPage } from '@/components/classifieds/RerunAdPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Rerun | DayNews',
  description: 'Rerun - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <RerunAdPage />;
}
