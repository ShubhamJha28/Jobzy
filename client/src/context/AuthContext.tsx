import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  avatar?: string;
  candidateProfile?: any;
  recruiterProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isImpersonating: boolean;
  login: (email: string, password: string, role?: 'CANDIDATE' | 'RECRUITER') => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  impersonate: (target: { email?: string; userId?: string }) => Promise<User>;
  exitImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jobzy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jobzy_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => !!localStorage.getItem('jobzy_admin_backup'));

  const refreshUser = async () => {
    if (!localStorage.getItem('jobzy_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ success: boolean; user: User }>('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('jobzy_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, role?: 'CANDIDATE' | 'RECRUITER'): Promise<User> => {
    const res = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    localStorage.setItem('jobzy_token', res.token);
    localStorage.setItem('jobzy_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: any): Promise<User> => {
    const res = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    localStorage.setItem('jobzy_token', res.token);
    localStorage.setItem('jobzy_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('jobzy_token');
    localStorage.removeItem('jobzy_user');
    localStorage.removeItem('jobzy_admin_backup');
    setToken(null);
    setUser(null);
    setIsImpersonating(false);
  };

  const impersonate = async (target: { email?: string; userId?: string }): Promise<User> => {
    if (!localStorage.getItem('jobzy_admin_backup')) {
      const currentToken = localStorage.getItem('jobzy_token');
      const currentUser = localStorage.getItem('jobzy_user');
      if (currentToken && currentUser) {
        localStorage.setItem(
          'jobzy_admin_backup',
          JSON.stringify({ token: currentToken, user: JSON.parse(currentUser) })
        );
      }
    }

    const res = await apiRequest<{ success: boolean; token: string; user: User }>('/admin/impersonate', {
      method: 'POST',
      body: JSON.stringify(target),
    });

    localStorage.setItem('jobzy_token', res.token);
    localStorage.setItem('jobzy_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setIsImpersonating(true);
    return res.user;
  };

  const exitImpersonation = () => {
    const backupRaw = localStorage.getItem('jobzy_admin_backup');
    if (backupRaw) {
      try {
        const backup = JSON.parse(backupRaw);
        localStorage.setItem('jobzy_token', backup.token);
        localStorage.setItem('jobzy_user', JSON.stringify(backup.user));
        setToken(backup.token);
        setUser(backup.user);
      } catch (e) {
        console.error('Failed to restore admin session:', e);
      }
    }
    localStorage.removeItem('jobzy_admin_backup');
    setIsImpersonating(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isImpersonating,
        login,
        register,
        logout,
        refreshUser,
        impersonate,
        exitImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
