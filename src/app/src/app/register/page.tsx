// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { UserRegistrationPage } from '@/components/auth/UserRegistrationPage';
import { User } from 'lucide-react';


export default function Page() {
  return <UserRegistrationPage />;
}