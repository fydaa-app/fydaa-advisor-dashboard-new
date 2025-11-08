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
  fromApp?: string;
}

export interface FetchTransactionsParams {
  page: number;
  selectedOption: string;
  advisorId: number;
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

// Cache for ALL transactions (not filtered by appType)
let transactionsCache: Transaction[] = [];
let cachedAdvisorId: number | null = null;

/**
 * Check if transaction date falls within filter range
 */
const isTransactionInDateRange = (
  transactionDate: string,
  selectedOption: string,
  customDates: { start: string; end: string }
): boolean => {
  try {
    const txDate = new Date(transactionDate);
    
    // If no filter or "all" option, show everything
    if (!selectedOption || selectedOption === 'all' || selectedOption === '') {
      return true;
    }
    
    if (selectedOption === 'custom' && customDates.start && customDates.end) {
      const startDate = new Date(customDates.start);
      const endDate = new Date(customDates.end);
      endDate.setHours(23, 59, 59, 999);
      return txDate >= startDate && txDate <= endDate;
    }
    
    if (selectedOption === 'yearly') {
      const currentYear = new Date().getFullYear();
      return txDate.getFullYear() === currentYear;
    }
    
    if (selectedOption === 'monthly') {
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    
    if (selectedOption === 'weekly') {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= weekAgo && txDate <= now;
    }
    
    return true;
  } catch (err) {
    console.error("Date range check error:", err);
    return true;
  }
};

/**
 * Matches search query against transaction fields
 */
const matchesSearchQuery = (transaction: Transaction, searchQuery: string): boolean => {
  if (!searchQuery) return true;
  
  const query = searchQuery.toLowerCase();
  return (
    transaction.userName.toLowerCase().includes(query) ||
    transaction.managerName.toLowerCase().includes(query) ||
    transaction.planName.toLowerCase().includes(query) ||
    transaction.mobileNumber.toString().includes(query) ||
    transaction.transactionType.toLowerCase().includes(query)
  );
};

/**
 * Fetch portfolio name from portfolioDetails using portfolioId
 */
const getPortfolioName = (portfolioDetails: any[], portfolioId: number): string => {
  if (!portfolioDetails || !Array.isArray(portfolioDetails)) return "N/A";
  
  const portfolio = portfolioDetails.find((p: any) => p.portfolioId === portfolioId);
  return portfolio?.portfolioName || "N/A";
};

/**
 * Convert mobile number string to number, handling various formats
 */
const parseMobileNumber = (mobile: any): number => {
  if (typeof mobile === 'number') return mobile;
  if (typeof mobile === 'string') {
    const cleaned = mobile.replace(/\D/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Extract and map transactions from user data
 */
const extractTransactionsFromUserData = (userData: any): Transaction[] => {
  const transactions: Transaction[] = [];

  try {
    const userDetails = userData.userDetails || userData;
    const userName = `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() || "Unknown";
    const mobileNumber = parseMobileNumber(userDetails.mobileNumber || userDetails.phone);
    const fromApp = userDetails.fromApp || "Unknown";
    
    const relationshipManager = userData.relationshipManager || {};
    const managerName = relationshipManager.name || String(userDetails.relationshipmanagerId || "N/A");
    const portfolioDetails = userData.portfolioDetails || [];
    const txDetails = userDetails.userTransactionDetails || userData.userTransactionDetails || [];

    if (Array.isArray(txDetails) && txDetails.length > 0) {
      txDetails.forEach((tx: any) => {
        const planName = getPortfolioName(portfolioDetails, tx.portfolioId);

        transactions.push({
          userName: userName,
          orderAmount: tx.totalAmount || 0,
          transactionType: tx.orderType || "N/A",
          planName: planName,
          managerName: managerName,
          date: tx.createdAt || new Date().toISOString(),
          time: extractTime(tx.createdAt || ""),
          mobileNumber: mobileNumber,
          fromApp: fromApp,
        });
      });
    }
  } catch (err) {
    console.error("Error extracting transactions:", err);
  }

  return transactions;
};

/**
 * Extract time from ISO date string
 */
const extractTime = (isoDateString: string): string => {
  try {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (err) {
    return "";
  }
};

/**
 * Fetch ALL transactions for advisor (cached, NOT filtered by appType)
 */
const fetchAllTransactions = async (advisorId: number): Promise<Transaction[]> => {
  // Return cached data if available for this advisor
  if (transactionsCache.length > 0 && cachedAdvisorId === advisorId) {
    return transactionsCache;
  }

  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("authToken="))
    ?.split("=")[1] || "";

  if (!token) {
    console.error("No authentication token found");
    return [];
  }

  try {
    const clientsUrl = `${API_URL}/referrals/advisor-wise-users/${advisorId}`;

    const clientsResponse = await fetch(clientsUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (clientsResponse.status === 401) {
      handleUnauthorized();
      return [];
    }

    if (!clientsResponse.ok) {
      console.error("Error fetching clients");
      return [];
    }

    const clientsData = await clientsResponse.json();

    let clientIds: number[] = [];
    
    if (Array.isArray(clientsData)) {
      clientIds = clientsData.map(client => client.id || client.userId);
    } else if (clientsData.data && Array.isArray(clientsData.data)) {
      clientIds = clientsData.data.map((client: any) => client.id || client.userId);
    } else if (clientsData.users && Array.isArray(clientsData.users)) {
      clientIds = clientsData.users.map((client: any) => client.id || client.userId);
    } else if (clientsData.userDetails && Array.isArray(clientsData.userDetails)) {
      clientIds = clientsData.userDetails.map((client: any) => client.id || client.userId);
    }

    if (clientIds.length === 0) {
      return [];
    }

    let allTransactions: Transaction[] = [];

    for (const clientId of clientIds) {
      try {
        const userUrl = `${API_URL}/referrals/view-user/${clientId}`;
        
        const userResponse = await fetch(userUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          continue;
        }

        const userData = await userResponse.json();
        const userTransactions = extractTransactionsFromUserData(userData);
        allTransactions = allTransactions.concat(userTransactions);
      } catch (err) {
        console.error(`Error fetching user ${clientId}:`, err);
        continue;
      }
    }

    // Sort by date (most recent first)
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Cache ALL transactions (not filtered)
    transactionsCache = allTransactions;
    cachedAdvisorId = advisorId;

    return allTransactions;
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [];
  }
};

/**
 * Fetch advisor's clients and their transactions with client-side filtering
 */
export const getTransactions = async (params: FetchTransactionsParams): Promise<FetchTransactionsResponse> => {
  try {
    // Fetch ALL transactions (uses cache, not filtered by appType)
    const allTransactions = await fetchAllTransactions(params.advisorId);

    if (allTransactions.length === 0) {
      return {
        transactions: [],
        error: null,
        totalTransactions: 0,
        limit: 10,
      };
    }

    // Step 1: Filter by appType (client-side, like client service)
    let filteredByApp = allTransactions;
    if (params.appType && params.appType.trim() !== "") {
      const appTypeLower = params.appType.toLowerCase();
      filteredByApp = allTransactions.filter(tx =>
        tx.fromApp?.toLowerCase() === appTypeLower
      );
    }

    // Step 2: Filter by date range
    const filteredByDate = filteredByApp.filter(tx => 
      isTransactionInDateRange(tx.date, params.selectedOption, params.customDates)
    );

    // Step 3: Filter by search query
    const filteredBySearch = filteredByDate.filter(tx =>
      matchesSearchQuery(tx, params.searchQuery || "")
    );

    // Step 4: Client-side pagination
    const totalTransactions = filteredBySearch.length;
    const limit = 10;
    const startIndex = (params.page - 1) * limit;
    const paginatedTransactions = filteredBySearch.slice(startIndex, startIndex + limit);

    return {
      transactions: paginatedTransactions,
      error: null,
      totalTransactions: totalTransactions,
      limit: limit,
    };
  } catch (err) {
    console.error("Error in getTransactions:", err);
    return { 
      transactions: [], 
      error: err instanceof Error ? err.message : "Error fetching data",
      totalTransactions: 0,
      limit: 10,
    };
  }
};

/**
 * Clear cache when needed
 */
export const clearTransactionsCache = () => {
  transactionsCache = [];
  cachedAdvisorId = null;
};
