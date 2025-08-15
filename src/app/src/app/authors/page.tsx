// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AuthorsPage } from '@/components/authors/AuthorsPage';

export default function Page() {
  return <AuthorsPage />;
}