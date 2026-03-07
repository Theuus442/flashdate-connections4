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
      console.log('[AuthContext:signIn] Starting sign in...');
      const { user: authUser, error } = await authService.signIn(email, password);

      console.log('[AuthContext:signIn] Service returned:', { hasUser: !!authUser, hasError: !!error });

      if (error) {
        console.error('[AuthContext:signIn] Error:', error);

        // Provide more helpful error messages
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
          };
        }
        if (errorMsg.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Por favor, confirme seu email antes de fazer login.'
          };
        }
        if (errorMsg.includes('Network') || errorMsg.includes('Failed to fetch')) {
          return {
            success: false,
            error: 'Erro de conexão. Verifique sua internet e tente novamente.'
          };
        }

        return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
      }

      if (authUser) {
        const roleFromMetadata = authUser.user_metadata?.role;
        const role = (roleFromMetadata || 'client') as 'admin' | 'client';

        console.log('[AuthContext:signIn] Setting user state:', { id: authUser.id, role });
        setUser({
          id: authUser.id,
          email: authUser.email,
          role,
        });
        return { success: true };
      }

      console.log('[AuthContext:signIn] No user returned');
      return { success: false, error: 'Falha ao fazer login' };
    } catch (err) {
      console.error('[AuthContext:signIn] Caught error:', err);
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
