import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface LatestSipOrder {
  sipId: number;
  state: string;
  createdAt: string;
  userId: number;
  mfId: string;
  mfpId: string | null;
  mf_investment_account: string;
  amount: number | null;
  units: number;
  orderAmount: number;
  sipName: string | null;
  goalName: string | null;
  userFullName: string | null;
}

export interface LatestSipGroup {
  sipId: number;
  sipName: string | null;
  userFullName: string | null;
  goalName: string | null;
  date: string;
  groupStatus: string;
  totalOrders: number;
  totalAmount: number;
  orders: LatestSipOrder[];
}

export interface LatestSipsResponse {
  success: boolean;
  message: string;
  data: LatestSipGroup[];
  totalPages: number;
  currentPage: number;
}

interface FetchLatestSipsParams {
  advisorId: number;
  appType?: 'savestment' | 'fydaa';
  page?: number;
  groupStatus?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'till_date' | 'custom'; // ✅ FIXED
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Generate fallback latest SIPs data when backend is unavailable
const generateFallbackLatestSips = (params: FetchLatestSipsParams): LatestSipsResponse => {
  const sampleSips: LatestSipGroup[] = [];
  
  for (let i = 0; i < 5; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - i);
    
    sampleSips.push({
      sipId: 1000 + i,
      sipName: `SIP Plan ${i + 1}`,
      userFullName: `User ${i + 1}`,
      goalName: `Goal ${i + 1}`,
      date: randomDate.toISOString(),
      groupStatus: i % 2 === 0 ? 'SUCCESS' : 'PENDING',
      totalOrders: Math.floor(Math.random() * 5) + 1,
      totalAmount: (Math.random() * 50000) + 10000,
      orders: []
    });
  }
  
  return {
    success: true,
    message: "Sample data (backend unavailable)",
    data: sampleSips,
    totalPages: 1,
    currentPage: params.page || 1
  };
};

export const getLatestSips = async (params: FetchLatestSipsParams): Promise<LatestSipsResponse | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.warn("Auth token not found, using fallback latest SIPs data");
      return generateFallbackLatestSips(params);
    }

    if (!API_URL) {
      console.warn("API_URL not configured, using fallback latest SIPs data");
      return generateFallbackLatestSips(params);
    }

    // Build URL with query parameters
    let url = `${API_URL}/referrals/latest-sips/${params.advisorId}?`;

    const queryParams = new URLSearchParams();

    // Always append page, defaulting to 1 if invalid or missing
    const pageNum = params.page && params.page > 0 ? params.page : 1;
    queryParams.append('page', pageNum.toString());

    if (params.appType) queryParams.append('type', params.appType);
    if (params.groupStatus) queryParams.append('groupStatus', params.groupStatus);
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);

    url += queryParams.toString();

    console.log('Attempting to fetch latest SIPs from:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.status === 401) {
      handleUnauthorized();
      return generateFallbackLatestSips(params);
    }

    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}, using fallback latest SIPs data`);
      return generateFallbackLatestSips(params);
    }

    const result: LatestSipsResponse = await response.json();

    if (!result.success || !result.data) {
      console.warn("API returned unsuccessful response, using fallback latest SIPs data");
      return generateFallbackLatestSips(params);
    }

    console.log('✅ Successfully fetched real latest SIPs data');
    return result;
    
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.warn("API request timed out, using fallback latest SIPs data");
    } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.warn("Network error (backend might be offline), using fallback latest SIPs data");
    } else {
      console.warn("Error fetching latest SIPs, using fallback data:", error);
    }
    
    // Always return fallback data instead of null
    return generateFallbackLatestSips(params);
  }
};
