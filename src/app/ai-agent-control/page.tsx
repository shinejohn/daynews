// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import { AIAgentControl } from '@/components/admin/AIAgentControl';

export default function Page() {
  return <AIAgentControl />;
}
