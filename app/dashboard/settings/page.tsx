'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@/app/hooks/use-user";
import { useSupabase } from "@/app/providers/supabase-provider";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";

export default function SettingsPage() {
  console.log('=== SETTINGS PAGE RENDER START ===');
  const { user, loading, error } = useUser();
  const { user: clerkUser } = useClerkUser();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  console.log('Settings Page State:', {
    hasUser: !!user,
    userDetails: user ? {
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      display_name: user.display_name,
      hasIntegrationStatuses: !!user.integration_statuses
    } : null,
    hasClerkUser: !!clerkUser,
    clerkUserDetails: clerkUser ? {
      id: clerkUser.id,
      emailAddresses: clerkUser.emailAddresses?.length,
      primaryEmailId: clerkUser.primaryEmailAddressId
    } : null,
    isLoading: loading,
    hasError: !!error,
    errorDetails: error,
    isUpdating
  });

  // Get email accounts from Clerk
  const connectedEmails = clerkUser?.emailAddresses || [];
  console.log('Connected Email Accounts:', {
    total: connectedEmails.length,
    addresses: connectedEmails.map(email => ({
      id: email.id,
      address: email.emailAddress,
      verified: email.verification.status === "verified"
    }))
  });

  const hasGmail = connectedEmails.some(email => email.emailAddress.endsWith('@gmail.com'));
  const hasOutlook = connectedEmails.some(email => 
    email.emailAddress.endsWith('@outlook.com') || 
    email.emailAddress.endsWith('@hotmail.com') || 
    email.emailAddress.endsWith('@live.com')
  );

  console.log('Email Provider Status:', { hasGmail, hasOutlook });

  const handleIntegrationClick = async (integrationKey: string, isConnected: boolean) => {
    console.log('Integration Click:', {
      key: integrationKey,
      isConnected,
      timestamp: new Date().toISOString()
    });
    // ... existing code ...
  };

  if (loading) {
    console.log('Settings Page: Loading State');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    console.log('Settings Page: Error State', { error });
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-red-500">Error loading user data: {error}</div>
        <Button 
          onClick={() => router.refresh()}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  console.log('=== SETTINGS PAGE RENDER COMPLETE ===');
  // ... existing code ...
} 