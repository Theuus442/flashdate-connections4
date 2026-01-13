import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { usersService } from '@/lib/users.service';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Helper function to safely serialize any error to a readable string
 */
function serializeError(error: any): string {
  if (error === null) return 'No error';
  if (error === undefined) return 'Undefined error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const message = (error.message || error.msg || error.error || error.detail || '').toString();
    const code = (error.code || '').toString();
    const details = (error.details || '').toString();
    const parts = [message, code && `[${code}]`, details].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : JSON.stringify(error);
  }
  return String(error);
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp: string;
  gender: 'M' | 'F' | 'Outro';
  role: 'admin' | 'client';
  profileImage?: string;
  password?: string;
}

interface UsersContextType {
  users: User[];
  addUser: (user: Omit<User, 'id'>, profileImage?: File) => Promise<{ data: User | null; error: string | null }>;
  updateUser: (id: string, user: Partial<User>, profileImage?: File) => Promise<{ data: User | null; error: string | null }>;
  deleteUser: (id: string) => Promise<boolean>;
  deleteAllByRole: (role: 'admin' | 'client') => Promise<{ count: number; error: any }>;
  getUserById: (id: string) => User | undefined;
  refreshUsers: () => Promise<void>;
  isLoading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseConfigured = isSupabaseConfigured();

  // Load users from Supabase on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (!supabaseConfigured) {
        console.log('[UsersContext] Supabase not configured, skipping user load');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[UsersContext] Attempting to load users from Supabase...');

