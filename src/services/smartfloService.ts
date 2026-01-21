// Smartflo API Service for Click-to-Call functionality

const SMARTFLO_BASE_URL = `${process.env.NEXT_PUBLIC_VOIP_URL}/v1`;

interface SmartfloAuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  number_of_days_left: number;
}

interface SmartfloNumber {
  id: string;
  name: string;
  description: string;
  alias: string;
  did: string;
  destination: string | null;
  destination_name: string | null;
  sms_templates: string;
}

interface ClickToCallResponse {
  success: boolean;
  message?: string;
  data?: {
    message?: string;
    ref_id?: string;
    [key: string]: unknown;
  };
}

/**
 * Generate authentication token for Smartflo API
 */
export const generateSmartfloToken = async (
  email: string,
  password: string
): Promise<string> => {
  try {
    const response = await fetch(`${SMARTFLO_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Authentication failed: ${errorMessage}`);
    }

    const data: SmartfloAuthResponse = await response.json();
    
    if (!data.success || !data.access_token) {
      throw new Error('Authentication failed: Invalid credentials');
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error generating Smartflo token:', error);
    throw error;
  }
};

/**
 * Refresh SmartFlo authentication token
 */
export const refreshSmartfloToken = async (currentToken: string): Promise<string> => {
  try {
    const response = await fetch(`${SMARTFLO_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': currentToken,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Token refresh failed: ${errorMessage}`);
    }

    const data = await response.json();
    
    // Check if API returned success: false
    if (data.success === false) {
      throw new Error(`Failed to refresh token: ${data.message || 'Token refresh failed'}`);
    }
    
    // Return the new token
    return data.access_token || data.token || data;
  } catch (error) {
    console.error('Error refreshing SmartFlo token:', error);
    throw error;
  }
};

/**
 * Fetch available phone numbers (caller IDs)
 */
export const fetchSmartfloNumbers = async (
  token: string
): Promise<SmartfloNumber[]> => {
  try {
    const response = await fetch(`${SMARTFLO_BASE_URL}/my_number`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch numbers: ${response.statusText}`);
    }

    const numbers: SmartfloNumber[] = await response.json();
    return numbers;
  } catch (error) {
    console.error('Error fetching Smartflo numbers:', error);
    throw error;
  }
};

/**
 * Initiate click-to-call
 */
export const initiateClickToCall = async (
  token: string,
  agentNumber: string,
  destinationNumber: string,
  callerId: string
): Promise<ClickToCallResponse> => {
  try {
    const response = await fetch(`${SMARTFLO_BASE_URL}/click_to_call`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        async: 1,
        agent_number: agentNumber,
        destination_number: destinationNumber,
        caller_id: callerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Click-to-call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error initiating click-to-call:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to initiate call',
    };
  }
};

/**
 * Complete flow: Authenticate, get caller ID, and make call
 */
export const makeSmartfloCall = async (
  email: string,
  password: string,
  agentNumber: string,
  destinationNumber: string
): Promise<ClickToCallResponse> => {
  try {
    // Step 1: Get auth token
    const token = await generateSmartfloToken(email, password);

    // Step 2: Fetch available numbers to get caller_id
    const numbers = await fetchSmartfloNumbers(token);
    
    if (!numbers || numbers.length === 0) {
      throw new Error('No caller ID available');
    }

    // Use the first available number's alias as caller_id
    const callerId = numbers[0].alias;

    // Step 3: Initiate the call
    const result = await initiateClickToCall(
      token,
      agentNumber,
      destinationNumber,
      callerId
    );

    return result;
  } catch (error) {
    console.error('Error in makeSmartfloCall:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete call',
    };
  }
};

interface CallRecord {
  id?: string;
  from?: string;
  to?: string;
  duration?: number;
  status?: string;
  timestamp?: string;
  direction?: string;
  [key: string]: unknown;
}

interface CallRecordsResponse {
  count: number;
  limit: number;
  size: number;
  page: number;
  results: CallRecord[];
}

/**
 * Fetch call records from Smartflo API
 */
export const fetchCallRecords = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  callType?: string,
  direction?: string
): Promise<CallRecordsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (callType) params.append('call_type', callType);
    if (direction) params.append('direction', direction);

    const response = await fetch(`${SMARTFLO_BASE_URL}/call/records?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call records: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if API returned success: false (invalid/expired token)
    if (data.success === false) {
      throw new Error(`Invalid token: ${data.message || 'Token is invalid or expired'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching call records:', error);
    throw error;
  }
};

/**
 * Fetch total calls count
 */
export const fetchTotalCalls = async (token: string): Promise<number> => {
  try {
    const data = await fetchCallRecords(token, 1, 1);
    return data.count;
  } catch (error) {
    console.error('Error fetching total calls:', error);
    // Re-throw error with proper message if it's a token issue
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid token')) {
      throw new Error('Invalid token provided');
    }
    throw error;
  }
};

/**
 * Fetch total connected calls (call_type=c, direction=outbound)
 */
export const fetchConnectedCalls = async (token: string): Promise<number> => {
  try {
    const data = await fetchCallRecords(token, 1, 1, 'c', 'outbound');
    return data.count;
  } catch (error) {
    console.error('Error fetching connected calls:', error);
    // Re-throw error to propagate token validation failures
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid token')) {
      throw new Error('Invalid token provided');
    }
    throw error;
  }
};

/**
 * Fetch unanswered calls (call_type=m, direction=outbound)
 */
export const fetchUnansweredCalls = async (token: string): Promise<number> => {
  try {
    const data = await fetchCallRecords(token, 1, 1, 'm', 'outbound');
    return data.count;
  } catch (error) {
    console.error('Error fetching unanswered calls:', error);
    // Re-throw error to propagate token validation failures
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid token')) {
      throw new Error('Invalid token provided');
    }
    throw error;
  }
};

/**
 * Fetch incoming calls (call_type=c, direction=inbound)
 */
export const fetchIncomingCalls = async (token: string): Promise<number> => {
  try {
    const data = await fetchCallRecords(token, 1, 1, 'c', 'inbound');
    return data.count;
  } catch (error) {
    console.error('Error fetching incoming calls:', error);
    // Re-throw error to propagate token validation failures
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid token')) {
      throw new Error('Invalid token provided');
    }
    throw error;
  }
};

/**
 * Fetch missed calls (call_type=m, direction=inbound)
 */
export const fetchMissedCalls = async (token: string): Promise<number> => {
  try {
    const data = await fetchCallRecords(token, 1, 1, 'm', 'inbound');
    return data.count;
  } catch (error) {
    console.error('Error fetching missed calls:', error);
    // Re-throw error to propagate token validation failures
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid token')) {
      throw new Error('Invalid token provided');
    }
    throw error;
  }
};

export const smartfloService = {
  generateToken: generateSmartfloToken,
  refreshToken: refreshSmartfloToken,
  fetchNumbers: fetchSmartfloNumbers,
  initiateCall: initiateClickToCall,
  makeCall: makeSmartfloCall,
  fetchCallRecords: fetchCallRecords,
  fetchTotalCalls: fetchTotalCalls,
  fetchConnectedCalls: fetchConnectedCalls,
  fetchUnansweredCalls: fetchUnansweredCalls,
  fetchIncomingCalls: fetchIncomingCalls,
  fetchMissedCalls: fetchMissedCalls,
};
