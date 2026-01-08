import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp: string;
  gender: 'M' | 'F' | 'Outro';
  profileImage?: string;
}

interface UsersContextType {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: User) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Maria Silva',
    username: 'maria.silva',
    email: 'maria@example.com',
    whatsapp: '(11) 98765-4321',
  },
  {
    id: '2',
    name: 'João Santos',
    username: 'joao.santos',
    email: 'joao@example.com',
    whatsapp: '(11) 99876-5432',
  },
  {
    id: '3',
    name: 'Ana Costa',
    username: 'ana.costa',
    email: 'ana@example.com',
    whatsapp: '(11) 98765-5321',
  },
  {
    id: '4',
    name: 'Carlos Mendes',
    username: 'carlos.mendes',
    email: 'carlos@example.com',
    whatsapp: '(11) 97654-3210',
  },
  {
    id: '5',
    name: 'Beatriz Lima',
    username: 'beatriz.lima',
    email: 'beatriz@example.com',
    whatsapp: '(11) 96543-2109',
  },
  {
    id: '6',
    name: 'Roberto Alves',
    username: 'roberto.alves',
    email: 'roberto@example.com',
    whatsapp: '(11) 95432-1098',
  },
];

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (id: string, updatedUser: User) => {
    setUsers(prev =>
      prev.map(user => (user.id === id ? updatedUser : user))
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
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
