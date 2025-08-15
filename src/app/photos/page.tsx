// ISR Configuration

export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { PhotoGalleryPage } from '@/components/photos/PhotoGalleryPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'Photos | DayNews',
  description: 'Photos - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PhotoGalleryPage />;
}
