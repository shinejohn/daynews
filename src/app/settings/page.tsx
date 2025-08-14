// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import UserSettingsPage from '@/components/UserSettingsPage';

export default function Page() {
  return <UserSettingsPage />;
}
