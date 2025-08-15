// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { NationalHomePage } from '@/components/NationalHomePage';

export default function Page() {
  return <NationalHomePage />;
}
