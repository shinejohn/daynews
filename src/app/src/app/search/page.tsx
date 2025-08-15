'use client';

import { SearchResultsPage } from '@/components/search/SearchResultsPage';

// Rendering strategy: DYNAMIC
export const dynamic = 'force-dynamic';

export default function Page() {
  return <SearchResultsPage />;
}