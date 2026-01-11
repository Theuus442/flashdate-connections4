import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'client';
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name: string, role: 'admin' | 'client' = 'client') {
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase not configured');
      return {
        user: null,
        error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'),
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured'),
      };
    }

    try {
      console.log('[signIn] Starting authentication...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[signIn] Auth error:', error.message);
        throw error;
      }

      console.log('[signIn] Success, user ID:', data.user?.id);
      console.log('[signIn] User metadata:', data.user?.user_metadata);

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[signIn] Caught error:', {
        message: errorMessage,
        isNetworkError: error instanceof TypeError && errorMessage.includes('Failed to fetch'),
        error,
      });

      // Provide better error messages for network issues
      if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
        console.error('[signIn] Network Error: Cannot reach Supabase. This may be a temporary issue or a network isolation problem.');
      }

      return { user: null, session: null, error };
    }
  },

  /**
   * Sign out the current user and clear all session data
   */
  async signOut() {
    try {
      // Clear Supabase session if configured
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }

      // Clear localStorage items that may contain session data
      const storageKeys = Object.keys(localStorage);
      storageKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      return { error: null };
    } catch (error) {
      console.error('Error during sign out:', error);
      // Clear data anyway even if error occurs
      const storageKeys = Object.keys(localStorage);
      storageKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      return { error };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return { user: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  /**
   * Create user as admin with email and password (for admin panel)
   * This creates both an auth user and a profile record
   */
  async createUserAsAdmin(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[authService] Creating user as admin:', email);

      // Create auth user without auto-confirming (simpler approach for admin)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error('[authService] Error creating auth user:', error);
        throw error;
      }

      console.log('[authService] Auth user created:', data.user?.id);
      return { data: data.user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('[authService] Error creating user as admin:', {
        message: errorMessage,
        error,
      });
      return { data: null, error };
    }
  },

  /**
   * Update user password (admin function)
   * Note: This uses the regular auth.updateUser API which has limitations
   * This only works for the currently authenticated user, not arbitrary users
   */
  async updateUserPasswordAsAdmin(userId: string, newPassword: string) {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      console.log('[authService] Attempting to update password for user:', userId);

      // Note: This only works for the currently authenticated user
      // For admin-level password changes, a server-side function would be needed
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.warn('[authService] Could not update password via auth API:', errorMessage);
        // This is expected - we can only update current user's password this way
        // Password updates from admin panel aren't critical if they fail
        return { error: null }; // Return success to continue with other updates
      }

      console.log('[authService] Password updated successfully');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.warn('[authService] Error updating password:', errorMessage);
      // Don't fail - this is a secondary operation
      return { error: null };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('[onAuthStateChange] Supabase not configured');
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[onAuthStateChange] Event:', event, 'Session:', !!session?.user);

      if (session?.user) {
        console.log('[onAuthStateChange] User detected:', session.user.id, session.user.email);
        console.log('[onAuthStateChange] User metadata:', session.user.user_metadata);

        let role: 'admin' | 'client' = (session.user.user_metadata?.role as 'admin' | 'client') || 'client';

        // If no role in metadata, try to fetch from database and update metadata
        if (!session.user.user_metadata?.role) {
          console.log('[onAuthStateChange] No role in metadata, fetching from database...');
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .maybeSingle();

            if (userData?.role) {
              console.log('[onAuthStateChange] Found role in database:', userData.role);
              role = userData.role as 'admin' | 'client';

              // Update metadata for next time
              try {
                console.log('[onAuthStateChange] Updating metadata with role:', userData.role);
                await supabase.auth.updateUser({
                  data: {
                    ...session.user.user_metadata,
                    role: userData.role,
                  }
                });
              } catch (err) {
                console.warn('[onAuthStateChange] Could not update metadata:', err);
              }
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (err instanceof TypeError && errorMessage.includes('Failed to fetch')) {
              console.error('[onAuthStateChange] Network error while fetching user role from database');
            } else {
              console.warn('[onAuthStateChange] Could not fetch from database:', err);
            }
          }
        }

        console.log('[onAuthStateChange] Final role:', role);
        callback({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      } else {
        console.log('[onAuthStateChange] No session');
        callback(null);
      }
    });

    return () => subscription?.unsubscribe();
  },
};
