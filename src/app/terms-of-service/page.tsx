// ISR Configuration



import { TermsOfServicePage } from '@/components/company/TermsOfServicePage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Terms of service | DayNews',
  description: 'Terms of service - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <TermsOfServicePage />;
}
