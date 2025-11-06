import { ErrorHandler, RetryHandler } from '@/utils/errorHandling';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { User } from '../types/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on app startup
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await RetryHandler.withRetry(
        () => authService.getCurrentUser(),
        2, // Max 2 retries for initialization
        500 // 500ms delay
      );
      setUser(currentUser);
    } catch (error) {
      const appError = ErrorHandler.mapError(error);
      ErrorHandler.logError(appError, 'AuthContext.initializeAuth');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await authService.login({ email, password });
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        const error = new Error(result.error || 'Login failed');
        const appError = ErrorHandler.mapError(error);
        ErrorHandler.logError(appError, 'AuthContext.login');
        throw error;
      }
    } catch (error) {
      setUser(null);
      const appError = ErrorHandler.mapError(error);
      ErrorHandler.logError(appError, 'AuthContext.login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await authService.signup({ 
        name, 
        email, 
        password, 
        confirmPassword: password 
      });
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        const error = new Error(result.error || 'Signup failed');
        const appError = ErrorHandler.mapError(error);
        ErrorHandler.logError(appError, 'AuthContext.signup');
        throw error;
      }
    } catch (error) {
      setUser(null);
      const appError = ErrorHandler.mapError(error);
      ErrorHandler.logError(appError, 'AuthContext.signup');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      const appError = ErrorHandler.mapError(error);
      ErrorHandler.logError(appError, 'AuthContext.logout');
      // Even if logout fails, clear local state
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await RetryHandler.withRetry(
        () => authService.getCurrentUser(),
        1, // Max 1 retry for refresh
        1000 // 1s delay
      );
      setUser(currentUser);
    } catch (error) {
      const appError = ErrorHandler.mapError(error);
      ErrorHandler.logError(appError, 'AuthContext.refreshUser');
      setUser(null);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}