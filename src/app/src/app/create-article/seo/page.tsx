// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { ArticleSeoPage } from '@/components/ArticleSeoPage';

export default function Page() {
  return <ArticleSeoPage />;
}