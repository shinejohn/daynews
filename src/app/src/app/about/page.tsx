// SSG Configuration

export const revalidate = false;

import { AboutUsPage } from '@/components/about/AboutUsPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'About | DayNews',
  description: 'About - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <AboutUsPage />;
}