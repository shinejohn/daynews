// ISR Configuration



import { UserRegistrationPage } from '@/components/auth/UserRegistrationPage';
import { User } from 'lucide-react';

// Rendering strategy: ISR

export const metadata = {
  title: 'Register | DayNews',
  description: 'Register - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes


export default function Page() {
  return <UserRegistrationPage />;
}