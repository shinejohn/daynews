// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import UserRegistrationPage from '@/components/auth/UserRegistrationPage';

export default function Page() {
  return <UserRegistrationPage />;
}
