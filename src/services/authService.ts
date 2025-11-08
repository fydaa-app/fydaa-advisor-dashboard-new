const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get token from cookies
// const getAuthToken = (): string | null => {
//   if (typeof window !== 'undefined') {
//     const cookies = document.cookie.split(';');
//     const authCookie = cookies.find(cookie => 
//       cookie.trim().startsWith('authToken=')
//     );
//     return authCookie ? authCookie.split('=')[1] : null;
//   }
//   return null;
// };

// Helper function to handle 401 responses
// const handleUnauthorized = () => {
//   if (typeof window !== 'undefined') {
//     document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     window.location.href = '/signin';
//   }
// };

export interface LoginResponse {
  message: string;
  token: string;
  advisor: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    experienceInYears: number;
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/referrals/login-advisor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed. Please try again.");
  }

  return data;
};

/**
 * Forgot password - request password reset link
 */
export const forgotPassword = async (email: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_URL}/referrals/forgot-password-advisor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Something went wrong',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      message: 'Failed to connect to server',
    };
  }
};

/**
 * Reset password with token
 */
export const resetPasswordWithToken = async (
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_URL}/referrals/reset-password-with-token-advisor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to reset password',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: 'Failed to connect to server',
    };
  }
};

/**
 * Validate reset token
 */
export const validateResetToken = async (token: string): Promise<{ isValid: boolean; email?: string | null }> => {
  try {
    const response = await fetch(`${API_URL}${process.env.NEXT_PUBLIC_VALIDATE_RESET_TOKEN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return { isValid: false, email: null };
    }

    return await response.json();
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, email: null };
  }
};

