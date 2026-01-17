import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ClientData {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobileNumber: string;
  fromApp?: string;
  total_investment: number;
  createdAt: string;
  hasSIP: number;
  followUpDate?: string | null;
  previousCallDate?: string | null;
}

interface AdvisorWiseUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: Array<{
      id: number;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      mobileNumber: string;
      fromApp?: string;
      total_investment: number;
      createdAt: string;
      hasSIP: number;
      followUpDate?: string | null;
      previousCallDate?: string | null;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    filters: {
      type?: string;
      timeframe?: string;
    };
  };
}

export interface PaginatedClientsResponse {
  clients: ClientData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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

export const clientService = {
  async fetchAdvisorClients(
    advisorId: number,
    options?: {
      appType?: 'savestment' | 'fydaa';
      page?: number;
      limit?: number;
      timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom';
      startDate?: string;
      endDate?: string;
      followUpTimeframe?: string;
    }
  ): Promise<PaginatedClientsResponse> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();

    // Build request body
    const body: {
      type?: string;
      page?: number;
      limit?: number;
      timeframe?: string;
      startDate?: string;
      endDate?: string;
      followUpTimeframe?: string;
    } = {};
    if (options?.appType) body.type = options.appType.toLowerCase();
    if (options?.page) body.page = options.page;
    if (options?.limit) body.limit = options.limit;
    if (options?.timeframe) body.timeframe = options.timeframe;
    if (options?.startDate) body.startDate = options.startDate;
    if (options?.endDate) body.endDate = options.endDate;
    if (options?.followUpTimeframe) body.followUpTimeframe = options.followUpTimeframe;

    const listUrl = `${API_URL}/referrals/advisor-wise-users/${advisorId}`;

    console.log('Fetching clients from:', listUrl, 'with body:', body);

    const listResponse = await fetch(listUrl, { 
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to fetch clients: ${listResponse.status} ${listResponse.statusText}`);
    }

    const result: AdvisorWiseUsersResponse = await listResponse.json();

    // Map users to ClientData format
    const clients: ClientData[] = result.data.users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      fromApp: user.fromApp,
      total_investment: user.total_investment,
      createdAt: user.createdAt,
      hasSIP: user.hasSIP,
      followUpDate: user.followUpDate,
      previousCallDate: user.previousCallDate,
    }));

    console.log(`Fetched ${clients.length} clients (page ${result.data.pagination.page}/${result.data.pagination.totalPages})`);

    return {
      clients,
      pagination: result.data.pagination,
    };
  },

  async updateClientFollowUpDate(
    clientId: number,
    followUpDate: string
  ): Promise<{ success: boolean; message: string }> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();
    const updateUrl = `${API_URL}/referrals/update-follow-up-date/${clientId}`;

    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ followUpDate }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update follow-up date: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },

  async updateClientPreviousCallDate(
    clientId: number,
    previousCallDate: string
  ): Promise<{ success: boolean; message: string }> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();
    const updateUrl = `${API_URL}/referrals/update-previous-call-date/${clientId}`;

    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ previousCallDate }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update previous call date: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },
};
