import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  Cookies.remove('authToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface Portfolio {
  portfolioId: number;
  portfolioName: string;
  client: string;
  currentValue: number;
  totalProfit: number;
  status: "Active" | "Inactive";
  fromApp?: string;
}

export interface FetchPortfoliosParams {
  page: number;
  advisorId: number;
  searchQuery?: string;
  appType?: string;
}

export interface FetchPortfoliosResponse {
  portfolios: Portfolio[];
  error: string | null;
  totalPortfolios?: number;
  limit?: number;
}

interface UserData {
  userDetails?: {
    firstName?: string;
    lastName?: string;
    fromApp?: string;
  };
  portfolioDetails?: Array<{
    portfolioId: number;
    portfolioName?: string;
    currentValue?: number;
    totalProfit?: number;
  }>;
  firstName?: string;
  lastName?: string;
  fromApp?: string;
}

interface ClientData {
  id?: number;
  userId?: number;
}

// Cache for ALL portfolios (not filtered by appType)
let portfoliosCache: Portfolio[] = [];
let cachedAdvisorId: number | null = null;

/**
 * Matches search query against portfolio fields
 */
const matchesSearchQuery = (portfolio: Portfolio, searchQuery: string): boolean => {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();
  return (
    portfolio.portfolioName.toLowerCase().includes(query) ||
    portfolio.client.toLowerCase().includes(query) ||
    portfolio.currentValue.toString().includes(query) ||
    portfolio.status.toLowerCase().includes(query)
  );
};

/**
 * Extract and map portfolios from user data
 */
const extractPortfoliosFromUserData = (userData: UserData): Portfolio[] => {
  const portfolios: Portfolio[] = [];

  try {
    const userDetails = userData.userDetails || userData;
    const client = `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() || "Unknown";
    const fromApp = userDetails.fromApp || "Unknown";

    // Get portfolio details
    const portfolioDetails = userData.portfolioDetails || [];

    if (Array.isArray(portfolioDetails) && portfolioDetails.length > 0) {
      portfolioDetails.forEach((portfolio) => {
        portfolios.push({
          portfolioId: portfolio.portfolioId,
          portfolioName: portfolio.portfolioName || "N/A",
          client: client,
          currentValue: portfolio.currentValue || 0,
          totalProfit: portfolio.totalProfit || 0,
          status: portfolio.currentValue && portfolio.currentValue > 0 ? "Active" : "Inactive",
          fromApp: fromApp,
        });
      });
    }
  } catch (error) {
    console.error("Error extracting portfolios:", error);
  }

  return portfolios;
};

/**
 * Fetch user data in parallel batches with controlled concurrency
 */
const fetchUserDataInBatches = async (
  clientIds: number[],
  token: string,
  batchSize: number = 15
): Promise<unknown[]> => {
  const results: unknown[] = [];

  for (let i = 0; i < clientIds.length; i += batchSize) {
    const batch = clientIds.slice(i, i + batchSize);

    console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(clientIds.length / batchSize)}...`);

    const batchPromises = batch.map(async (clientId) => {
      const userUrl = `${API_URL}/referrals/view-user/${clientId}`;
      const userResponse = await fetch(userUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user ${clientId}: ${userResponse.status}`);
      }
      return await userResponse.json();
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Error fetching user ${batch[index]}:`, result.reason);
      }
    });
  }

  return results;
};

/**
 * Fetch ALL portfolios for advisor (optimized with batching)
 */
const fetchAllPortfolios = async (advisorId: number): Promise<Portfolio[]> => {
  // Return cached data if available for this advisor
  if (portfoliosCache.length > 0 && cachedAdvisorId === advisorId) {
    console.log("Using cached portfolios");
    return portfoliosCache;
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
    console.log("Fetching client list...");
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
      clientIds = clientsData.map((client: ClientData) => client.id || client.userId).filter(Boolean) as number[];
    } else if (clientsData.data && Array.isArray(clientsData.data)) {
      clientIds = clientsData.data.map((client: ClientData) => client.id || client.userId).filter(Boolean) as number[];
    } else if (clientsData.users && Array.isArray(clientsData.users)) {
      clientIds = clientsData.users.map((client: ClientData) => client.id || client.userId).filter(Boolean) as number[];
    } else if (clientsData.userDetails && Array.isArray(clientsData.userDetails)) {
      clientIds = clientsData.userDetails.map((client: ClientData) => client.id || client.userId).filter(Boolean) as number[];
    }

    if (clientIds.length === 0) {
      console.log("No clients found");
      return [];
    }

    console.log(`Found ${clientIds.length} clients. Fetching user data in parallel batches...`);

    // Fetch all user data in parallel batches (15 at a time)
    const userData = await fetchUserDataInBatches(clientIds, token, 15);

    console.log(`Successfully fetched ${userData.length} user records. Extracting portfolios...`);

    // Extract portfolios from all users
    let allPortfolios: Portfolio[] = [];
    userData.forEach(data => {
      const userPortfolios = extractPortfoliosFromUserData(data as UserData);
      allPortfolios = allPortfolios.concat(userPortfolios);
    });

    console.log(`Extracted ${allPortfolios.length} total portfolios`);

    // Sort by current value (highest first)
    allPortfolios.sort((a, b) => b.currentValue - a.currentValue);

    // Cache ALL portfolios (not filtered)
    portfoliosCache = allPortfolios;
    cachedAdvisorId = advisorId;

    return allPortfolios;
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return [];
  }
};

/**
 * Fetch advisor's client portfolios with client-side filtering
 */
export const getPortfolios = async (params: FetchPortfoliosParams): Promise<FetchPortfoliosResponse> => {
  try {
    // Fetch ALL portfolios (uses cache, not filtered by appType)
    const allPortfolios = await fetchAllPortfolios(params.advisorId);

    if (allPortfolios.length === 0) {
      return {
        portfolios: [],
        error: null,
        totalPortfolios: 0,
        limit: 10,
      };
    }

    // Step 1: Filter by appType (client-side)
    let filteredByApp = allPortfolios;
    if (params.appType && params.appType.trim() !== "") {
      const appTypeLower = params.appType.toLowerCase();
      filteredByApp = allPortfolios.filter(p =>
        p.fromApp?.toLowerCase() === appTypeLower
      );
    }

    // Step 2: Filter by search query
    const filteredBySearch = filteredByApp.filter(p =>
      matchesSearchQuery(p, params.searchQuery || "")
    );

    // Step 3: Client-side pagination
    const totalPortfolios = filteredBySearch.length;
    const limit = 10;
    const startIndex = (params.page - 1) * limit;
    const paginatedPortfolios = filteredBySearch.slice(startIndex, startIndex + limit);

    return {
      portfolios: paginatedPortfolios,
      error: null,
      totalPortfolios: totalPortfolios,
      limit: limit,
    };
  } catch (error) {
    console.error("Error in getPortfolios:", error);
    return { 
      portfolios: [], 
      error: error instanceof Error ? error.message : "Error fetching data",
      totalPortfolios: 0,
      limit: 10,
    };
  }
};

/**
 * Clear cache when needed
 */
export const clearPortfoliosCache = () => {
  portfoliosCache = [];
  cachedAdvisorId = null;
  console.log("Portfolios cache cleared");
};