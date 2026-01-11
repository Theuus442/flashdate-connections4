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

      console.log('[signIn] Success, user ID:', data.user?.id);
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
        console.log('[onAuthStateChange] User detected, checking role...');
        let role: 'admin' | 'client' = 'client';

        // First check if role is in user metadata (set during signup)
        const metadataRole = session.user.user_metadata?.role as 'admin' | 'client' | undefined;
        if (metadataRole) {
          console.log('[onAuthStateChange] Role found in metadata:', metadataRole);
          role = metadataRole;
        } else {
          // If no role in metadata, try to fetch from database
          try {
            console.log('[onAuthStateChange] Querying users table for role...');
            const { data: userData, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single();

            console.log('[onAuthStateChange] Query result:', { hasRole: !!userData?.role, error: error?.message });

            if (!error && userData?.role) {
              console.log('[onAuthStateChange] Role found in database:', userData.role);
              role = userData.role as 'admin' | 'client';
            } else if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
              // User doesn't exist in users table, create automatically with role from metadata or default
              console.log('[onAuthStateChange] User not found in database, creating automatically...');
              try {
                const userRole = metadataRole || 'client';
                const { data: newUser, error: createError } = await supabase
                  .from('users')
                  .insert([{
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    username: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'user',
                    gender: 'Outro',
                    role: userRole,
                  }])
                  .select('role')
                  .single();

                if (createError) {
                  console.error('[onAuthStateChange] Error creating user:', createError.message);
                  role = 'client';
                } else if (newUser?.role) {
                  console.log('[onAuthStateChange] User created successfully with role:', newUser.role);
                  role = newUser.role as 'admin' | 'client';
                }
              } catch (createErr) {
                console.error('[onAuthStateChange] Error creating user:', createErr);
                role = 'client';
              }
            } else {
              console.warn('[onAuthStateChange] No role found in database, using default');
              role = 'client';
            }
          } catch (err) {
            console.error('[onAuthStateChange] Query error:', err);
            role = 'client';
          }
        }

        console.log('[onAuthStateChange] Calling callback with role:', role);
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
