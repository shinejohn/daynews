// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import SearchResultsPage from '@/components/search/SearchResultsPage';

export default function Page() {
  return <SearchResultsPage />;
}
