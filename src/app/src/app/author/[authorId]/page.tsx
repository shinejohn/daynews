// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AuthorProfilePage } from '@/components/AuthorProfilePage';

export default function Page() {
  return <AuthorProfilePage />;
}