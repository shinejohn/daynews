// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic' // Changed to support client-side hooks;

import { PhotoGalleryPage } from '@/components/photos/PhotoGalleryPage';

export default function Page() {
  return <PhotoGalleryPage />;
}
