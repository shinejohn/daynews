// ISR Configuration



import { CookiePolicyPage } from '@/components/company/CookiePolicyPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Cookie policy | DayNews',
  description: 'Cookie policy - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <CookiePolicyPage />;
}