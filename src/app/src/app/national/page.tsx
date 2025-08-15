// ISR Configuration
export const revalidate = 300; // seconds
export const dynamic = 'force-static';

import { NationalHomePage } from '@/components/NationalHomePage';

export default function Page() {
  return <NationalHomePage />;
}