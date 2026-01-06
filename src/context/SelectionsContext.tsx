import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Selection {
  userId: string;
  type: 'match' | 'friendship' | 'no-interest';
  timestamp: number;
}

interface SelectionsContextType {
  selections: Selection[];
  addSelection: (selection: Selection) => void;
  removeSelection: (userId: string) => void;
  updateSelection: (userId: string, type: Selection['type']) => void;
  getSelectionsByType: (type: Selection['type']) => Selection[];
  getMatchCount: () => number;
  getFriendshipCount: () => number;
  getNoInterestCount: () => number;
}

const SelectionsContext = createContext<SelectionsContextType | undefined>(undefined);

export const SelectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<Selection[]>([]);

  const addSelection = (selection: Selection) => {
    setSelections(prev => [...prev, selection]);
  };

  const removeSelection = (userId: string) => {
    setSelections(prev => prev.filter(s => s.userId !== userId));
  };

  const updateSelection = (userId: string, type: Selection['type']) => {
    const existingIndex = selections.findIndex(s => s.userId === userId);
    if (existingIndex >= 0) {
      const updated = [...selections];
      updated[existingIndex] = { userId, type, timestamp: Date.now() };
      setSelections(updated);
    } else {
      addSelection({ userId, type, timestamp: Date.now() });
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
    addSelection,
    removeSelection,
    updateSelection,
    getSelectionsByType,
    getMatchCount,
    getFriendshipCount,
    getNoInterestCount,
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
