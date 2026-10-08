import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile } from '../types';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  requestPasswordReset,
  confirmPasswordReset,
  updateUserProfile,
  changeUserPassword,
  getStoredToken
} from '../services/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, confirmPass?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; demoResetCode?: string }>;
  resetPassword: (email: string, code: string, newPass: string, confirmPass?: string) => Promise<void>;
  updateProfile: (name: string, role?: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string, confirmPass?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored session token on initial mount
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getStoredToken();
      if (token) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    if (res.user) {
      setUser(res.user);
    }
  };

  const register = async (name: string, email: string, pass: string, confirmPass?: string) => {
    const res = await registerUser(name, email, pass, confirmPass);
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    return await requestPasswordReset(email);
  };

  const resetPassword = async (email: string, code: string, newPass: string, confirmPass?: string) => {
    await confirmPasswordReset(email, code, newPass, confirmPass);
  };

  const updateProfile = async (name: string, role?: string) => {
    const updated = await updateUserProfile(name, role);
    setUser(updated);
  };

  const changePassword = async (currentPass: string, newPass: string, confirmPass?: string) => {
    await changeUserPassword(currentPass, newPass, confirmPass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword
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
