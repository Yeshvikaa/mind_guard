import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Configure Axios defaults
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mind-guard-bcc4.onrender.com/api',
  withCredentials: true
});

interface UserType {
  id: string;
  fullName: string;
  email: string;
  role: 'Employee' | 'Admin' | 'Super Admin';
  company?: string;
  employeeId?: string;
  department?: string;
  companyId?: string;
  phone?: string;
  profilePhoto?: string;
  streak?: number;
  emergencyContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Set token helper
  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    // Inject existing token if present
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
    }
    
    const initializeAuth = async () => {
      if (!existingToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.warn('Initial session validation failed', error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
    } catch (error: any) {
      setToken(null);
      throw new Error(error.response?.data?.error || 'Login failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
    } catch (error: any) {
      setToken(null);
      throw new Error(error.response?.data?.error || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed', err);
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.warn('User reload failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
