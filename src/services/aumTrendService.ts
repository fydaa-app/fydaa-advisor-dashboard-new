import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface AumTrendDataPoint {
  label: string;
  date: string;
  aum: number;
}

export interface AumTrendResponse {
  success: boolean;
  message: string;
  data: {
    timeframe: string;
    type: string;
    trend: AumTrendDataPoint[];
  };
}

interface FetchAumTrendParams {
  selectedOption: string;
  customDates: { start: string; end: string };
  selectedEmployee?: string;
  appType: string;
}

/**
 * Get AUM trend data for advisor dashboard
 */
export const getAumTrendData = async (params: FetchAumTrendParams): Promise<AumTrendDataPoint[] | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      return null;
    }

    // Build URL with query parameters
    let url = `${API_URL}/referrals/advisor-aum-trend?`;

    const queryParams: string[] = [];

    // Add timeframe
    if (params.selectedOption === 'custom') {
      queryParams.push('timeframe=custom');
      queryParams.push(`startDate=${params.customDates.start}`);
      queryParams.push(`endDate=${params.customDates.end}`);
    } else if (params.selectedOption) {
      queryParams.push(`timeframe=${params.selectedOption}`);
    }

    // Add advisor ID (required by backend)
    if (params.selectedEmployee) {
      queryParams.push(`advisorId=${params.selectedEmployee}`);
    }

    // Add type (fydaa or savestment)
    const type = params.appType.toLowerCase();
    queryParams.push(`type=${type}`);

    url += queryParams.join('&');

    // 🔍 DEBUG LOGS
    console.log('=== AUM TREND API DEBUG ===');
    console.log('Params:', params);
    console.log('Full URL:', url);
    console.log('Auth Token exists:', !!AUTH_TOKEN);
    console.log('==========================');

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    console.log('Response Status:', response.status);

    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: AumTrendResponse = await response.json();
    
    // 🔍 Log full response
    console.log('API Response:', result);

    if (!result.success) {
      console.error("API returned error:", result.message);
      console.error("Full response data:", result);
      return null;
    }

    return result.data.trend;
  } catch (error) {
    console.error("Error fetching AUM trend data:", error);
    return null;
  }
};
