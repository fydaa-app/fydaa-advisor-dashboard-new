import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface AdvisorCardsDataResponse {
  success: boolean;
  message: string;
  data: {
    totalClients: number;
    totalInvestment?: number; // Savestment
    totalInvestedValue?: number; // Fydaa
    totalCurrentValue?: number; // Fydaa
    totalUnrealizedProfit?: number; // Fydaa
    totalRealizedProfit?: number; // Fydaa
    totalProfit?: number; // Fydaa
    investedSips?: number; // Fydaa
    investedPortfolios?: number; // Savestment
  };
}

export interface TodaySalesData {
  totalClients: number;
  totalAUM: number;
  activePortfoliosOrSips: number;
}

interface FetchCardsParams {
  selectedOption: string;
  customDates: { start: string; end: string };
  selectedEmployee?: string;
  appType: string; // "Fydaa" or "Savestment"
}

/**
 * Get cards data for advisor dashboard
 * Works for both Fydaa and Savestment based on type
 */
export const getAdvisorCardsData = async (params: FetchCardsParams): Promise<TodaySalesData | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      return null;
    }

    // Build URL with query parameters
    let url = `${API_URL}/referrals/advisor-cards-data?`;

    // Add timeframe
    if (params.selectedOption === 'custom') {
      url += `timeframe=custom&startDate=${params.customDates.start}&endDate=${params.customDates.end}`;
    } else {
      url += `timeframe=${params.selectedOption || "monthly"}`;
    }

    // Add advisor ID if selected
    if (params.selectedEmployee) {
      url += `&advisorId=${params.selectedEmployee}`;
    }

    // Add type (fydaa or savestment)
    const type = params.appType.toLowerCase();
    url += `&type=${type}`;

    console.log('Fetching advisor cards data from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: AdvisorCardsDataResponse = await response.json();

    if (!result.success) {
      console.error("API returned error:", result.message);
      return null;
    }

    const { data } = result;

    // Transform response based on app type
    let totalAUM = 0;
    let activePortfoliosOrSips = 0;

    if (type === 'fydaa') {
      // For Fydaa: use totalCurrentValue as AUM and investedSips
      totalAUM = data.totalCurrentValue || 0;
      activePortfoliosOrSips = data.investedSips || 0;
    } else {
      // For Savestment: use totalInvestment as AUM and investedPortfolios
      totalAUM = data.totalInvestment || 0;
      activePortfoliosOrSips = data.investedPortfolios || 0;
    }

    return {
      totalClients: data.totalClients || 0,
      totalAUM: Number(totalAUM.toFixed(2)),
      activePortfoliosOrSips: activePortfoliosOrSips,
    };
  } catch (error) {
    console.error("Error fetching advisor cards data:", error);
    return null;
  }
};

// Keep legacy functions for backward compatibility if needed elsewhere
export const getCardsData = async (params: Omit<FetchCardsParams, 'appType'>): Promise<TodaySalesData | null> => {
  return getAdvisorCardsData({ ...params, appType: 'Savestment' });
};

export const getCardsDataMf = async (params: Omit<FetchCardsParams, 'appType'>): Promise<TodaySalesData | null> => {
  return getAdvisorCardsData({ ...params, appType: 'Fydaa' });
};

export interface CardData {
  type: string;
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  newUsers?: number;
  totalUsers?: number;
  assetsUnderManagement?: number;
}
