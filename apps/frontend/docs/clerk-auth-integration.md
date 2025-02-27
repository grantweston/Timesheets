# Clerk Authentication Integration with Supabase

This document outlines how Clerk authentication is integrated with Supabase user management in our application.

## Overview

Our application uses [Clerk](https://clerk.dev/) for authentication and [Supabase](https://supabase.com/) for database operations. For each user that signs up with Clerk, we need to create a corresponding user record in our Supabase database.

## Implementation

We've implemented two mechanisms to ensure Supabase users are created:

### 1. Primary Method: Clerk Webhooks

The primary method for user creation is through Clerk webhooks. When a user is created or updated in Clerk, a webhook event is sent to our application, which then creates or updates the corresponding user in Supabase.

The webhook handler is implemented at:

```
apps/frontend/app/api/webhooks/clerk/route.ts
```

The webhook handles the following events:

- `user.created`: Creates a new user in Supabase
- `user.updated`: Updates user information in Supabase

#### Webhook Setup Requirements

1. Set up a webhook in the Clerk Dashboard with the following events:

   - `user.created`
   - `user.updated`

2. Set the webhook URL to:

   ```
   https://your-domain.com/api/webhooks/clerk
   ```

3. Add the webhook secret to your environment variables:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

### 2. Fallback Method: Runtime User Creation

As a fallback, we also check for and create users at runtime through:

1. **UserProvider Component**:

   - Located at `apps/frontend/app/providers/user-provider.tsx`
   - Checks if a Supabase user exists for the current Clerk user when the app loads
   - Creates a user if one doesn't exist

2. **useEnsureSupabaseUser Hook**:
   - Located at `apps/frontend/app/hooks/useEnsureSupabaseUser.ts`
   - Can be used in any component to ensure a user exists

## User Data Mapping

When creating a Supabase user from Clerk, we map the following data:

| Clerk Field            | Supabase Field  |
| ---------------------- | --------------- |
| `id`                   | `clerk_user_id` |
| Primary Email          | `email`         |
| First Name + Last Name | `display_name`  |

## Troubleshooting

If users are not being created in Supabase, check:

1. Webhook logs in the Clerk Dashboard
2. Server logs for errors in webhook processing
3. Network requests to `/api/auth/get-user` endpoint
4. Check if the `CLERK_WEBHOOK_SECRET` environment variable is set correctly

## Testing

To test the integration:

1. Create a new user in Clerk
2. Check the server logs for webhook events
3. Verify that a corresponding user is created in Supabase
4. You can also visit `/test-user-creation` after logging in to manually trigger user creation
