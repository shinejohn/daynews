// ISR Configuration



import { LegalNoticeDetailPage } from '@/components/legal/LegalNoticeDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'LegalNoticeDetail | DayNews',
  description: 'LegalNoticeDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <LegalNoticeDetailPage />;
}