        // Set a longer timeout to account for retries (1s + 2s + 4s = 7s base, plus network latency)
        const loadPromise = (async () => {
          try {
            const { data, error } = await usersService.getUsers();

            if (error) {
              const errorMessage = error instanceof Error
                ? error.message
                : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));

              const isNetworkError =
                (error instanceof TypeError && errorMessage.includes('Failed to fetch')) ||
                errorMessage.includes('Failed to fetch') ||
                errorMessage.includes('Network') ||
                (error instanceof TypeError && errorMessage.includes('fetch'));

              console.error('[UsersContext] ⚠️ Error loading users:', {
                message: errorMessage,
                isNetworkError,
                error,
              });

              // If it's a network error, log helpful info but don't fail
              if (isNetworkError) {
                console.error('[UsersContext] 🌐 NETWORK ERROR: Cannot reach Supabase');
                console.error('[UsersContext] This may be a temporary connectivity issue or environment isolation problem.');
                console.error('[UsersContext] App will continue with empty user list.');
              }

              // In case of network error or any error, return empty array (not an error)
              // This prevents the app from breaking completely
              console.log('[UsersContext] Setting empty user list as fallback');
              setUsers([]);
            } else if (data) {
              console.log('[UsersContext] ✅ Successfully loaded users:', data.length);
              setUsers(data);
            } else {
              console.log('[UsersContext] No data returned, setting empty list');
              setUsers([]);
            }
          } catch (innerError) {
            console.error('[UsersContext] Unexpected error in load promise:', innerError);
            // Don't re-throw - just continue with empty users
            setUsers([]);
          }
        })();

        await loadPromise;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));

        const isNetworkError = error instanceof TypeError && errorMessage.includes('Failed to fetch');
        const isTimeoutError = errorMessage.includes('timeout');

        console.error('[UsersContext] ❌ Unexpected error loading users:', {
          message: errorMessage,
          type: error instanceof TypeError ? 'Network/Fetch Error' : 'Other Error',
          isNetworkError,
          isTimeoutError,
          error,
        });

        if (isNetworkError || isTimeoutError) {
          console.warn('[UsersContext] App will continue with empty user list');
        }

        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [supabaseConfigured]);

  const addUser = async (user: Omit<User, 'id'>, profileImage?: File) => {
    console.log('[UsersContext] addUser called with:', user);

    if (!supabaseConfigured) {
      console.log('[UsersContext] Supabase not configured, using local state');
      // Fallback to local state
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
      };
      setUsers(prev => [...prev, newUser]);
      return { data: newUser, error: null };
    }

    try {
      console.log('[UsersContext] Calling usersService.createUser...');
      const { data, error } = await usersService.createUser(user, profileImage);

      const errorMessage = typeof error === 'string' ? error : serializeError(error);
      console.log('[UsersContext] createUser response:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage
      });

      if (error) {
        console.error('[UsersContext] Error adding user:', errorMessage);
        return { data: null, error: errorMessage };
      }
      if (data) {
        console.log('[UsersContext] User created successfully:', {
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
        });
        setUsers(prev => [...prev, data]);
        return { data, error: null };
      }
    } catch (error) {
      const errorMessage = serializeError(error);
      console.error('[UsersContext] Error adding user:', errorMessage);
      return { data: null, error: errorMessage };
    }
    return { data: null, error: 'Unknown error' };
  };

  const updateUser = async (id: string, updates: Partial<User>, profileImage?: File) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      const updatedUser = users.find(u => u.id === id);
      if (updatedUser) {
        const newUser = { ...updatedUser, ...updates };
        setUsers(prev => prev.map(u => (u.id === id ? newUser : u)));
        return { data: newUser, error: null };
      }
      return { data: null, error: 'User not found' };
    }

    try {
      console.log('[UsersContext] Updating user:', id);
      // Don't pass empty password
      const updatesToSend = { ...updates };
      if (updatesToSend.password === '') {
        delete updatesToSend.password;
      }

      const { data, error } = await usersService.updateUser(id, updatesToSend, profileImage);
      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error)));
        console.error('[UsersContext] Error updating user:', errorMessage);
        return { data: null, error: errorMessage };
      }
      if (data) {
        console.log('[UsersContext] User updated successfully:', data);
        setUsers(prev => prev.map(u => (u.id === id ? data : u)));
        return { data, error: null };
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error('[UsersContext] Error updating user:', errorMessage);
      return { data: null, error: errorMessage };
    }
    return { data: null, error: 'Unknown error' };
  };

  const deleteUser = async (id: string) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    }

    try {
      const { error } = await usersService.deleteUser(id);
      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const refreshUsers = useCallback(async () => {
    if (!supabaseConfigured) {
      console.log('[UsersContext] Supabase not configured, skipping refresh');
      return;
    }

    try {
      console.log('[UsersContext] Refreshing users from Supabase...');

      // Set a timeout but don't use Promise.race (it can cause issues)
      const { data, error } = await usersService.getUsers();

      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));

        const isNetworkError =
          (error instanceof TypeError && errorMessage.includes('Failed to fetch')) ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('Network') ||
          (error instanceof TypeError && errorMessage.includes('fetch'));

        console.error('[UsersContext] ⚠️ Error refreshing users:');
        console.error('[UsersContext]   Message:', errorMessage);
        console.error('[UsersContext]   Type:', typeof error);
        console.error('[UsersContext]   IsNetworkError:', isNetworkError);

        // On network error, keep existing users instead of clearing them
        if (isNetworkError) {
          console.log('[UsersContext] Network error detected, keeping existing users');
        }
        return; // Don't throw - just exit gracefully
      } else if (data) {
        console.log('[UsersContext] ✅ Successfully refreshed users:', data.length);
        setUsers(data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));

      console.error('[UsersContext] ⚠️ Unexpected error during refresh:', {
        message: errorMessage,
        error,
      });

      // Don't clear users on error - keep the existing list
      console.log('[UsersContext] Keeping existing user list despite error');
    }
  }, [supabaseConfigured]);

  const deleteAllByRole = async (role: 'admin' | 'client') => {
    if (!supabaseConfigured) {
      // Fallback to local state
      const filteredUsers = users.filter(u => u.role !== role);
      setUsers(filteredUsers);
      return { count: users.length - filteredUsers.length, error: null };
    }

    try {
      console.log('[UsersContext] Deleting all users with role:', role);
      const result = await usersService.deleteAllByRole(role);

      if (result.error) {
        console.error('[UsersContext] Error deleting users by role:', result.error);
        return result;
      }

      // Update local state to remove deleted users
      setUsers(prev => prev.filter(u => u.role !== role));
      console.log('[UsersContext] Successfully deleted', result.count, 'users with role:', role);

      return result;
    } catch (error) {
      console.error('[UsersContext] Error deleting users by role:', error);
      return { count: 0, error };
    }
  };

  const value: UsersContextType = {
    users,
    addUser,
    updateUser,
    deleteUser,
    deleteAllByRole,
    getUserById,
    refreshUsers,
    isLoading,
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
