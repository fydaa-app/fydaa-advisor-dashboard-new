import { getCookie } from 'cookies-next';

const STOCK_API_URL = process.env.NEXT_PUBLIC_STOCK_API_URL;
const ONBOARDING_API_URL = process.env.NEXT_PUBLIC_ONBOARDING_API_URL;

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

export interface EmailReportRequest {
  userId: number;
  dryRun?: boolean; // For testing without sending email
}

export interface EmailReportResponse {
  success: boolean;
  message: string;
}

export const clientDocumentService = {
  /**
   * Download portfolio PDF
   */
  async downloadPortfolioPdf(userId: number): Promise<void> {
    if (!STOCK_API_URL) throw new Error('STOCK_API_URL is not configured');

    const headers = getHeaders();
    const url = `${STOCK_API_URL}portfolio/downloadUserPortfolioPdf/${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download portfolio PDF: ${response.status}`);
    }

    // Create blob from response
    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `portfolio_${userId}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(fileURL);
  },

  /**
   * Send portfolio email report
   * @param dryRun - Set to true to test without actually sending email
   */
  async sendPortfolioEmail(userId: number, dryRun: boolean = false): Promise<EmailReportResponse> {
    if (!STOCK_API_URL) throw new Error('STOCK_API_URL is not configured');

    const headers = getHeaders();
    const url = `${STOCK_API_URL}portfolio/send-email${dryRun ? '?dryRun=true' : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send portfolio email: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Download risk profile PDF
   */
  async downloadRiskProfilePdf(userId: number): Promise<void> {
    if (!ONBOARDING_API_URL) throw new Error('ONBOARDING_API_URL is not configured');

    const headers = getHeaders();
    const url = `${ONBOARDING_API_URL}risk-profile/downloadUserRiskProfilePdf/${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download risk profile PDF: ${response.status}`);
    }

    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `risk_profile_${userId}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(fileURL);
  },

  /**
   * Download e-sign agreement PDF
   */
  async downloadEsignAgreement(userId: number): Promise<void> {
    if (!ONBOARDING_API_URL) throw new Error('ONBOARDING_API_URL is not configured');

    const headers = getHeaders();
    const url = `${ONBOARDING_API_URL}adahaar-esign/downloadEsignAgreement/${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download e-sign agreement: ${response.status}`);
    }

    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `esign_agreement_${userId}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(fileURL);
  },
};
