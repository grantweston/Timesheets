'use client';

import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useToast } from '@/app/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useUser } from '@clerk/nextjs';
import {
  Loader2,
  Download,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Progress } from '@/app/components/ui/progress';

// Create Supabase client once (only for realtime, not auth)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TEST_USER_ID = 'fe20476b-c6fc-4949-b37d-ecaeaad40514';

const steps = [
  {
    title: 'Download',
    description: 'Download the TimeTrack AI desktop app',
  },
  {
    title: 'Install',
    description: 'Run the installer on your computer',
  },
  {
    title: 'Connect',
    description: 'Link the app to your account',
  },
];

export default function DesktopPage() {
  const { toast } = useToast();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to sign in if no user
    if (isUserLoaded && !user) {
      window.location.href = '/auth/signin';
    }
  }, [isUserLoaded, user]);

  useEffect(() => {
    console.log('Current step changed to:', currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (!pairingCode) {
      console.log('No pairing code yet, skipping subscription setup');
      return;
    }

    console.log('Setting up Supabase subscription for code:', pairingCode);

    // Subscribe to ALL database changes
    const allChangesChannel = supabase
      .channel('any_changes')
      .on('system', { event: '*' }, (e: any) => {
        console.log('🔌 System event:', e);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload) => {
          console.log('🌍 DEBUG: Received INSERT:', payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
        },
        (payload) => {
          console.log('🌍 DEBUG: Received UPDATE:', payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
        },
        (payload) => {
          console.log('🌍 DEBUG: Received DELETE:', payload);
        }
      )
      .subscribe((status, err) => {
        console.log('🌍 General subscription status:', status, err || '');
        if (err) {
          console.error('Subscription error:', err);
        }
      });

    // Log the Supabase connection state
    console.log('Supabase client state:', {
      realtime: supabase.realtime.connectionState,
      channels: supabase.getChannels(),
    });

    // Subscribe to specific code changes - no filter, we'll do it in the callback
    const channel = supabase
      .channel('pairing_status')
      .on('system', { event: '*' }, (e: any) => {
        console.log('🔌 Pairing channel system event:', e);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'link_codes',
        },
        (payload) => {
          console.log('🔍 DEBUG: Received link_codes INSERT:', {
            code: payload.new?.code,
            matches: payload.new?.code === pairingCode,
            pairingCode,
            payload,
          });
          handleCodeMatch(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'link_codes',
        },
        (payload) => {
          console.log('🔍 DEBUG: Received link_codes UPDATE:', {
            code: payload.new?.code,
            matches: payload.new?.code === pairingCode,
            pairingCode,
            payload,
          });
          handleCodeMatch(payload);
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status);
        if (status === 'SUBSCRIBED') {
          // Query to check what rows exist with our code
          supabase
            .from('link_codes')
            .select('code, used')
            .eq('code', pairingCode)
            .then((result) => {
              console.log('🔎 Current rows with this code:', result);
            });

          console.log(
            '✅ Subscribed to link_codes INSERT and UPDATE events. Will filter for:',
            pairingCode
          );
        }
      });

    // Helper function to handle code matches
    const handleCodeMatch = (payload: any) => {
      if (payload.new?.code === pairingCode) {
        console.log('✅ Found matching code!');

        if (
          payload.new.used === true ||
          payload.new.used === 'TRUE' ||
          payload.new.used === 't'
        ) {
          console.log('Code marked as used, updating UI...');
          setIsVerifying(false);
          setIsVerified(true);
          toast({
            title: 'Success!',
            description: 'Desktop app connected successfully.',
          });
        }
      }
    };

    // Cleanup subscription when component unmounts or code changes
    return () => {
      console.log('Cleaning up Supabase subscriptions');
      channel.unsubscribe();
      allChangesChannel.unsubscribe();
    };
  }, [pairingCode, toast]);

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setDownloadProgress(i);
    }
    setIsDownloading(false);
    console.log('Download complete, setting step to 1');
    setCurrentStep(1);
    toast({
      title: 'Download complete',
      description: 'Please run the installer to continue.',
    });
  };

  const generatePairingCode = async () => {
    console.log('generatePairingCode called with user state:', {
      isUserLoaded,
      hasUser: !!user,
      userId: user?.id,
    });

    if (!isUserLoaded) {
      console.log('Blocking due to user loading');
      toast({
        title: 'Please wait',
        description: 'Still initializing...',
        variant: 'default',
      });
      return;
    }

    if (!user) {
      console.log('Blocking due to missing user');
      toast({
        title: 'Error',
        description: 'Please log in to generate a pairing code.',
        variant: 'destructive',
      });
      return;
    }

    console.log('User validated, proceeding with code generation');
    try {
      console.log('Making API request with user_id:', TEST_USER_ID);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Try to get auth token if the method exists
      try {
        // @ts-ignore - Ignoring type check as we're doing a runtime check
        if (typeof user.getToken === 'function') {
          // @ts-ignore
          const token = await user.getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.log('Could not get auth token:', e);
      }

      // Add fallback URL if primary fails
      const primaryUrl =
        'https://zdaugjexoekzsjxrelee.supabase.co/functions/v1/generate-link-code';
      const fallbackUrl =
        process.env.NEXT_PUBLIC_GENERATE_LINK_CODE_URL || primaryUrl;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Try with primary URL
      let response;
      try {
        console.log('Attempting with primary URL:', primaryUrl);
        response = await fetch(primaryUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: TEST_USER_ID,
          }),
          signal: controller.signal,
        });
      } catch (primaryError) {
        console.error('Primary URL fetch failed:', primaryError);

        // Try fallback URL if different from primary
        if (fallbackUrl !== primaryUrl) {
          console.log('Attempting with fallback URL:', fallbackUrl);
          response = await fetch(fallbackUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              user_id: TEST_USER_ID,
            }),
          });
        } else {
          throw primaryError;
        }
      }

      clearTimeout(timeoutId);

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response data:', errorData);
        console.error('Full response:', response);
        console.error('Status:', response.status, response.statusText);

        // Try to read response text if json parsing failed
        if (!errorData) {
          const text = await response
            .text()
            .catch(() => 'Could not read response text');
          console.error('Response text:', text);
        }

        throw new Error(
          errorData?.error || `Failed to generate code (${response.status})`
        );
      }

      const data = await response.json();
      console.log('Successful response data:', data);
      const { code } = data;

      console.log('Setting code and updating state:', code);
      setPairingCode(code);
      setIsVerifying(true);
      toast({
        title: 'Pairing code generated',
        description: `Your code is: ${code}`,
      });
      console.log('Setting current step to 2');
      setCurrentStep(2);
    } catch (error) {
      console.error('Detailed error in generatePairingCode:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to generate pairing code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <Card
              className={`p-8 ${
                currentStep === index ? 'ring-2 ring-primary' : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                  {currentStep > index ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span className="text-lg font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {index === 0 && currentStep === 0 && (
                    <div className="space-y-4">
                      {isDownloading ? (
                        <div className="space-y-3">
                          <Progress
                            value={downloadProgress}
                            className="w-full h-2"
                          />
                          <p className="text-sm text-muted-foreground">
                            Downloading... {downloadProgress}%
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            onClick={handleDownload}
                            size="lg"
                            className="gap-2 w-full sm:w-auto"
                          >
                            <Download className="h-5 w-5" />
                            Download for macOS
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 w-full sm:w-auto"
                          >
                            <Download className="h-5 w-5" />
                            Download for Windows
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {index === 1 && currentStep === 1 && (
                    <div className="space-y-6">
                      <Alert className="bg-muted">
                        <Monitor className="h-5 w-5" />
                        <AlertTitle className="text-base font-medium">
                          Installation Instructions
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                          <p>1. Open the downloaded file</p>
                          <p>2. Follow the installation wizard</p>
                          <p>3. Grant necessary permissions when prompted</p>
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => {
                          console.log('Button clicked!');
                          console.log('Current step:', currentStep);
                          console.log('Current index:', index);
                          console.log('Attempting to generate pairing code...');
                          generatePairingCode();
                        }}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        I've installed the app
                      </Button>
                    </div>
                  )}

                  {index === 2 && currentStep === 2 && (
                    <div className="space-y-6">
                      {pairingCode && (
                        <Alert className="bg-muted border-primary/20">
                          <AlertTitle className="text-2xl font-mono tracking-wider text-center py-2">
                            {pairingCode}
                          </AlertTitle>
                          <AlertDescription className="text-center text-muted-foreground">
                            Enter this code in your desktop app to connect it to
                            your account
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        onClick={generatePairingCode}
                        disabled={isVerifying || isVerified}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : isVerified ? (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Connected!
                          </>
                        ) : (
                          'Verify Connection'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
