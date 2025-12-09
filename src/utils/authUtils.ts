import Cookies from "js-cookie";

/**
 * Robust auth token retrieval that handles various edge cases
 * including app switching, cookie timing issues, and browser differences
 */
export const getAuthToken = (): string | null => {
  try {
    // First, try js-cookie (most reliable)
    let token = Cookies.get("authToken");
    
    if (token) {
      return token;
    }

    // If js-cookie fails, try direct document.cookie access
    if (typeof window !== 'undefined' && document.cookie) {
      const cookieAuth = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));
      
      if (cookieAuth) {
        token = cookieAuth.split('=')[1];
        console.warn("Found auth token in document.cookie as backup");
        return token;
      }
    }

    // Last resort: check localStorage (though not recommended for auth tokens)
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('authToken');
      if (localToken) {
        console.warn("Found auth token in localStorage as last resort");
        return localToken;
      }
    }

    return null;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

/**
 * Check if user is authenticated without causing side effects
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Safe delay function to prevent race conditions during app switching
 */
export const delayForAppSwitch = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};