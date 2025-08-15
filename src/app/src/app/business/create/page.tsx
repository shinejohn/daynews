// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { BusinessProfileCreator } from '@/components/BusinessProfileCreator';

export default function Page() {
  return <BusinessProfileCreator />;
}