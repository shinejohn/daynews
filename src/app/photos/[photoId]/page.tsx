// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import PhotoDetailPage from '@/components/photos/PhotoDetailPage';

export default function Page() {
  return <PhotoDetailPage />;
}
