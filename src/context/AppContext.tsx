import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';

const API_BASE = API_BASE_URL;

interface StageData {
  stage: string;
  xError: number;
  yError: number;
  rotation: number;
  scale: number;
  overlayError: number;
  confidence: number;
  inlierRatio: number;
}

interface WaferData {
  waferId: string;
  batchId: string;
  status: string;
  riskScore: number;
  timestamp: string;
  stages: StageData[];
}

interface AppContextType {
  wafers: WaferData[];
  setWafers: (wafers: WaferData[]) => void;
  selectedWaferId: string | null;
  setSelectedWaferId: (id: string | null) => void;
  isWaferDrawerOpen: boolean;
  openWaferDrawer: (id: string) => void;
  closeWaferDrawer: () => void;
  updateWaferFromCV: (cvResponse: any, predictResponse?: any) => void;
  refreshWafers: () => Promise<void>;
  holdWafer: (id: string) => Promise<void>;
  cancelHold: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [wafers, setWafers] = useState<WaferData[]>([]);
  const [selectedWaferId, setSelectedWaferId] = useState<string | null>(null);
  const [isWaferDrawerOpen, setIsWaferDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (user: string, pass: string) => {
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const refreshWafers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/wafer/history`);
      if (response.ok) {
        const data = await response.json();
        setWafers(data);
      }
    } catch (e) {
      console.error("Failed to load wafer history:", e);
    }
  };

  const holdWafer = async (id: string) => {
    const wafer = wafers.find(w => w.waferId === id);
    if (!wafer) return;
    
    const updatedWafer = { ...wafer, status: 'HELD' };
    setWafers(prev => prev.map(w => w.waferId === id ? updatedWafer : w));
    
    try {
      await fetch(`${API_BASE}/api/wafer/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWafer)
      });
    } catch (e) {
      console.error("Failed to hold wafer:", e);
    }
  };

  const cancelHold = async (id: string) => {
    const wafer = wafers.find(w => w.waferId === id);
    if (!wafer) return;
    
    // Recalculate original status based on riskScore
    let newStatus = 'NORMAL';
    if (wafer.riskScore >= 75) newStatus = 'CRITICAL';
    else if (wafer.riskScore >= 40) newStatus = 'DRIFT';

    const updatedWafer = { ...wafer, status: newStatus };
    setWafers(prev => prev.map(w => w.waferId === id ? updatedWafer : w));
    
    try {
      await fetch(`${API_BASE}/api/wafer/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWafer)
      });
    } catch (e) {
      console.error("Failed to cancel hold:", e);
    }
  };

  useEffect(() => {
    refreshWafers();
    const interval = setInterval(refreshWafers, 5000);
    return () => clearInterval(interval);
  }, []);

  const openWaferDrawer = (id: string) => {
    setSelectedWaferId(id);
    setIsWaferDrawerOpen(true);
  };

  const closeWaferDrawer = () => {
    setIsWaferDrawerOpen(false);
  };

  const updateWaferFromCV = async (cvResponse: any, predictResponse?: any) => {
    setWafers(prev => {
      const newWafers = [...prev];
      const actualWaferId = cvResponse.wafer_id || cvResponse.waferId;
      let waferIndex = newWafers.findIndex(w => w.waferId === actualWaferId);
      
      if (waferIndex === -1) {
        // Create new wafer if it doesn't exist
        const newWafer: WaferData = {
          waferId: actualWaferId,
          batchId: 'UNKNOWN',
          status: 'NORMAL',
          riskScore: 0,
          timestamp: new Date().toISOString(),
          stages: []
        };
        newWafers.push(newWafer);
        waferIndex = newWafers.length - 1;
      }
      
      const wafer = { ...newWafers[waferIndex] };
      const stages = [...wafer.stages];
      
      let stageIndex = stages.findIndex(s => s.stage === cvResponse.stage);
      
      const pxToNm = 10.0;
      
      const newStage = {
        stage: cvResponse.stage,
        xError: cvResponse.xError * pxToNm,
        yError: cvResponse.yError * pxToNm,
        rotation: cvResponse.rotation,
        scale: cvResponse.scale,
        overlayError: cvResponse.overlayError * pxToNm,
        confidence: cvResponse.confidence,
        inlierRatio: cvResponse.inlierRatio
      };
      
      if (stageIndex >= 0) {
        stages[stageIndex] = newStage;
      } else {
        stages.push(newStage);
      }
      
      wafer.stages = stages;
      
      if (predictResponse) {
        wafer.status = predictResponse.status as any;
        wafer.riskScore = predictResponse.probability * 100;
      }
      
      newWafers[waferIndex] = wafer;
      
      fetch(`${API_BASE}/api/wafer/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wafer)
      }).catch(e => console.error("Failed to save wafer:", e));
      
      return newWafers;
    });
  };

  return (
    <AppContext.Provider value={{ 
      wafers, setWafers, updateWaferFromCV, refreshWafers, holdWafer, cancelHold,
      selectedWaferId, setSelectedWaferId,
      isWaferDrawerOpen, openWaferDrawer, closeWaferDrawer,
      isAuthenticated, login, logout
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
