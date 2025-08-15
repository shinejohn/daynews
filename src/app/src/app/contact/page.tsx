// SSG Configuration

export const revalidate = false;

import { ContactUsPage } from '@/components/contact/ContactUsPage';

// Rendering strategy: SSG

export const metadata = {
  title: 'Contact | DayNews',
  description: 'Contact - Your trusted local news source',
};
export const revalidate = 86400; // Static content

export default function Page() {
  return <ContactUsPage />;
}