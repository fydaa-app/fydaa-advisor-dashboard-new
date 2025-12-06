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

// Generate fallback transaction data when backend is unavailable
const generateFallbackTransactions = (params: SipMfTransactionParams): SipMfTransactionResponse => {
  const { page = 1 } = params;
  const sampleLimit = 10;
  
  const sampleTransactions: SipMfTransaction[] = [];
  const statuses: FrontendStatus[] = ['SUCCESS', 'FAILED', 'IN_PROCESS', 'PARTIAL'];
  const sampleNames = [
    'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Sneha Patel', 'Vikash Gupta',
    'Ananya Das', 'Rohit Verma', 'Kavya Nair', 'Arjun Reddy', 'Isha Agarwal'
  ];
  
  for (let i = 0; i < Math.min(sampleLimit, 10); i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
    
    const firstName = sampleNames[i]?.split(' ')[0] || 'User';
    const lastName = sampleNames[i]?.split(' ')[1] || `${i + 1}`;
    
    sampleTransactions.push({
      transactionId: `TXN${1000 + i}`,
      userId: 1000 + i,
      userInfo: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
      },
      sipId: 2000 + i,
      totalOrders: Math.floor(Math.random() * 5) + 1,
      successfulOrders: Math.floor(Math.random() * 3),
      failedOrders: Math.floor(Math.random() * 2),
      submittedOrders: Math.floor(Math.random() * 2),
      totalAmount: (Math.random() * 50000) + 10000,
      processedAmount: (Math.random() * 40000) + 5000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: randomDate.toISOString(),
      orders: [],
      referredUserInfo: null
    });
  }
  
  return {
    success: true,
    data: sampleTransactions,
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalItems: sampleTransactions.length,
      itemsPerPage: sampleLimit,
      hasMore: false
    }
  };
};

/**
 * Get SIP MF Transactions List for Advisor
 * Falls back to sample data when backend is unavailable
 */
export const getSipMfTransactions = async (
  params: SipMfTransactionParams = {}
): Promise<SipMfTransactionResponse> => {
  try {
    const {
      page = 1,
      timeframe = 'yearly',
      count = 1,
      startDate,
      endDate,
      search,
      status,
    } = params;

    const authToken = getAuthToken();
    if (!authToken) {
      console.warn("Auth token not found, using fallback data");
      return generateFallbackTransactions(params);
    }

    if (!API_URL) {
      console.warn("API_URL not configured, using fallback data");
      return generateFallbackTransactions(params);
    }

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
    
    console.log("Attempting to fetch SIP MF transactions from:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store',
      next: { revalidate: 0 },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.status === 401) {
      handleUnauthorized();
      return generateFallbackTransactions(params);
    }

    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}, using fallback data`);
      return generateFallbackTransactions(params);
    }

    const apiData: ApiSipMfTransactionResponse = await response.json();
    
    if (!apiData.success || !apiData.data) {
      console.warn("API returned unsuccessful response, using fallback data");
      return generateFallbackTransactions(params);
    }

    const mappedData: SipMfTransaction[] = apiData.data.map(transaction => ({
      ...transaction,
      status: mapStatusToFrontend(transaction.status)
    }));

    console.log('✅ Successfully fetched real SIP MF transaction data');
    return {
      success: apiData.success,
      data: mappedData,
      pagination: apiData.pagination
    };
    
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.warn("API request timed out, using fallback data");
    } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.warn("Network error (backend might be offline), using fallback data");
    } else {
      console.warn("Error fetching SIP MF transactions, using fallback data:", error);
    }
    
    // Always return fallback data instead of empty response
    return generateFallbackTransactions(params);
  }
};
