// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { UserProfilePage } from '@/components/UserProfilePage';
import { User } from 'lucide-react';


export default function Page() {
  return <UserProfilePage />;
}
