import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  whatsapp: string;
  profession: string;
  username: string;
  password: string;
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
    age: 32,
    email: 'maria@example.com',
    whatsapp: '(11) 98765-4321',
    profession: 'Advogada',
    username: 'maria.silva',
    password: '123456',
    profileImage: undefined,
  },
  {
    id: '2',
    name: 'João Santos',
    age: 35,
    email: 'joao@example.com',
    whatsapp: '(11) 99876-5432',
    profession: 'Engenheiro de Software',
    username: 'joao.santos',
    password: '123456',
    profileImage: undefined,
  },
  {
    id: '3',
    name: 'Ana Costa',
    age: 28,
    email: 'ana@example.com',
    whatsapp: '(11) 98765-5321',
    profession: 'Designer Gráfico',
    username: 'ana.costa',
    password: '123456',
    profileImage: undefined,
  },
  {
    id: '4',
    name: 'Carlos Mendes',
    age: 38,
    email: 'carlos@example.com',
    whatsapp: '(11) 97654-3210',
    profession: 'Médico',
    username: 'carlos.mendes',
    password: '123456',
    profileImage: undefined,
  },
  {
    id: '5',
    name: 'Beatriz Lima',
    age: 30,
    email: 'beatriz@example.com',
    whatsapp: '(11) 96543-2109',
    profession: 'Psicóloga',
    username: 'beatriz.lima',
    password: '123456',
    profileImage: undefined,
  },
  {
    id: '6',
    name: 'Roberto Alves',
    age: 36,
    email: 'roberto@example.com',
    whatsapp: '(11) 95432-1098',
    profession: 'Advogado',
    username: 'roberto.alves',
    password: '123456',
    profileImage: undefined,
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
