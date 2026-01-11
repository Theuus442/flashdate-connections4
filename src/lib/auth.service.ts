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

      console.log('[signIn] Auth response received');

      if (error) {
        console.error('[signIn] Auth error:', error.message);
        throw error;
      }

      if (data.user) {
        console.log('[signIn] Success, user ID:', data.user.id);

        // Ensure user has role in metadata by fetching from users table
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (userData?.role && !data.user.user_metadata?.role) {
            console.log('[signIn] Updating user metadata with role:', userData.role);
            await supabase.auth.updateUser({
              data: {
                ...data.user.user_metadata,
                role: userData.role,
              }
            });
          }
        } catch (err) {
          console.warn('[signIn] Could not update metadata:', err);
          // Continue anyway, the onAuthStateChange will handle it
        }
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('[signIn] Caught error:', error);
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
      console.log('[onAuthStateChange] Event:', event, 'Session:', !!session?.user);

      if (session?.user) {
        console.log('[onAuthStateChange] User detected:', session.user.id, session.user.email);
        let role: 'admin' | 'client' = 'client';

        // Check metadata first
        const metadataRole = session.user.user_metadata?.role;
        if (metadataRole) {
          console.log('[onAuthStateChange] Role found in metadata:', metadataRole);
          role = metadataRole as 'admin' | 'client';
        } else {
          // Try to fetch user role from database
          console.log('[onAuthStateChange] No role in metadata, querying users table...');
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!error && userData?.role) {
              console.log('[onAuthStateChange] Role found in database:', userData.role);
              role = userData.role as 'admin' | 'client';
            } else {
              console.warn('[onAuthStateChange] No user record found, using default role');
              role = 'client';
            }
          } catch (err) {
            console.error('[onAuthStateChange] Error querying database:', err);
            role = 'client';
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
