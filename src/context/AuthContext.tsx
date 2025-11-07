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
    setUser(null);
    setToken(null);
    deleteCookie('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem("selectedDesignation");
    localStorage.removeItem("selectedEmployee");
    router.push('/signin');
  }, [router]);

  // Check if user is authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      
      const authToken = getCookie('authToken') as string | undefined;
      
      if (authToken) {
        try {
          const userInfoString = localStorage.getItem('userInfo');
          
          // If we have a token but no userInfo, don't log out immediately
          // This might happen during login before localStorage is set
          if (!userInfoString) {
            setIsLoading(false);
            return;
          }
          
          const userData = JSON.parse(userInfoString);

          // Validate userData has required properties
          if (!userData?.id || !userData?.role) {
            handleLogout();
            return;
          }

          setUser(userData);
          setToken(authToken);

          // Redirect if on auth pages
          if (pathname === '/signin' || pathname === '/signup') {
            router.replace('/');
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          handleLogout();
        }
      } else {
        // No token found - redirect to signin if on protected route
        const publicPaths = ['/signin', '/signup', '/reset-password', '/forgotpassword'];
        if (!publicPaths.includes(pathname) && pathname !== '/') {
          router.replace('/signin');
        }
      }

      setIsLoading(false);
    }
  }, [pathname, router, handleLogout]);


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
