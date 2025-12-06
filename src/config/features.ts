/**
 * Feature flags for the advisor dashboard
 * 
 * Set BACKEND_SUPPORTS_ADVISOR_ID to true when the backend is updated
 * to properly handle the advisorId parameter in API calls.
 */

export const BACKEND_SUPPORTS_ADVISOR_ID = false;

/**
 * When the backend is ready to support advisorId parameter:
 * 1. Change BACKEND_SUPPORTS_ADVISOR_ID to true
 * 2. Test that API calls with advisorId work properly
 * 3. Verify no 401 errors are thrown for valid requests
 * 
 * This will automatically enable real API calls for advisor-specific data
 * in both SipWrapper and TodaySaleWrapperMf components.
 */