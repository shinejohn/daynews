// ISR Configuration



import { AccessibilityPage } from '@/components/company/AccessibilityPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Accessibility | DayNews',
  description: 'Accessibility - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <AccessibilityPage />;
}