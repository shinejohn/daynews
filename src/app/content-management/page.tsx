// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import ContentManagement from '@/components/admin/ContentManagement';

export default function Page() {
  return <ContentManagement />;
}
