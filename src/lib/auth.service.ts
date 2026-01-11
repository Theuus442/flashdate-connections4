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
    if (!isSupabaseConfigured()) {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After successful login, try to get the user's role from the users table
      // This handles cases where the user was created via admin panel
      if (data.user) {
        try {
          // Simple, direct query with timeout protection
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id) // Query by auth user ID (more reliable)
            .single();

          clearTimeout(timeoutId);

          if (!userError && userData?.role) {
            // Update the user object with the role from database
            if (data.user.user_metadata) {
              data.user.user_metadata.role = userData.role;
            } else {
              data.user.user_metadata = { role: userData.role };
            }
          } else {
            // Default to 'client' if not found or error
            console.log('Role not found in database, using default', userError?.message);
            if (data.user.user_metadata) {
              data.user.user_metadata.role = 'client';
            } else {
              data.user.user_metadata = { role: 'client' };
            }
          }
        } catch (err) {
          console.warn('Error fetching user role:', err);
          // Continue with login, set default role
          if (data.user.user_metadata) {
            data.user.user_metadata.role = 'client';
          } else {
            data.user.user_metadata = { role: 'client' };
          }
        }
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
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

        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .single();

          if (!error && userData?.role) {
            role = userData.role as 'admin' | 'client';
          } else {
            // Fallback to user metadata if not found in database
            role = (session.user.user_metadata?.role || 'client') as 'admin' | 'client';
          }
        } catch (err) {
          // If there's an error querying database, use metadata
          role = (session.user.user_metadata?.role || 'client') as 'admin' | 'client';
        }

        callback({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      } else {
        callback(null);
      }
    });

    return () => subscription?.unsubscribe();
  },
};
