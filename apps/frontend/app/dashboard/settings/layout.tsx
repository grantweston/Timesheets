import { headers } from 'next/headers';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Handle headers here in the server component
  await headers();
  
  return <>{children}</>;
} 