import React, { useEffect, useState } from 'react';
import { X, Activity, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { getWaferById } from '../../../data/wafers';
import { RealRiskProvider } from '../../../services/realProviders';
import { RiskPrediction } from '../../../types';

const riskProvider = new RealRiskProvider();

export default function WaferDetailDrawer() {
  const { selectedWaferId, closeWaferDrawer } = useAppContext();
  const [risk, setRisk] = useState<RiskPrediction | null>(null);

  const wafer = getWaferById(selectedWaferId);

  useEffect(() => {
    if (!wafer) return;
    let isMounted = true;
    
    async function load() {
      setRisk(null);
      try {
        const riskRes = await riskProvider.predict({ waferId: wafer!.waferId, stages: wafer!.stages });
        if (!isMounted) return;
        setRisk(riskRes);
      } catch (e) {
        console.error('Risk prediction failed:', e);
      }
    }
    
    load();
    return () => { isMounted = false; };
  }, [wafer]);

  if (!selectedWaferId || !wafer) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeWaferDrawer}
      ></div>

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transform transition-transform overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-white font-mono">Wafer {wafer.waferId}</h2>
            <span className="text-xs text-slate-400">Batch {wafer.batchId}</span>
          </div>
          <button onClick={closeWaferDrawer} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="flex space-x-4">
            <div className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Risk Level</div>
              <div className={`text-xl font-bold ${wafer.status === 'CRITICAL' ? 'text-rose-500' : wafer.status === 'DRIFT' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {wafer.riskScore.toFixed(1)}% {wafer.status}
              </div>
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Required Action</div>
              <div className={`text-lg font-bold ${wafer.status !== 'NORMAL' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {wafer.status !== 'NORMAL' ? 'HOLD / STOP' : 'PASS'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-sky-400" /> Process Timeline
            </h3>
            <div className="space-y-2">
              {wafer.stages.map((s: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm">
                  <span className="font-medium text-slate-300">{s.stage}</span>
                  <span className={`font-mono ${s.overlayError > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>{s.overlayError.toFixed(2)} nm</span>
                </div>
              ))}
            </div>
          </div>

          {risk && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-amber-400" /> Risk Drivers (SHAP)
              </h3>
              <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                {risk.shapDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    <div className="w-32 text-slate-400 truncate pr-2">{driver.feature}</div>
                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full ${driver.direction === 'positive' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(100, (driver.contribution / 40) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
