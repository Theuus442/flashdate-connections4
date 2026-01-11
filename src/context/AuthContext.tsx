import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '@/lib/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      if (authUser) {
        // Use role from auth metadata (set during signup/login)
        const role = (authUser.role || 'client') as 'admin' | 'client';

        setUser({
          id: authUser.id,
          email: authUser.email,
          role,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser, error } = await authService.signIn(email, password);

      if (error) {
        return { success: false, error: 'Email ou senha inválidos' };
      }

      if (authUser) {
        // Get role from user metadata (set during signin or from database lookup)
        const role = (authUser.user_metadata?.role || 'client') as 'admin' | 'client';

        setUser({
          id: authUser.id,
          email: authUser.email,
          role,
        });
        return { success: true };
      }

      return { success: false, error: 'Falha ao fazer login' };
    } catch (err) {
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
