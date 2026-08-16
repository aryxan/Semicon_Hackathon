import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';

interface HealthStatus {
  frontend: string;
  backend: string;
  cv: string;
  model: string;
  shap: string;
  ollama: string;
  database: string;
  device: string;
}

export const SystemHealthPanel = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:49999/api/health');
        if (response.ok) {
          setHealth(await response.json());
        }
      } catch (e) {
        setHealth(null);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatusItem = ({ label, status }: { label: string, status?: string }) => {
    const isReady = status === 'online' || status === 'READY' || status === 'LOADED';
    return (
      <div className="flex items-center justify-between text-sm py-1">
        <span className="text-slate-400">{label}</span>
        <div className="flex items-center">
          {isReady ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 mr-2" />
          )}
          <span className={isReady ? 'text-emerald-400' : 'text-rose-400 font-medium'}>
            {status || 'OFFLINE'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 w-full">
      <h3 className="text-white font-medium flex items-center mb-4">
        <Activity className="w-4 h-4 mr-2 text-sky-400" />
        System Health
      </h3>
      <div className="space-y-1">
        <StatusItem label="Frontend" status={health?.frontend || 'online'} />
        <StatusItem label="FastAPI Backend" status={health?.backend} />
        <StatusItem label="OpenCV Engine" status={health?.cv} />
        <StatusItem label="XGBoost Model" status={health?.model} />
        <StatusItem label="TreeSHAP" status={health?.shap} />
        <StatusItem label="Ollama AI" status={health?.ollama} />
        <StatusItem label="SQLite Database" status={health?.database} />
      </div>
      {health?.device && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
          <span className="text-slate-500">ML Device:</span>
          <span className="text-sky-400 uppercase font-mono">{health.device}</span>
        </div>
      )}
    </div>
  );
};
