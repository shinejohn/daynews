// ISR Configuration



import { EthicsPolicyPage } from '@/components/company/EthicsPolicyPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Ethics policy | DayNews',
  description: 'Ethics policy - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <EthicsPolicyPage />;
}
