export type CustomerName = 'Acme Corp' | 'TechStart Inc' | 'Global Solutions';

export interface CustomerData {
  stripeId: string;
  quickbooksId: string;
}

export const customerMapping: Record<CustomerName, CustomerData> = {
  'Acme Corp': {
    stripeId: 'cus_Ro0o3CrfJAD7Um',
    quickbooksId: '' // We'll add this once QuickBooks is set up
  },
  'TechStart Inc': {
    stripeId: 'cus_Ro0ot68z19xML8',
    quickbooksId: ''
  },
  'Global Solutions': {
    stripeId: 'cus_Ro0oeEIOfynhS0',
    quickbooksId: ''
  }
}; 