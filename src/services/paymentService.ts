import { getCookie } from "cookies-next";

const PAYMENT_API_URL = (process.env.NEXT_PUBLIC_PAYMENT_API_URL || '').replace(/\/+$/, '') + '/';

// ============= Types & Interfaces =============

export interface UserAccountLedger {
  ledgerId: number;
  userId: number;
  date: string;
  particulars: string;
  paymentType: string;
  paymentNo: string;
  debit: string;
  credit: string;
  balance: string;
  balanceType: string;
  status: string;
}

export interface AccountLedgerResponse {
  data: UserAccountLedger[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============= Helper Functions =============

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = getCookie("authToken");
    if (typeof token === "string") {
      return token;
    }
  }
  return null;
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ============= Payment Service =============

export const paymentService = {
  /**
   * Fetch account ledger entries for a specific user with pagination
   */
  async getUserAccountLedgers(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<AccountLedgerResponse> {
    if (!process.env.NEXT_PUBLIC_PAYMENT_API_URL) {
      throw new Error("PAYMENT_API_URL environment variable is not set");
    }

    const url = `${PAYMENT_API_URL}subscription/account-ledgers/user/${userId}?page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch account ledgers: ${response.status} ${response.statusText}`
      );
    }

    const data: AccountLedgerResponse = await response.json();
    return data;
  },
};
