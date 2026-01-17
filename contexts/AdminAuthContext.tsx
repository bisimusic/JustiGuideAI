"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_auth') === 'true';
    }
    return false;
  });

  // Listen for localStorage changes (handles cross-tab sync and manual updates)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkAuth = () => {
      const authStatus = localStorage.getItem('admin_auth') === 'true';
      setIsAuthenticated(authStatus);
    };

    // Check on mount
    checkAuth();

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', checkAuth);
    
    // Also check periodically in case of manual localStorage changes
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include', // Important: include cookies for session
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_auth', 'true');
          }
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_auth');
    }
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
