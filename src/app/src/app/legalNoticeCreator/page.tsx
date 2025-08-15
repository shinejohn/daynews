// ISR Configuration



import { LegalNoticeCreatorPage } from '@/components/legal/LegalNoticeCreatorPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'LegalNoticeCreator | DayNews',
  description: 'LegalNoticeCreator - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <LegalNoticeCreatorPage />;
}