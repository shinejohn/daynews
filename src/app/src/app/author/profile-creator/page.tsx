// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AuthorProfileCreatorPage } from '@/components/AuthorProfileCreatorPage';

export default function Page() {
  return <AuthorProfileCreatorPage />;
}