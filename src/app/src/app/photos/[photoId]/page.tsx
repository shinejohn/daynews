// ISR Configuration



import { PhotoDetailPage } from '@/components/photos/PhotoDetailPage';

// Rendering strategy: ISR

export const metadata = {
  title: '[photoId] | DayNews',
  description: '[photoId] - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PhotoDetailPage />;
}