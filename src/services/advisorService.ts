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

export const advisorService = {
  async fetchAdvisor(advisorId: number): Promise<AdvisorData> {
    try {
      if (!API_URL) {
        throw new Error("API_URL environment variable is not set");
      }

      const url = `${API_URL}/referrals/advisor/${advisorId}`;
      const headers = getHeaders();

      console.log("Fetching advisor from:", url);
      console.log("Request headers:", {
        ...headers,
        Authorization: headers.Authorization ? "Bearer [TOKEN]" : "none",
      });

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`HTTP Error ${response.status}:`, errorData);
        throw new Error(
          `Failed to fetch advisor: ${response.status} ${response.statusText}`
        );
      }

      const result: ApiResponse<AdvisorData> = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching advisor data:", error);
      throw error;
    }
  },
};
