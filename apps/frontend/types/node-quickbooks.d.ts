declare module 'node-quickbooks' {
  interface OAuthClientConfig {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
    redirectUri: string;
    accessToken?: string;
    realmId?: string;
  }

  interface OAuthToken {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }

  class OAuthClient {
    constructor(config: OAuthClientConfig);
    createToken(code: string): Promise<OAuthToken>;
    refreshToken(refreshToken: string): Promise<OAuthToken>;
    createInvoice(invoice: any): Promise<any>;
    getInvoice(id: string): Promise<any>;
    updateInvoice(invoice: any): Promise<any>;
    sendInvoice(invoiceId: string): Promise<any>;
  }

  export default OAuthClient;
} 