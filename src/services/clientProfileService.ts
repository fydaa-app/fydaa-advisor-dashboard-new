import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ClientProfileData {
  userDetails: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    callingCode: string;
    panStatus: string;
    fromApp: string;
    total_investment: number;
    current_balance: number;
    main_subscription_status: number;
    subscription_date: string;
    dob: string;
    gender: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
    address: {
      addressLine1: string;
      addressLine2: string;
    };
    userGoal: {
      sipAmount: number;
      goalAmount: number;
      timePeriod: number;
      interestRate: number;
    };
    createdAt: string;
  };
  portfolioDetails: Array<{
    portfolioId: number;
    portfolioName: string;
    currentValue: number;
    unrealizedReturn: number;
    realizedReturn: number;
    totalProfit: number;
    totalInvestedValue: number;
  }>;
  userTransactionDetails: Array<{
    transactionId: string;
    orderType: string;
    portfolioId: number;
    totalAmount: number;
    totalTradeQty: number;
    createdAt: string;
  }>;
  relationshipManager: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
  };
  advisor: {
    id: number;
    name: string;
    email: string;
    mobile: string;
  };
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = getCookie('authToken');
    if (typeof token === 'string') return token;
  }
  return null;
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const clientProfileService = {
  async fetchClientProfile(clientId: number): Promise<ClientProfileData> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();
    const url = `${API_URL}/referrals/view-user/${clientId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch client profile: ${response.status} ${response.statusText}`);
    }

    const data: ClientProfileData = await response.json();
    return data;
  },
};
