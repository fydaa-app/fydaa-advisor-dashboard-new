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

export const smartfloService = {
  generateToken: generateSmartfloToken,
  fetchNumbers: fetchSmartfloNumbers,
  initiateCall: initiateClickToCall,
  makeCall: makeSmartfloCall,
};
