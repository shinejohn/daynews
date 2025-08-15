'use client';

import { UserProfilePage } from '@/components/UserProfilePage';
import { User } from 'lucide-react';

// Rendering strategy: DYNAMIC
export const dynamic = 'force-dynamic';


export default function Page() {
  return <UserProfilePage />;
}