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
    console.log('[AuthContext] Setting up auth listener');
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      console.log('[AuthContext] Auth state changed:', { hasUser: !!authUser, role: authUser?.role });
      if (authUser) {
        const role = (authUser.role || 'client') as 'admin' | 'client';

        console.log('[AuthContext] Setting user:', { id: authUser.id, email: authUser.email, role });
        setUser({
          id: authUser.id,
          email: authUser.email,
          role,
        });
      } else {
        console.log('[AuthContext] Clearing user');
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
        // Get role from user metadata (which was set during signIn after database lookup)
        const roleFromMetadata = authUser.user_metadata?.role;
        // Default to 'client' only if role is not found
        const role = (roleFromMetadata || 'client') as 'admin' | 'client';

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
