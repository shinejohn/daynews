// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import PageDirectory from '@/components/utility/PageDirectory';

export default function Page() {
  return <PageDirectory />;
}
