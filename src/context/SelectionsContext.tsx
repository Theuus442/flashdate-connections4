import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { selectionsService } from '@/lib/selections.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface Selection {
  userId: string;
  type: 'match' | 'friendship' | 'no-interest';
  timestamp: number;
}

interface SelectionsContextType {
  selections: Selection[];
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
  addSelection: (userId: string, selectedUserId: string, type: Selection['type']) => Promise<void>;
  removeSelection: (userId: string, selectedUserId: string) => Promise<void>;
  updateSelection: (userId: string, selectedUserId: string, type: Selection['type']) => Promise<void>;
  getSelectionsByType: (type: Selection['type']) => Selection[];
  getMatchCount: () => number;
  getFriendshipCount: () => number;
  getNoInterestCount: () => number;
  isLoading: boolean;
}

const SelectionsContext = createContext<SelectionsContextType | undefined>(undefined);

export const SelectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  // Load selections when currentUserId changes
  useEffect(() => {
    const loadSelections = async () => {
      if (!currentUserId || !supabaseConfigured) {
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await selectionsService.getSelectionsForUser(currentUserId);
        if (error) {
          console.error('Error loading selections:', error);
        } else if (data) {
          setSelections(data);
        }
      } catch (error) {
        console.error('Error loading selections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelections();
  }, [currentUserId, supabaseConfigured]);

  const addSelection = async (userId: string, selectedUserId: string, type: Selection['type']) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      setSelections(prev => [...prev, { userId: selectedUserId, type, timestamp: Date.now() }]);
      return;
    }

    try {
      const { data, error } = await selectionsService.addSelection(userId, selectedUserId, type);
      if (error) {
        console.error('Error adding selection:', error);
        return;
      }
      if (data) {
        setSelections(prev => {
          // Remove existing selection for this user if it exists
          const filtered = prev.filter(s => s.userId !== selectedUserId);
          return [...filtered, data];
        });
      }
    } catch (error) {
      console.error('Error adding selection:', error);
    }
  };

  const removeSelection = async (userId: string, selectedUserId: string) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      setSelections(prev => prev.filter(s => s.userId !== selectedUserId));
      return;
    }

    try {
      const { error } = await selectionsService.removeSelection(userId, selectedUserId);
      if (error) {
        console.error('Error removing selection:', error);
        return;
      }
      setSelections(prev => prev.filter(s => s.userId !== selectedUserId));
    } catch (error) {
      console.error('Error removing selection:', error);
    }
  };

  const updateSelection = async (userId: string, selectedUserId: string, type: Selection['type']) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      const existingIndex = selections.findIndex(s => s.userId === selectedUserId);
      if (existingIndex >= 0) {
        const updated = [...selections];
        updated[existingIndex] = { userId: selectedUserId, type, timestamp: Date.now() };
        setSelections(updated);
      } else {
        setSelections(prev => [...prev, { userId: selectedUserId, type, timestamp: Date.now() }]);
      }
      return;
    }

    try {
      const { data, error } = await selectionsService.updateSelection(userId, selectedUserId, type);
      if (error) {
        console.error('Error updating selection:', error);
        return;
      }
      if (data) {
        setSelections(prev => {
          const filtered = prev.filter(s => s.userId !== selectedUserId);
          return [...filtered, data];
        });
      }
    } catch (error) {
      console.error('Error updating selection:', error);
    }
  };

  const getSelectionsByType = (type: Selection['type']): Selection[] => {
    return selections.filter(s => s.type === type);
  };

  const getMatchCount = (): number => {
    return selections.filter(s => s.type === 'match').length;
  };

  const getFriendshipCount = (): number => {
    return selections.filter(s => s.type === 'friendship').length;
  };

  const getNoInterestCount = (): number => {
    return selections.filter(s => s.type === 'no-interest').length;
  };

  const value: SelectionsContextType = {
    selections,
    currentUserId,
    setCurrentUserId,
    addSelection,
    removeSelection,
    updateSelection,
    getSelectionsByType,
    getMatchCount,
    getFriendshipCount,
    getNoInterestCount,
    isLoading,
  };

  return (
    <SelectionsContext.Provider value={value}>
      {children}
    </SelectionsContext.Provider>
  );
};

export const useSelections = () => {
  const context = useContext(SelectionsContext);
  if (context === undefined) {
    throw new Error('useSelections must be used within a SelectionsProvider');
  }
  return context;
};
