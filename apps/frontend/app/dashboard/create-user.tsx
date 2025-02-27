'use client';

import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useState } from "react";

export default function CreateUserButton() {
  const { user } = useClerkUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a user record",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: user.fullName || user.username || 'New User',
          email: user.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "Your user record has been created in the database.",
      });

      console.log('✅ User created successfully:', data);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">User Record Issue</h2>
      <p className="text-sm text-gray-600 mb-4">
        Your user record wasn't created in the database. Click the button below to create it now.
      </p>
      <Button 
        onClick={createUser} 
        disabled={isLoading}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
      >
        {isLoading ? "Creating..." : "Create User Record"}
 