// ISR Configuration



import { ClassifiedDetailPage } from '@/components/classifieds/ClassifiedDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'ClassifiedDetail | DayNews',
  description: 'ClassifiedDetail - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <ClassifiedDetailPage />;
}
