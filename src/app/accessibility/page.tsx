// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import AccessibilityPage from '@/components/company/AccessibilityPage';

export default function Page() {
  return <AccessibilityPage />;
}
