// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import NewsroomPage from '@/components/company/NewsroomPage';

export default function Page() {
  return <NewsroomPage />;
}
