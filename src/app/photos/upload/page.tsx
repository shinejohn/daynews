// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import PhotoUploadPage from '@/components/photos/PhotoUploadPage';

export default function Page() {
  return <PhotoUploadPage />;
}
