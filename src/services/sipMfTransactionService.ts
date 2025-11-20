import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get token from cookies
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('authToken=')
    );
    return authCookie ? authCookie.split('=')[1] : null;
  }
  return null;
};

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

// API status type (what backend sends)
type ApiStatus = 'IN_PROCESS' | 'FAILED' | 'PARTIALLY_SUCCESSFUL' | 'FULLY_SUCCESSFUL';

// Frontend status type (what we display)
export type FrontendStatus = 'IN_PROCESS' | 'FAILED' | 'PARTIAL' | 'SUCCESS';

// Map API status to frontend status
const mapStatusToFrontend = (apiStatus: ApiStatus): FrontendStatus => {
  switch (apiStatus) {
    case 'FULLY_SUCCESSFUL':
      return 'SUCCESS';
    case 'PARTIALLY_SUCCESSFUL':
      return 'PARTIAL';
    case 'FAILED':
      return 'FAILED';
    case 'IN_PROCESS':
      return 'IN_PROCESS';
    default:
      return 'IN_PROCESS';
  }
};

// Map frontend status to API status (for filtering)
const mapStatusToApi = (frontendStatus: FrontendStatus | 'all'): ApiStatus | undefined => {
  if (frontendStatus === 'all') return undefined;
  
  switch (frontendStatus) {
    case 'SUCCESS':
      return 'FULLY_SUCCESSFUL';
    case 'PARTIAL':
      return 'PARTIALLY_SUCCESSFUL';
    case 'FAILED':
      return 'FAILED';
    case 'IN_PROCESS':
      return 'IN_PROCESS';
    default:
      return undefined;
  }
};

export interface SipOrder {
  id: number;
  scheme: string;
  schemeName: string;
  state: 'submitted' | 'failed' | 'successful';
  amount: number;
  processed_amount: number;
  failure_code: string | null;
  last_error: string | null;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ReferredUserInfo {
  id: number;
  mobileNumber: string;
  firstName: string;
  lastName: string;
}

// API Response type (what backend sends)
interface ApiSipMfTransaction {
  transactionId: string;
  userId: number;
  userInfo: UserInfo;
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: ApiStatus;
  createdAt: string;
  orders: SipOrder[];
  referredUserInfo: ReferredUserInfo | null;
}

// Frontend type (what we use in components)
export interface SipMfTransaction {
  transactionId: string;
  userId: number;
  userInfo: UserInfo;
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: FrontendStatus;
  createdAt: string;
  orders: SipOrder[];
  referredUserInfo: ReferredUserInfo | null;
}

export interface SipMfTransactionParams {
  page?: number;
  limit?: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom';
  count?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  status?: FrontendStatus | 'all';
}

interface ApiSipMfTransactionResponse {
  success: boolean;
  data: ApiSipMfTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

export interface SipMfTransactionResponse {
  success: boolean;
  data: SipMfTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Get SIP MF Transactions List for Advisor
 */
export const getSipMfTransactions = async (
  params: SipMfTransactionParams = {}
): Promise<SipMfTransactionResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      timeframe = 'yearly',
      count = 1,
      startDate,
      endDate,
      search,
      status,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('timeframe', timeframe);
    queryParams.append('count', count.toString());
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (search) queryParams.append('search', search);
    
    const apiStatus = status ? mapStatusToApi(status) : undefined;
    if (apiStatus) queryParams.append('reportType', apiStatus);

    queryParams.append('_t', Date.now().toString());

    const url = `${API_URL}/referrals/transactions-list-sip-mf-advisor?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken() || ""}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (response.status === 401) {
      handleUnauthorized();
      return {
        success: false,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit,
          hasMore: false,
        },
      };
    }

    if (!response.ok) {
      throw new Error("Failed to fetch SIP MF transactions");
    }

    const apiData: ApiSipMfTransactionResponse = await response.json();
    
    const mappedData: SipMfTransaction[] = apiData.data.map(transaction => ({
      ...transaction,
      status: mapStatusToFrontend(transaction.status)
    }));

    return {
      success: apiData.success,
      data: mappedData,
      pagination: apiData.pagination
    };
  } catch (error) {
    console.error("Failed to fetch SIP MF transactions:", error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: params.limit || 10,
        hasMore: false,
      },
    };
  }
};
