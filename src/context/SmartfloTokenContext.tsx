"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { smartfloService } from '@/services';

interface SmartfloTokenContextType {
  token: string | null;
  isTokenValid: boolean;
  isValidating: boolean;
  setToken: (token: string | null) => void;
  validateToken: () => Promise<boolean>;
  clearToken: () => void;
  generateAndSetToken: (email: string, password: string) => Promise<void>;
}

const SmartfloTokenContext = createContext<SmartfloTokenContextType | undefined>(undefined);

const SMARTFLO_TOKEN_KEY = 'smartflo_token';

export function SmartfloTokenProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(SMARTFLO_TOKEN_KEY);
    if (savedToken) {
      setTokenState(savedToken);
    }
  }, []);

  // Validate token whenever it changes
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  // Auto-refresh token every 50 minutes
  useEffect(() => {
    if (!token || !isTokenValid) {
      return;
    }

    const refreshInterval = setInterval(async () => {
      try {
        console.log('Auto-refreshing SmartFlo token...');
        const newToken = await smartfloService.refreshToken(token);
        setToken(newToken);
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, clear the token
        clearToken();
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [token, isTokenValid]);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem(SMARTFLO_TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(SMARTFLO_TOKEN_KEY);
    }
  };

  const validateToken = async (): Promise<boolean> => {
    if (!token) {
      setIsTokenValid(false);
      return false;
    }

    setIsValidating(true);
    try {
      // Try to fetch a minimal amount of data to validate the token
      await smartfloService.fetchTotalCalls(token);
      setIsTokenValid(true);
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Invalid token') || 
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized')) {
        setIsTokenValid(false);
        clearToken();
        return false;
      }
      setIsTokenValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const clearToken = () => {
    setTokenState(null);
    setIsTokenValid(false);
    localStorage.removeItem(SMARTFLO_TOKEN_KEY);
  };

  const generateAndSetToken = async (email: string, password: string) => {
    try {
      const newToken = await smartfloService.generateToken(email, password);
      setToken(newToken);
      setIsTokenValid(true);
    } catch (error) {
      console.error('Failed to generate token:', error);
      throw error;
    }
  };

  return (
    <SmartfloTokenContext.Provider
      value={{
        token,
        isTokenValid,
        isValidating,
        setToken,
        validateToken,
        clearToken,
        generateAndSetToken,
      }}
    >
      {children}
    </SmartfloTokenContext.Provider>
  );
}

export function useSmartfloToken() {
  const context = useContext(SmartfloTokenContext);
  if (context === undefined) {
    throw new Error('useSmartfloToken must be used within a SmartfloTokenProvider');
  }
  return context;
}
