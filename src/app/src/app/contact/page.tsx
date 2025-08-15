// SSG Configuration
export const dynamic = 'force-static';
export const revalidate = false;

import { ContactUsPage } from '@/components/contact/ContactUsPage';

export default function Page() {
  return <ContactUsPage />;
}