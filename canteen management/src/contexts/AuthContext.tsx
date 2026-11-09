import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authService, DEMO_USERS } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    password?: string;
  }) => Promise<User>;
  switchRole: (role: UserRole) => Promise<void>;
  topUpWallet: (amount: number) => Promise<number>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS.STUDENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await authService.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    password?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const u = await authService.register(data);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    const u = await authService.switchRole(newRole);
    setUser(u);
  };

  const topUpWallet = async (amount: number): Promise<number> => {
    const newBal = await authService.topUpWallet(amount);
    if (user) {
      setUser({ ...user, walletBalance: newBal });
    }
    return newBal;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'STUDENT',
        isLoading,
        login,
        register,
        switchRole,
        topUpWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

