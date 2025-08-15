// ISR Configuration



import { CareersPage } from '@/components/company/CareersPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Careers | DayNews',
  description: 'Careers - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <CareersPage />;
}
