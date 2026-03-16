import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LeadData {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  followUpDate?: string | null;
  previousCallDate?: string | null;
  createdAt: string;
  managerName?: string | null;
  notes?: { note: string } | null;
}

interface AdvisorWiseLeadsResponse {
  success: boolean;
  message: string;
  data: {
    leads: LeadData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PaginatedLeadsResponse {
  leads: LeadData[];
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

export const leadService = {
  async fetchAdvisorLeads(
    advisorId: number,
    options?: {
      page?: number;
      limit?: number;
      timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom';
      startDate?: string;
      endDate?: string;
      followUpTimeframe?: string;
      showOverdueOnly?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedLeadsResponse> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();

    const body: {
      page?: number;
      limit?: number;
      timeframe?: string;
      startDate?: string;
      endDate?: string;
      followUpTimeframe?: string;
      showOverdueOnly?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {};
    if (options?.page) body.page = options.page;
    if (options?.limit) body.limit = options.limit;
    if (options?.timeframe) body.timeframe = options.timeframe;
    if (options?.startDate) body.startDate = options.startDate;
    if (options?.endDate) body.endDate = options.endDate;
    if (options?.followUpTimeframe) body.followUpTimeframe = options.followUpTimeframe;
    if (options?.showOverdueOnly !== undefined) body.showOverdueOnly = options.showOverdueOnly;
    if (options?.search) body.search = options.search;
    if (options?.sortBy) body.sortBy = options.sortBy;
    if (options?.sortOrder) body.sortOrder = options.sortOrder;

    const listUrl = `${API_URL}/referrals/advisor-wise-leads/${advisorId}`;

    console.log('Fetching leads from:', listUrl, 'with body:', body);

    const listResponse = await fetch(listUrl, { 
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch leads: ${listResponse.status} ${listResponse.statusText}`);
    }

    const result: AdvisorWiseLeadsResponse = await listResponse.json();
    console.log('API Response:', result);
    
    if (!result.data || !result.data.leads) {
      console.error('Invalid API response structure:', result);
      throw new Error('Invalid API response: missing data.leads');
    }

    const leads: LeadData[] = result.data.leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      mobileNumber: lead.mobileNumber,
      followUpDate: lead.followUpDate,
      previousCallDate: lead.previousCallDate,
      createdAt: lead.createdAt,
      managerName: lead.managerName || null,
      notes: lead.notes || null,
    }));

    console.log(`Fetched ${leads.length} leads (page ${result.data.pagination.page}/${result.data.pagination.totalPages})`);

    return {
      leads,
      pagination: result.data.pagination,
    };
  },

  async updateLeadFollowUpDate(
    leadId: number,
    followUpDate: string
  ): Promise<{ success: boolean; message: string }> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();
    const updateUrl = `${API_URL}/referrals/update-lead-follow-up-date/${leadId}`;

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

  async updateLeadPreviousCallDate(
    leadId: number,
    previousCallDate: string
  ): Promise<{ success: boolean; message: string }> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();
    const updateUrl = `${API_URL}/referrals/update-lead-previous-call-date/${leadId}`;

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

  async updateLeadNotes(
    leadId: number,
    note: string
  ): Promise<{ success: boolean; message: string }> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const headers = getHeaders();
    const updateUrl = `${API_URL}/referrals/update-lead-notes/${leadId}`;

    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update notes: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },
};
