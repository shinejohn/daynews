// ISR Configuration



// import { BusinessProfileCreator } from '@/components/BusinessProfileCreator'; // Component not found

// Rendering strategy: ISR

export const metadata = {
  title: 'Create | DayNews',
  description: 'Create - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <div>TODO: BusinessProfileCreator</div>;
}
