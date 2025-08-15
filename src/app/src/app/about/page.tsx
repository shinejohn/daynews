// SSG Configuration
export const dynamic = 'force-static';
export const revalidate = false;

import { AboutUsPage } from '@/components/about/AboutUsPage';

export default function Page() {
  return <AboutUsPage />;
}