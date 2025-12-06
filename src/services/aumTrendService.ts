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

// Generate fallback data for when backend is not available
const generateFallbackData = (params: FetchAumTrendParams): AumTrendDataPoint[] => {
  const { selectedOption } = params;
  const baseAum = 1000000; // 10 lakh base AUM
  
  const dataPoints: AumTrendDataPoint[] = [];
  const today = new Date();
  
  switch (selectedOption) {
    case 'daily':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dataPoints.push({
          label: date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
          date: date.toISOString().split('T')[0],
          aum: baseAum + (Math.random() * 200000) - 100000 // ±1 lakh variation
        });
      }
      break;
    case 'weekly':
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (i * 7));
        dataPoints.push({
          label: `Week ${52 - i}`,
          date: date.toISOString().split('T')[0],
          aum: baseAum + (i * 50000) + (Math.random() * 300000) - 150000
        });
      }
      break;
    case 'monthly':
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        dataPoints.push({
          label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          date: date.toISOString().split('T')[0],
          aum: baseAum + (i * 100000) + (Math.random() * 500000) - 250000
        });
      }
      break;
    case 'yearly':
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setFullYear(today.getFullYear() - i);
        dataPoints.push({
          label: date.getFullYear().toString(),
          date: date.toISOString().split('T')[0],
          aum: baseAum + (i * 500000) + (Math.random() * 1000000) - 500000
        });
      }
      break;
    default:
      // Default to monthly
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        dataPoints.push({
          label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          date: date.toISOString().split('T')[0],
          aum: baseAum + (i * 100000) + (Math.random() * 500000) - 250000
        });
      }
  }
  
  return dataPoints;
};

/**
 * Get AUM trend data for advisor dashboard
 * Falls back to sample data when backend is unavailable
 */
export const getAumTrendData = async (params: FetchAumTrendParams): Promise<AumTrendDataPoint[] | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.warn("Auth token not found, using fallback data");
      return generateFallbackData(params);
    }

    if (!API_URL) {
      console.warn("API_URL not configured, using fallback data");
      return generateFallbackData(params);
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

    console.log('Attempting to fetch AUM data from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.status === 401) {
      handleUnauthorized();
      return generateFallbackData(params);
    }

    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}, using fallback data`);
      return generateFallbackData(params);
    }

    const result: AumTrendResponse = await response.json();

    if (!result.success || !result.data || !result.data.trend) {
      console.warn("API returned unsuccessful response, using fallback data");
      return generateFallbackData(params);
    }

    console.log('✅ Successfully fetched real AUM data');
    return result.data.trend;
    
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.warn("API request timed out, using fallback data");
    } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.warn("Network error (backend might be offline), using fallback data");
    } else {
      console.warn("Error fetching AUM trend data, using fallback data:", error);
    }
    
    // Always return fallback data instead of null
    return generateFallbackData(params);
  }
};
