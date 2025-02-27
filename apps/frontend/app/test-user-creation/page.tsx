'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useEnsureSupabaseUser } from '../hooks/useEnsureSupabaseUser';

export default function TestUserCreationPage() {
  const { userId } = useAuth();
  const {
    supabaseUser,
    isLoading: isEnsuring,
    error: ensureError,
  } = useEnsureSupabaseUser();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testUserCreation = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Client: Calling test-user-creation endpoint');
      const response = await fetch('/api/auth/test-user-creation');
      const data = await response.json();
      console.log('✅ Client: Received response:', data);
      setResult(data);
    } catch (err) {
      console.error('❌ Client: Error testing user creation:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test User Creation</h1>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="mb-2">
          <strong>Clerk User ID:</strong> {userId || 'Not authenticated'}
        </p>

        <div className="mt-4">
          <h3 className="font-semibold">Automatic User Creation Status:</h3>
          {isEnsuring ? (
            <p>Checking/creating user...</p>
          ) : ensureError ? (
            <p className="text-red-600">Error: {ensureError}</p>
          ) : supabaseUser ? (
            <div>
              <p className="text-green-600">User exists in Supabase!</p>
              <pre className="p-2 bg-gray-200 rounded mt-2 text-xs overflow-auto">
                {JSON.stringify(supabaseUser, null, 2)}
              </pre>
            </div>
          ) : (
            <p>No Supabase user found</p>
          )}
        </div>
      </div>

      <button
        onClick={testUserCreation}
        disabled={loading || !userId}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {loading ? 'Testing...' : 'Test Manual User Creation in Supabase'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Manual Test Result:</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-bold mb-2">How This Works:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            This page automatically attempts to ensure a Supabase user exists
            using the <code>useEnsureSupabaseUser</code> hook
          </li>
          <li>
            The hook calls the <code>/api/auth/get-user</code> endpoint which
            will create a user if one doesn't exist
          </li>
          <li>
            You can also manually trigger user creation by clicking the button
          </li>
          <li>
            The manual test calls <code>/api/auth/test-user-creation</code>{' '}
            which independently checks/creates users
          </li>
        </ol>
      </div>
    </div>
  );
}
