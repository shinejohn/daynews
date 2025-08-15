// ISR Configuration



import { LegalNoticesListPage } from '@/components/legal/LegalNoticesListPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'LegalNoticesList | DayNews',
  description: 'LegalNoticesList - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <LegalNoticesListPage />;
}