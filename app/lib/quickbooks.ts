import OAuthClient from 'node-quickbooks';

export const quickbooks = new OAuthClient({
  clientId: process.env.QUICKBOOKS_CLIENT_ID!,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
  environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI!,
});

export const getQuickBooksClient = (realmId: string, accessToken: string) => {
  return new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI!,
    accessToken,
    realmId,
  });
}; 