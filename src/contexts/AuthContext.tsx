import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, DBUser } from '@/lib/database';

export type UserRole = 'owner' | 'admin' | 'staff' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const dbUserToUser = (dbUser: DBUser): User => ({
  id: dbUser.id,
  email: dbUser.email,
  name: dbUser.name,
  role: dbUser.role,
  storageUsed: dbUser.storageUsed,
  storageLimit: dbUser.storageLimit,
  createdAt: new Date(dbUser.createdAt),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sessão ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        await db.init();
        const session = await db.getCurrentSession();
        
        if (session) {
          const dbUser = await db.getUserById(session.userId);
          if (dbUser) {
            setUser(dbUserToUser(dbUser));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.init();
      const dbUser = await db.getUserByEmail(email.toLowerCase());

      if (!dbUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      if (dbUser.password !== password) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Criar sessão
      await db.createSession(dbUser.id);
      setUser(dbUserToUser(dbUser));

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.init();

      // Verificar se email já existe
      const existingUser = await db.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Email já cadastrado' };
      }

      // Criar novo usuário
      const newUser: DBUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        password,
        name,
        role: 'user',
        storageUsed: 0,
        storageLimit: 15 * 1024 * 1024 * 1024, // 15GB
        createdAt: new Date().toISOString(),
      };

      await db.createUser(newUser);
      await db.createSession(newUser.id);
      setUser(dbUserToUser(newUser));

      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro ao criar conta' };
    }
  };

  const logout = async () => {
    try {
      const session = await db.getCurrentSession();
      if (session) {
        await db.deleteSession(session.id);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const dbUser = await db.getUserById(user.id);
      if (dbUser) {
        setUser(dbUserToUser(dbUser));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout, 
        register,
        refreshUser 
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
