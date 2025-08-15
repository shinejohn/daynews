// ISR Configuration



import { PrivacyPolicyPage } from '@/components/company/PrivacyPolicyPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Privacy policy | DayNews',
  description: 'Privacy policy - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <PrivacyPolicyPage />;
}