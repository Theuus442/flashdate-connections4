import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usersService } from '@/lib/users.service';
import { isSupabaseConfigured } from '@/lib/supabase';

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
  updateUser: (id: string, user: Partial<User>, profileImage?: File) => Promise<User | null>;
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
        const { data, error } = await usersService.getUsers();

        if (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[UsersContext] Error loading users:', {
            message: errorMessage,
            isNetworkError: error instanceof TypeError && errorMessage.includes('Failed to fetch'),
            error,
          });

          // If it's a network error, show more helpful message
          if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
            console.error('[UsersContext] Network Error: Cannot reach Supabase. This may be a temporary connectivity issue or a CORS/network isolation problem in your environment.');
          }

          setUsers([]);
        } else if (data) {
          console.log('[UsersContext] Successfully loaded users:', data.length);
          setUsers(data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[UsersContext] Unexpected error loading users:', {
          message: errorMessage,
          error,
        });
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

      const errorMessage = error instanceof Error ? error.message : (error?.message || JSON.stringify(error));
      console.log('[UsersContext] createUser response:', { hasData: !!data, hasError: !!error, errorMessage });

      if (error) {
        console.error('[UsersContext] Error adding user:', errorMessage);
        console.error('[UsersContext] Full error:', error);
        return { data: null, error: errorMessage };
      }
      if (data) {
        console.log('[UsersContext] User created successfully:', data);
        setUsers(prev => [...prev, data]);
        return { data, error: null };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
        return newUser;
      }
      return null;
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
        return null;
      }
      if (data) {
        console.log('[UsersContext] User updated successfully:', data);
        setUsers(prev => prev.map(u => (u.id === id ? data : u)));
        return data;
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error('[UsersContext] Error updating user:', errorMessage);
    }
    return null;
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
