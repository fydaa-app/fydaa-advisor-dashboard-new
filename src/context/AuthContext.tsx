"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter, usePathname } from 'next/navigation';
// Define types
interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: Employee) => void;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Logout function (wrapped with useCallback)
  const handleLogout = useCallback(() => {
    console.log("Logging out user");
    setUser(null);
    setToken(null);
    deleteCookie('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('advisorData');
    localStorage.removeItem("selectedDesignation");
    localStorage.removeItem("selectedEmployee");
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }, []); // No dependencies to prevent re-creation

  // Check if user is authenticated - only on app mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      
      const authToken = getCookie('authToken') as string | undefined;
      
      if (authToken) {
        try {
          const userInfoString = localStorage.getItem('userInfo');
          
          if (!userInfoString) {
            console.warn('Token exists but no userInfo - might be during app initialization');
            setIsLoading(false);
            return;
          }
          
          const userData = JSON.parse(userInfoString);

          // Validate userData has required properties
          if (!userData?.id || !userData?.role) {
            console.error('Invalid user data, logging out');
            handleLogout();
            return;
          }

          setUser(userData);
          setToken(authToken);
        } catch (error) {
          console.error('Error parsing user data:', error);
          handleLogout();
        }
      } else {
        // No token found - will be handled by protected routes
        console.warn('No auth token found on app mount');
      }

      setIsLoading(false);
    }
  }, []); // Only run on mount, not on pathname changes

  // Handle redirects when authenticated user visits auth pages
  useEffect(() => {
    if (token && (pathname === '/signin' || pathname === '/signup')) {
      console.log('✅ AuthContext: Authenticated user on auth page, redirecting to dashboard');
      router.replace('/');
    }
  }, [token, pathname, router]);

  // Login function
  const login = (newToken: string, userData: Employee) => {
    // Save to localStorage first (synchronous)
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem("selectedDesignation", userData?.role?.toString() ?? '');
    localStorage.setItem("selectedEmployee", userData?.id?.toString() ?? '');
    
    // Update state - React will batch these updates
    setToken(newToken);
    setUser(userData);
    
    // Use a small delay to ensure state updates are processed and components re-render
    // This prevents race conditions where ProtectedRoute checks isAuthenticated before state updates
    setTimeout(() => {
      router.replace('/');
    }, 50);
  };


  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
