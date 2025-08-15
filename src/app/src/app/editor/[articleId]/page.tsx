// ISR Configuration



import EditorPage from '@/components/pages/EditorPage';

// Rendering strategy: ISR

export const metadata = {
  title: '[articleId] | DayNews',
  description: '[articleId] - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <EditorPage />;
}