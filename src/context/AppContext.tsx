import React, { createContext, useContext, useState, ReactNode } from 'react';
import { waferDatabase } from '../data/wafers';

interface AppContextType {
  selectedWaferId: string | null;
  setSelectedWaferId: (id: string | null) => void;
  isWaferDrawerOpen: boolean;
  openWaferDrawer: (id: string) => void;
  closeWaferDrawer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedWaferId, setSelectedWaferId] = useState<string | null>(null);
  const [isWaferDrawerOpen, setIsWaferDrawerOpen] = useState(false);

  const openWaferDrawer = (id: string) => {
    setSelectedWaferId(id);
    setIsWaferDrawerOpen(true);
  };

  const closeWaferDrawer = () => {
    setIsWaferDrawerOpen(false);
  };

  return (
    <AppContext.Provider value={{ 
      selectedWaferId, 
      setSelectedWaferId,
      isWaferDrawerOpen,
      openWaferDrawer,
      closeWaferDrawer
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
