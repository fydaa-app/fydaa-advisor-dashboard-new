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

export const getLatestSips = async (params: FetchLatestSipsParams): Promise<LatestSipsResponse | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      return null;
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

    console.log('Fetching latest SIPs from:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: LatestSipsResponse = await response.json();

    if (!result.success) {
      console.error("API returned error:", result.message);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Error fetching latest SIPs:", error);
    return null;
  }
};
