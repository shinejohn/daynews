// ISR Configuration



// import { AuthorProfilePage } from '@/components/AuthorProfilePage'; // Component not found

// Rendering strategy: DYNAMICWITHPARAMS

export const metadata = {
  title: '[authorId] | DayNews',
  description: '[authorId] - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <div>TODO: AuthorProfilePage</div>;
}
