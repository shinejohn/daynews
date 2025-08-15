// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import EditorPage from '@/components/pages/EditorPage';

export default function Page() {
  return <EditorPage />;
}