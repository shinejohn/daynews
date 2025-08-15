// ISR Configuration



import { PhotoUploadPage } from '@/components/photos/PhotoUploadPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Upload | DayNews',
  description: 'Upload - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PhotoUploadPage />;
}