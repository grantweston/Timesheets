'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Component to handle post-signup user creation
function UserCreationHandler() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run this effect when auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn || !userId) return;

    console.log(
      '🔍 SignUp: User is signed in with Clerk, creating user in Supabase'
    );

    const createUser = async () => {
      try {
        console.log('🔍 SignUp: Calling create-user API');
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Add any additional user data you want to store
          }),
        });

        const data = await response.json();
        console.log('✅ SignUp: User creation response:', data);

        // Redirect to dashboard or home page after successful user creation
        router.push('/');
      } catch (error) {
        console.error('❌ SignUp: Error creating user:', error);
        // You might want to show an error message to the user
      }
    };

    createUser();
  }, [userId, isLoaded, isSignedIn, router]);

  // This component doesn't render anything
  return null;
}

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
      <UserCreationHandler />
    </div>
  );
}
