// ISR Configuration



import { NewsroomPage } from '@/components/company/NewsroomPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Newsroom | DayNews',
  description: 'Newsroom - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <NewsroomPage />;
}
