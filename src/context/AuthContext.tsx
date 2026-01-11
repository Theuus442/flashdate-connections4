import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser } from '@/lib/auth.service';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Get user role from the users table in Supabase
 * Falls back to 'client' if unable to fetch from database
 */
const getUserRoleFromDatabase = async (email: string): Promise<'admin' | 'client'> => {
  if (!isSupabaseConfigured() || !supabase) {
    return 'client';
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();

    if (error) {
      console.warn('Could not fetch user role from database (this is normal if RLS is enabled):', error?.message);
      return 'client';
    }

    const role = (data?.role || 'client') as 'admin' | 'client';
    console.log(`User role fetched from database: ${role}`);
    return role;
  } catch (error) {
    console.warn('Error getting user role from database:', error);
    return 'client';
  }
};

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
        // Try to get role from user metadata first
        let role = (authUser.role || 'client') as 'admin' | 'client';

        // If role is not in metadata, fetch from database
        if (role === 'client' || !authUser.role) {
          role = await getUserRoleFromDatabase(authUser.email);
        }

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
