// ISR Configuration



import { AIAgentControl } from '@/components/admin/AIAgentControl';

// Rendering strategy: ISR

export const metadata = {
  title: 'Ai agent control | DayNews',
  description: 'Ai agent control - Your trusted local news source',
};
export const revalidate = 300; // ISR - updates every 5 minutes

export default function Page() {
  return <AIAgentControl />;
}