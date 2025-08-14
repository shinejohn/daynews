// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import AboutUsPage from '@/components/about/AboutUsPage';

export default function Page() {
  return <AboutUsPage />;
}
