// ISR Configuration



import { ModerationQueue } from '@/components/admin/ModerationQueue';

// Rendering strategy: DYNAMIC
export const dynamic = 'force-dynamic';

export default function Page() {
  return <ModerationQueue />;
}