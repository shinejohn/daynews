// ISR Configuration
export const revalidate = 60; // seconds
export const dynamic = 'force-static';

import ContactUsPage from '@/components/contact/ContactUsPage';

export default function Page() {
  return <ContactUsPage />;
}
