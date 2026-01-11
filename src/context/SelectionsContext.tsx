import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { selectionsService } from '@/lib/selections.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface Selection {
  id?: string;
  eventId: string;
  userId: string;
  selectedUserId: string;
  vote: 'SIM' | 'TALVEZ' | 'NÃO';
  timestamp: number;
}

interface SelectionsContextType {
  selections: Selection[];
  currentEventId: string | null;
  currentUserId: string | null;
  setCurrentEventId: (eventId: string | null) => void;
  setCurrentUserId: (userId: string | null) => void;
  addSelection: (eventId: string, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO') => Promise<void>;
  removeSelection: (eventId: string, userId: string, selectedUserId: string) => Promise<void>;
  updateSelection: (eventId: string, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO') => Promise<void>;
  getSelectionsByVote: (vote: 'SIM' | 'TALVEZ' | 'NÃO') => Selection[];
  getSimCount: () => number;
  getTalvezCount: () => number;
  getNaoCount: () => number;
  isLoading: boolean;
}

const SelectionsContext = createContext<SelectionsContextType | undefined>(undefined);

export const SelectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  // Load selections when currentEventId and currentUserId change
  useEffect(() => {
    const loadSelections = async () => {
      if (!currentEventId || !currentUserId) {
        return;
      }

      // If Supabase is not configured, skip loading (use local state)
      if (!supabaseConfigured) {
        console.log('Supabase not configured, using local selections state');
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await selectionsService.getSelectionsForUserInEvent(currentEventId, currentUserId);
        if (error) {
          console.error('Error loading selections from database:', error);
          // Continue with empty selections if error occurs
          setSelections([]);
        } else if (data) {
          setSelections(data);
        }
      } catch (error) {
        console.error('Error loading selections:', error);
        // Continue with empty selections if error occurs
        setSelections([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelections();
  }, [currentEventId, currentUserId, supabaseConfigured]);

  const addSelection = async (eventId: string, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO') => {
    try {
      const { data } = await selectionsService.addSelection(eventId, userId, selectedUserId, vote);
      if (data) {
        setSelections(prev => {
          // Remove existing selection for this selected user if it exists
          const filtered = prev.filter(s => s.selectedUserId !== selectedUserId);
          return [...filtered, data];
        });
      }
    } catch (error) {
      console.error('Error adding selection:', error);
    }
  };

  const removeSelection = async (eventId: string, userId: string, selectedUserId: string) => {
    if (!supabaseConfigured) {
      // Fallback to local state
      setSelections(prev => prev.filter(s => s.selectedUserId !== selectedUserId));
      return;
    }

    try {
      const { error } = await selectionsService.removeSelection(eventId, userId, selectedUserId);
      if (error) {
        console.error('Error removing selection:', error);
        return;
      }
      setSelections(prev => prev.filter(s => s.selectedUserId !== selectedUserId));
    } catch (error) {
      console.error('Error removing selection:', error);
    }
  };

  const updateSelection = async (eventId: string, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO') => {
    if (!supabaseConfigured) {
      // Fallback to local state
      const existingIndex = selections.findIndex(s => s.selectedUserId === selectedUserId);
      if (existingIndex >= 0) {
        const updated = [...selections];
        updated[existingIndex] = { eventId, userId, selectedUserId, vote, timestamp: Date.now() };
        setSelections(updated);
      } else {
        setSelections(prev => [...prev, { eventId, userId, selectedUserId, vote, timestamp: Date.now() }]);
      }
      return;
    }

    try {
      const { data, error } = await selectionsService.updateSelection(eventId, userId, selectedUserId, vote);
      if (error) {
        console.error('Error updating selection:', error);
        return;
      }
      if (data) {
        setSelections(prev => {
          const filtered = prev.filter(s => s.selectedUserId !== selectedUserId);
          return [...filtered, data];
        });
      }
    } catch (error) {
      console.error('Error updating selection:', error);
    }
  };

  const getSelectionsByVote = (vote: 'SIM' | 'TALVEZ' | 'NÃO'): Selection[] => {
    return selections.filter(s => s.vote === vote);
  };

  const getSimCount = (): number => {
    return selections.filter(s => s.vote === 'SIM').length;
  };

  const getTalvezCount = (): number => {
    return selections.filter(s => s.vote === 'TALVEZ').length;
  };

  const getNaoCount = (): number => {
    return selections.filter(s => s.vote === 'NÃO').length;
  };

  const value: SelectionsContextType = {
    selections,
    currentEventId,
    currentUserId,
    setCurrentEventId,
    setCurrentUserId,
    addSelection,
    removeSelection,
    updateSelection,
    getSelectionsByVote,
    getSimCount,
    getTalvezCount,
    getNaoCount,
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
