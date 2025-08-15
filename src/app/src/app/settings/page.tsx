'use client';

import { UserSettingsPage } from '@/components/UserSettingsPage';
import { User } from 'lucide-react';

// Rendering strategy: DYNAMIC
export const dynamic = 'force-dynamic';


export default function Page() {
  return <UserSettingsPage />;
}