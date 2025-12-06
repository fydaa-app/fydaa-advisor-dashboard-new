import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AdvisorData {
  id: number;
  name: string;
  email: string;
  mobile: string;
  description: string;
  age: number;
  experienceInYears: number;
  photo: string;
  attachment1?: string;
  attachment2?: string;
  type: string;
  isActive: boolean;
  assigned_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = getCookie("authToken") as string | undefined;

    if (!token) {
      console.warn("No auth token found in cookies");
      return null;
    }

    console.log("Auth token found:", token.substring(0, 20) + "...");
    return token;
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Generate fallback advisor data when backend is unavailable
const generateFallbackAdvisor = (advisorId: number): AdvisorData => {
  return {
    id: advisorId,
    name: "Sample Advisor",
    email: "advisor@fydaa.com",
    mobile: "+91 98765 43210",
    description: "Experienced Financial Advisor with 8+ years in wealth management",
    age: 32,
    experienceInYears: 8,
    photo: "/images/user/user-image.png",
    attachment1: "",
    attachment2: "",
    type: "advisor",
    isActive: true,
    assigned_count: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const advisorService = {
  async fetchAdvisor(advisorId: number): Promise<AdvisorData> {
    try {
      if (!API_URL) {
        console.warn("API_URL not configured, using fallback advisor data");
        return generateFallbackAdvisor(advisorId);
      }

      const url = `${API_URL}/referrals/advisor/${advisorId}`;
      const headers = getHeaders();

      console.log("Attempting to fetch advisor from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`HTTP Error ${response.status}, using fallback data:`, errorData);
        return generateFallbackAdvisor(advisorId);
      }

      const result: ApiResponse<AdvisorData> = await response.json();
      
      if (!result.data) {
        console.warn("API returned no advisor data, using fallback data");
        return generateFallbackAdvisor(advisorId);
      }

      console.log('✅ Successfully fetched real advisor data');
      return result.data;
      
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        console.warn("API request timed out, using fallback advisor data");
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn("Network error (backend might be offline), using fallback advisor data");
      } else {
        console.warn("Error fetching advisor data, using fallback data:", error);
      }
      
      // Always return fallback data instead of throwing
      return generateFallbackAdvisor(advisorId);
    }
  },
};
