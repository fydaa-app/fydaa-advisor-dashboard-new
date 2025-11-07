import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
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

export interface TodaySalesData {
  totalRevenue: number;
  totalNoOfTransactions: number;
  noOfPayments: number;
  activeUsers: number;
  inactiveUsers?: number;
  newUsers?: number;
  totalUsers: number;
  assetsUnderManagement: number;
}

interface FetchCardsParams {
  selectedOption: string;
  customDates: { start: string; end: string };
  selectedEmployee?: string;
}

/**
 * Get cards data for dashboard (Savestment)
 */
export const getCardsData = async (params: FetchCardsParams): Promise<TodaySalesData | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      return null;
    }

    let url = `${API_URL}${process.env.NEXT_PUBLIC_CARD_ENDPOINT}?`;

    if (params.selectedOption === 'custom') {
      url += `timeframe=custom&startDate=${params.customDates.start}&endDate=${params.customDates.end}`;
    } else {
      url += `timeframe=${params.selectedOption || "monthly"}`;
    }

    if (params.selectedEmployee) {
      url += `&employeeId=${params.selectedEmployee}`;
    }

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

    const data: CardData[] = await response.json();

    return {
      totalRevenue: data.find((item) => item.type === "Total Revenue")?.totalRevenue || 0,
      totalNoOfTransactions: data.find((item) => item.type === "Total Transactions")?.totalNoOfTransactions || 0,
      noOfPayments: data.find((item) => item.type === "Total Payments")?.noOfPayments || 0,
      newUsers: data.find((item) => item.type === "New Users")?.newUsers || 0,
      activeUsers: data.find((item) => item.type === "Active Users")?.activeUsers || 0,
      totalUsers: data.find((item) => item.type === "Total Users")?.totalUsers || 0,
      assetsUnderManagement: Number(
        (data.find((item) => item.type === "Assets under Management")?.assetsUnderManagement || 0).toFixed(2)
      ),
    };
  } catch (error) {
    console.error("Error fetching cards data:", error);
    return null;
  }
};

/**
 * Get cards data for dashboard (Fydaa/MF)
 */
export const getCardsDataMf = async (params: FetchCardsParams): Promise<TodaySalesData | null> => {
  try {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      return null;
    }

    let url = `${API_URL}/referrals/cards-data-mf?`;

    if (params.selectedOption === 'custom') {
      url += `timeframe=custom&startDate=${params.customDates.start}&endDate=${params.customDates.end}`;
    } else {
      url += `timeframe=${params.selectedOption || "monthly"}`;
    }

    if (params.selectedEmployee) {
      url += `&employeeId=${params.selectedEmployee}`;
    }

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

    const data: CardData[] = await response.json();

    return {
      totalRevenue: data.find((item) => item.type === "Total Revenue")?.totalRevenue || 0,
      totalNoOfTransactions: data.find((item) => item.type === "Total Transactions")?.totalNoOfTransactions || 0,
      noOfPayments: data.find((item) => item.type === "Total Payments")?.noOfPayments || 0,
      inactiveUsers: data.find((item) => item.type === "InActive Users")?.inactiveUsers || 0,
      activeUsers: data.find((item) => item.type === "Active Users")?.activeUsers || 0,
      totalUsers: data.find((item) => item.type === "Total Users")?.totalUsers || 0,
      assetsUnderManagement: Number(
        (data.find((item) => item.type === "Assets under Management")?.assetsUnderManagement || 0).toFixed(2)
      ),
    };
  } catch (error) {
    console.error("Error fetching cards data MF:", error);
    return null;
  }
};


