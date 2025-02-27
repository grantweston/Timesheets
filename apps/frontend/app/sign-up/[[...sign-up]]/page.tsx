'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Component to handle post-signup redirection
function RedirectionHandler() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run this effect when auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn || !userId) return;

    console.log(
      '✅ SignUp: User is signed in with Clerk, redirecting to homepage'
    );

    // Redirect to dashboard or home page after successful signup
    router.push('/');
  }, [userId, isLoaded, isSignedIn, router]);

  // This component doesn't render anything
  return null;
}

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
      <RedirectionHandler />
    </div>
  );
}
