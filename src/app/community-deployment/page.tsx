// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import CommunityDeploymentWizard from '@/components/admin/CommunityDeploymentWizard';

export default function Page() {
  return <CommunityDeploymentWizard />;
}
