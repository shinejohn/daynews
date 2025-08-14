// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import ConfirmationPage from '@/components/classifieds/ConfirmationPage';

export default function Page() {
  return <ConfirmationPage />;
}
