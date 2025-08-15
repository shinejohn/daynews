// ISR Configuration



import { CommunityDeploymentWizard } from '@/components/admin/CommunityDeploymentWizard';

// Rendering strategy: ISR

export const metadata = {
  title: 'Community deployment | DayNews',
  description: 'Community deployment - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <CommunityDeploymentWizard />;
}