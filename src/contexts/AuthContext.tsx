import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for showcase
const demoUsers: Record<string, User> = {
  'owner@cloud.io': {
    id: '1',
    email: 'owner@cloud.io',
    name: 'Carlos Owner',
    role: 'owner',
    storageUsed: 45.2 * 1024 * 1024 * 1024,
    storageLimit: 1024 * 1024 * 1024 * 1024,
    createdAt: new Date('2024-01-01'),
  },
  'admin@cloud.io': {
    id: '2',
    email: 'admin@cloud.io',
    name: 'Ana Admin',
    role: 'admin',
    storageUsed: 28.7 * 1024 * 1024 * 1024,
    storageLimit: 500 * 1024 * 1024 * 1024,
    createdAt: new Date('2024-02-15'),
  },
  'staff@cloud.io': {
    id: '3',
    email: 'staff@cloud.io',
    name: 'Pedro Staff',
    role: 'staff',
    storageUsed: 12.4 * 1024 * 1024 * 1024,
    storageLimit: 100 * 1024 * 1024 * 1024,
    createdAt: new Date('2024-03-20'),
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Demo login - in production, this would call an API
    const demoUser = demoUsers[email.toLowerCase()];
    if (demoUser) {
      setUser(demoUser);
      return;
    }
    
    // Create new user account
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role: 'user',
      storageUsed: 0,
      storageLimit: 15 * 1024 * 1024 * 1024, // 15GB
      createdAt: new Date(),
    };
    setUser(newUser);
  };

  const register = async (email: string, password: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      storageUsed: 0,
      storageLimit: 15 * 1024 * 1024 * 1024,
      createdAt: new Date(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
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
