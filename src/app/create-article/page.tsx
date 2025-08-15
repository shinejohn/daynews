// ISR Configuration



// import { CreateArticlePage } from '@/components/CreateArticlePage'; // Component not found

// Rendering strategy: ISR

export const metadata = {
  title: 'Create article | DayNews',
  description: 'Create article - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <div>TODO: CreateArticlePage</div>;
}
