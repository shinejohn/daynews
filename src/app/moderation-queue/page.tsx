// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ModerationQueue } from '@/components/admin/ModerationQueue';

export default function Page() {
  return <ModerationQueue />;
}
