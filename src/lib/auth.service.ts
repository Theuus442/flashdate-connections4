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

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
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
        callback({
          id: session.user.id,
          email: session.user.email || '',
          role: (session.user.user_metadata?.role || 'client') as 'admin' | 'client',
        });
      } else {
        callback(null);
      }
    });

    return () => subscription?.unsubscribe();
  },
};
