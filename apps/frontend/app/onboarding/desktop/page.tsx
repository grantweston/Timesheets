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
    if (!pairingCode) return;

    // Subscribe to changes in the link_codes table
    const channel = supabase
      .channel('pairing_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'link_codes',
          filter: `code=eq.${pairingCode}`,
        },
        async (
          payload: RealtimePostgresChangesPayload<{
            link_code_id: string;
            user_id: string;
            device_id: string | null;
            code: string;
            used: boolean;
            expires_at: string;
            created_at: string;
            updated_at: string;
          }>
        ) => {
          console.log('Received real-time update:', payload);

          if (payload.eventType === 'UPDATE' && payload.new.used === true) {
            // Code was marked as used - device successfully paired
            setIsVerifying(false);
            setIsVerified(true);
            toast({
              title: 'Success!',
              description: 'Desktop app connected successfully.',
            });

            // Cleanup subscription
            channel.unsubscribe();
          }
        }
      )
      .subscribe();

    // Cleanup subscription when component unmounts or code changes
    return () => {
      channel.unsubscribe();
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
      const testUserId = 'fe20476b-c6fc-4949-b37d-ecaeaad40514';
      console.log('Making API request with user_id:', testUserId);
      const response = await fetch(
        'https://zdaugjexoekzsjxrelee.supabase.co/functions/v1/generate-link-code',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: testUserId,
          }),
        }
      );

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response data:', errorData);
        throw new Error(errorData?.error || 'Failed to generate code');
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
