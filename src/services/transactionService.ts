import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface Transaction {
  userName: string;
  orderAmount: number;
  transactionType: string;
  planName: string;
  managerName: string;
  date: string;
  time: string;
  mobileNumber: number;
}

export interface FetchTransactionsParams {
  page: number;
  selectedOption: string;
  selectedEmployee?: string;
  customDates: { start: string; end: string };
  searchQuery?: string;
  appType?: string;
}

export interface FetchTransactionsResponse {
  transactions: Transaction[];
  error: string | null;
  totalTransactions?: number;
  limit?: number;
}

/**
 * Fetch transactions list
 */
export const getTransactions = async (params: FetchTransactionsParams): Promise<FetchTransactionsResponse> => {
  try {
    // Use different endpoint based on app type
    let endpoint = process.env.NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT;
    if (params.appType === "Fydaa") {
      endpoint = "/referrals/transactions-list-mf";
    }

    let url = `${API_URL}${endpoint}?page=${params.page}`;

    if (params.selectedOption === 'custom') {
      url += `&timeframe=custom&startDate=${params.customDates.start}&endDate=${params.customDates.end}`;
    } else {
      url += `&timeframe=${params.selectedOption || "yearly"}`;
    }

    if (params.searchQuery) {
      url += `&search=${encodeURIComponent(params.searchQuery)}`;
    }

    if (params.selectedEmployee) {
      url += `&employeeId=${params.selectedEmployee}`;
    }

    const token = document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || "";

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return { transactions: [], error: "Unauthorized" };
    }

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const data = await response.json();
    return {
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      error: null,
      totalTransactions: data.totalTransactions,
      limit: data.limit,
    };
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return { transactions: [], error: "Error fetching data" };
  }
};


