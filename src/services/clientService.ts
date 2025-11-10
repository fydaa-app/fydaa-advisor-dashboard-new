import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ClientData {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  mobileNumber: string;
  fromApp?: string;
  kycStatus?: string;
  accountStatus?: string;
}

interface UserDetails {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  mobileNumber: string;
  fromApp?: string;
  panStatus?: string;
  main_subscription_status?: number;
}

interface AdvisorWiseUsersResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    mobileNumber: string;
    fromApp?: string;
    type?: string;
  }>;
}

interface ViewUserResponse {
  userDetails: UserDetails;
}

const clientCache: Record<string, ClientData[]> = {};

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = getCookie('authToken');
    if (typeof token === 'string') return token;
  }
  return null;
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// ✅ OPTIMIZED: Fire all requests concurrently
const fetchClientDetailsParallel = async (
  userList: Array<{ id: number; firstName?: string | null; lastName?: string | null; email: string; mobileNumber: string }>,
  headers: Record<string, string>
): Promise<ClientData[]> => {
  
  console.log(`Fetching details for ${userList.length} clients in parallel...`);
  
  // Fire ALL requests at once (not in batches)
  const allPromises = userList.map(async (basicUser) => {
    try {
      const detailUrl = `${API_URL}/referrals/view-user/${basicUser.id}`;
      const detailResponse = await fetch(detailUrl, { method: 'GET', headers });
      
      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch client ${basicUser.id}: ${detailResponse.status}`);
      }
      
      const detailResult: ViewUserResponse = await detailResponse.json();
      const userDetails = detailResult.userDetails;

      return {
        id: basicUser.id,
        firstName: userDetails.firstName ?? basicUser.firstName ?? '',
        lastName: userDetails.lastName ?? basicUser.lastName ?? '',
        email: userDetails.email ?? basicUser.email ?? '',
        mobileNumber: userDetails.mobileNumber ?? basicUser.mobileNumber ?? '',
        fromApp: userDetails.fromApp,
        kycStatus:
          userDetails.panStatus === 'KYC_SUCCESS'
            ? 'Approved'
            : !userDetails.panStatus || userDetails.panStatus === 'PENDING'
            ? 'Pending'
            : userDetails.panStatus === 'REJECTED'
            ? 'Rejected'
            : 'Unknown',
        accountStatus: userDetails.main_subscription_status === 1 ? 'Active' : 'Inactive',
      };
    } catch (error) {
      console.error(`Error fetching client ${basicUser.id}:`, error);
      return {
        id: basicUser.id,
        firstName: basicUser.firstName ?? '',
        lastName: basicUser.lastName ?? '',
        email: basicUser.email ?? '',
        mobileNumber: basicUser.mobileNumber ?? '',
        fromApp: undefined,
        kycStatus: 'Unknown',
        accountStatus: 'Unknown',
      };
    }
  });
  
  // Wait for ALL requests to complete
  const enrichedClients = await Promise.all(allPromises);
  console.log(`Successfully enriched ${enrichedClients.length} clients`);
  
  return enrichedClients;
};

export const clientService = {
  async fetchAdvisorClients(advisorId: number, appType?: string): Promise<ClientData[]> {
    if (!API_URL) throw new Error('API_URL environment variable is not set');

    const cacheKey = `${advisorId}_${appType ?? ''}`;
    if (clientCache[cacheKey]) {
      console.log("Using cached clients");
      return clientCache[cacheKey];
    }

    const headers = getHeaders();

    console.log("Fetching client list...");
    const listUrl = `${API_URL}/referrals/advisor-wise-users/${advisorId}`;
    const listResponse = await fetch(listUrl, { method: 'POST', headers });
    if (!listResponse.ok) {
      throw new Error(`Failed to fetch clients: ${listResponse.status} ${listResponse.statusText}`);
    }
    const listResult: AdvisorWiseUsersResponse = await listResponse.json();
    const userList = listResult.data || [];

    console.log(`Found ${userList.length} clients. Fetching details in parallel...`);

    // ✅ Use parallel fetching instead of sequential batches
    const enrichedClients = await fetchClientDetailsParallel(userList, headers);

    let filteredClients = enrichedClients;
    if (appType) {
      const lowerAppType = appType.toLowerCase();
      filteredClients = enrichedClients.filter(
        (client) => client.fromApp?.toLowerCase() === lowerAppType
      );
      console.log(`Filtered to ${filteredClients.length} clients for appType: ${appType}`);
    }

    clientCache[cacheKey] = filteredClients;
    return filteredClients;
  },
};
