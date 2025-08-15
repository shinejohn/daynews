// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { PostListingPage } from '@/components/classifieds/PostListingPage';

export default function Page() {
  return <PostListingPage />;
}
