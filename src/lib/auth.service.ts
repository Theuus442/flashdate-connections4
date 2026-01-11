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
    console.log('[AUTH] Sign in attempt:', email);

    if (!isSupabaseConfigured()) {
      console.error('[AUTH] ❌ Supabase not configured');
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured'),
      };
    }

    try {
      console.log('[AUTH] Calling Supabase signInWithPassword');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[AUTH] Supabase response received:', { userId: data?.user?.id, hasError: !!error });

      if (error) {
        console.error('[AUTH] Supabase auth error:', error);
        throw error;
      }

      // Don't query the database during sign in - let onAuthStateChange handle it
      // This avoids timeout issues and makes the login flow faster
      // The role will be fetched and set by onAuthStateChange
      console.log('[AUTH] Sign in successful, role will be fetched by onAuthStateChange');
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('[AUTH] Sign in failed:', error);
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
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Try to get role from database first (most reliable source)
        let role: 'admin' | 'client' = 'client';

        console.log('[AUTH:STATE] Auth state change detected for user:', session.user.id);

        try {
          console.log('[AUTH:STATE] Querying database for user role...');

          // Query by user ID
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('[AUTH:STATE] ❌ User not found in database:', error.message);
            throw error;
          }

          if (userData?.role) {
            console.log('[AUTH:STATE] ✅ Found role in database:', userData.role);
            role = userData.role as 'admin' | 'client';
          } else {
            console.error('[AUTH:STATE] ❌ No role found in user record');
            throw new Error('User record exists but has no role');
          }
        } catch (err) {
          console.error('[AUTH:STATE] ❌ Error fetching user role:', err instanceof Error ? err.message : err);
          throw err;
        }

        console.log('[AUTH:STATE] Callback with role:', role);
        callback({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      } else {
        console.log('[AUTH:STATE] No session, clearing user');
        callback(null);
      }
    });

    return () => subscription?.unsubscribe();
  },
};
