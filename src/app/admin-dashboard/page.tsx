// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function Page() {
  return <AdminDashboard />;
}
