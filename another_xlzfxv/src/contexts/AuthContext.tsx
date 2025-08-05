import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiService.signIn(email, password);
      const userId = response.data[0][1].id;
      if (response.status === 'success' && response.data) {
        const userData = { id: userId || '1', email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Sign in failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await apiService.signUp(email, password);
      const userId = response.data[0][1].id;
      if (response.status === 'success' && response.data) {
        const userData = { id: userId || '1', email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiService.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      // Even if API call fails, clear local state
      setUser(null);
      localStorage.removeItem('user');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
