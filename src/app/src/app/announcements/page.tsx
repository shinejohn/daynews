// SSR Configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { AnnouncementsPage } from '@/components/AnnouncementsPage';

export default function Page() {
  return <AnnouncementsPage />;
}