// ISR Configuration



import { PostListingPage } from '@/components/classifieds/PostListingPage';

// Rendering strategy: ISR

export const metadata = {
  title: 'PostListing | DayNews',
  description: 'PostListing - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <PostListingPage />;
}
