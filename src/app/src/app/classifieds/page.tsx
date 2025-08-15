// SSR Configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { ClassifiedsPage } from '@/components/classifieds/ClassifiedsPage';

export default function Page() {
  return <ClassifiedsPage />;
}