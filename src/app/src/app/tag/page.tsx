// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-dynamic'; // Changed to support QueryClient

import { TagPage } from '@/components/tags/TagPage';

export default function Page() {
  return <TagPage />;
}