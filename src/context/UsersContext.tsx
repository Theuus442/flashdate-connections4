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
}

interface UsersContextType {
  users: User[];
  addUser: (user: Omit<User, 'id'>, profileImage?: File) => Promise<User | null>;
  updateUser: (id: string, user: Partial<User>, profileImage?: File) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
  isLoading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Mock initial users for fallback
const initialUsers: User[] = [
  {
    id: '1',
    name: 'Maria Silva',
    username: 'maria.silva',
    email: 'maria@example.com',
    whatsapp: '(11) 98765-4321',
    gender: 'F',
    role: 'client',
  },
  {
    id: '2',
    name: 'João Santos',
    username: 'joao.santos',
    email: 'joao@example.com',
    whatsapp: '(11) 99876-5432',
    gender: 'M',
    role: 'client',
  },
  {
    id: '3',
    name: 'Ana Costa',
    username: 'ana.costa',
    email: 'ana@example.com',
    whatsapp: '(11) 98765-5321',
    gender: 'F',
    role: 'admin',
  },
  {
    id: '4',
    name: 'Carlos Mendes',
    username: 'carlos.mendes',
    email: 'carlos@example.com',
    whatsapp: '(11) 97654-3210',
    gender: 'M',
    role: 'client',
  },
  {
    id: '5',
    name: 'Beatriz Lima',
    username: 'beatriz.lima',
    email: 'beatriz@example.com',
    whatsapp: '(11) 96543-2109',
    gender: 'F',
    role: 'client',
  },
  {
    id: '6',
    name: 'Roberto Alves',
    username: 'roberto.alves',
    email: 'roberto@example.com',
    whatsapp: '(11) 95432-1098',
    gender: 'M',
    role: 'client',
  },
];

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseConfigured = isSupabaseConfigured();

  // Load users from Supabase on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (!supabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await usersService.getUsers();
        if (error) {
          console.error('Error loading users:', error);
          // Use fallback mock data if there's an error
          setUsers(initialUsers);
        } else if (data && data.length > 0) {
          setUsers(data);
        } else {
          // Use fallback mock data if no users found in database
          console.warn('No users found in database, using fallback mock data');
          setUsers(initialUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Use fallback mock data on exception
        setUsers(initialUsers);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [supabaseConfigured]);

  const addUser = async (user: Omit<User, 'id'>, profileImage?: File) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
      };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }

    try {
      const { data, error } = await usersService.createUser(user, profileImage);
      if (error) {
        console.error('Error adding user:', error);
        return null;
      }
      if (data) {
        setUsers(prev => [...prev, data]);
        return data;
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
    return null;
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
      const { data, error } = await usersService.updateUser(id, updates, profileImage);
      if (error) {
        console.error('Error updating user:', error);
        return null;
      }
      if (data) {
        setUsers(prev => prev.map(u => (u.id === id ? data : u)));
        return data;
      }
    } catch (error) {
      console.error('Error updating user:', error);
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

  const value: UsersContextType = {
    users,
    addUser,
    updateUser,
    deleteUser,
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
