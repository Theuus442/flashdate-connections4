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

// Fallback for local development without Supabase
const TEST_CREDENTIALS = [
  { 
    email: 'admin@flashdate.com', 
    password: 'admin123', 
    role: 'admin' as const,
    id: '1',
    name: 'Admin User'
  },
  { 
    email: 'cliente@flashdate.com', 
    password: 'cliente123', 
    role: 'client' as const,
    id: '2',
    name: 'Cliente User'
  },
];

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name: string, role: 'admin' | 'client' = 'client') {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock auth');
      return {
        user: { id: Date.now().toString(), email, role },
        error: null,
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
      console.warn('[AUTH] Supabase not configured, using test credentials');
      // Fallback to test credentials
      const testUser = TEST_CREDENTIALS.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (testUser) {
        return {
          user: {
            id: testUser.id,
            email: testUser.email,
            user_metadata: { role: testUser.role, name: testUser.name },
          },
          session: { access_token: 'mock-token' },
          error: null,
        };
      }

      return {
        user: null,
        session: null,
        error: new Error('Invalid credentials'),
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

          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 3000)
          );

          // Query by user ID (more reliable than email)
          const queryPromise = supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // Race between query and timeout
          const result = await Promise.race([queryPromise, timeoutPromise]) as any;
          const { data: userData, error } = result;

          if (!error && userData?.role) {
            console.log('[AUTH:STATE] Found role in database:', userData.role);
            role = userData.role as 'admin' | 'client';
          } else {
            // Fallback to 'client' if not found
            console.log('[AUTH:STATE] Role not found in database, using default: client', error?.message);
            role = 'client';
          }
        } catch (err) {
          // If there's an error or timeout, use 'client' as default
          console.warn('[AUTH:STATE] Error fetching role (timeout or error):', err instanceof Error ? err.message : err);
          role = 'client';
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
