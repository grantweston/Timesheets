import { headers } from 'next/headers';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get headers and use them to ensure proper dynamic behavior
  const headersList = await headers();
  const host = headersList.get('host');
  
  return <>{children}</>;
} 