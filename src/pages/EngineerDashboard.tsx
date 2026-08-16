import { AlertTriangle, CheckCircle2, TrendingUp, AlertOctagon, Info, Cpu, MessageSquare, Send } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RealRiskProvider } from '../services/realProviders';
import { getWaferById, waferDatabase } from '../data/wafers';
import { RiskPrediction } from '../types';

const riskProvider = new RealRiskProvider();

export default function EngineerDashboard() {
  const { selectedWaferId, wafers } = useAppContext() as any;
  const wafer = wafers.find((w: any) => w.waferId === selectedWaferId) || getWaferById(selectedWaferId);

  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [chatLog, setChatLog] = useState<{role: 'user'|'ai', msg: string}[]>([
    { role: 'ai', msg: 'Hello. I am the Drift-Sense Engineering Copilot. Analyzing latest process data...' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const risk = await riskProvider.predict({ waferId: wafer.waferId, stages: wafer.stages });
        setRiskPrediction(risk);

        // Fetch AI Analysis from Ollama
        try {
          const aiReq = {
            wafer_id: wafer.waferId,
            risk_status: risk.status,
            risk_probability: risk.probability,
            shap_drivers: risk.shapDrivers,
            stages_metrology: wafer.stages
          };
          const aiResp = await fetch('http://localhost:49999/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiReq)
          });
          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const message = `**Analysis Complete**\nSummary: ${aiData.summary}\n\nInterpretation: ${aiData.risk_interpretation}\n\nKey Factors:\n- ${aiData.key_factors.join('\n- ')}\n\nRecommendation: ${aiData.recommended_review}`;
            setChatLog(prev => [...prev, { role: 'ai', msg: message }]);
          }
        } catch (e) {
          console.error('AI analysis failed:', e);
          setChatLog(prev => [...prev, { role: 'ai', msg: 'AI analysis temporarily unavailable.' }]);
        }

      } catch (e) {
        console.error('ML prediction failed:', e);
      }
      setLoading(false);
    }
    fetchData();
  }, [wafer.waferId, wafer.stages]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatLog(prev => [...prev, { role: 'user', msg }]);
    // Placeholder AI response until Ollama is integrated
    setChatLog(prev => [...prev, { role: 'ai', msg: `Analysis for ${wafer.waferId}: The wafer's current risk profile has been evaluated by the XGBoost model. Check the SHAP drivers panel for key contributing factors.` }]);
  };

  const driftData = wafer.stages.map((s: any) => ({
    stage: s.stage,
    dx: s.xError,
    dy: s.yError,
    overlay: s.overlayError
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          Engineer Dashboard
          <span className="ml-4 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-xs tracking-wider uppercase">XGBoost Live</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
          Machine Learning insights and process drift predictions.
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-sky-400">
          <Cpu className="h-8 w-8 animate-spin mr-3 opacity-50" />
          <span>Running XGBoost prediction...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
              <div className="text-slate-400 text-sm mb-2">Current Wafer</div>
              <div className="text-2xl font-mono text-white">{wafer.waferId}</div>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
              <div className="text-slate-400 text-sm mb-2">Drift Risk Score</div>
              <div className={`text-2xl font-bold ${riskPrediction?.status === 'CRITICAL' ? 'text-rose-500' : riskPrediction?.status === 'DRIFT' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {riskPrediction?.probability.toFixed(1)} / 100
              </div>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
              <div className="text-slate-400 text-sm mb-2">Alignment Stability</div>
              <div className={`text-2xl font-bold ${riskPrediction?.status === 'CRITICAL' ? 'text-rose-500' : riskPrediction?.status === 'DRIFT' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {riskPrediction?.status}
              </div>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
              <div className="text-slate-400 text-sm mb-2">Active Stage</div>
              <div className="text-2xl font-semibold text-white">Metal-1</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-sky-400" /> Drift Evolution Trend
                  </h2>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={driftData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="stage" stroke="#64748b" />
                      <YAxis stroke="#64748b" label={{ value: 'Error (nm)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <ReferenceLine y={10} label={{ position: 'top', value: 'Tolerance Limit', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="dx" stroke="#38bdf8" strokeWidth={3} name="ΔX Drift" dot={{ r: 6 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="dy" stroke="#818cf8" strokeWidth={3} name="ΔY Drift" dot={{ r: 6 }} />
                      <Line type="monotone" dataKey="overlay" stroke="#f59e0b" strokeWidth={3} name="Overlay Error" dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center justify-between">
                  <span>Why is this wafer at risk?</span>
                  <span className="text-[10px] uppercase bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">XGBoost Live</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="text-sm text-slate-400 mb-4">Risk Drivers (SHAP values)</div>
                  {riskPrediction?.shapDrivers.map((driver, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-48 text-sm text-slate-300 truncate pr-4">{driver.feature}</div>
                      <div className="flex-1 flex items-center">
                        <div className="w-full bg-slate-900 rounded-full h-3 flex items-center">
                          <div 
                            className={`h-3 rounded-full ${driver.direction === 'positive' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, (driver.contribution / 40) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-24 text-right text-xs font-mono text-slate-500 flex items-center justify-end">
                        {driver.direction === 'positive' ? <span className="text-rose-400 mr-1">↑</span> : <span className="text-emerald-400 mr-1">↓</span>}
                        {driver.contribution > 20 ? 'High' : driver.contribution > 10 ? 'Medium' : 'Low'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Process Timeline</h2>
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  {wafer.stages.map((stage: any, idx: number) => {
                    const isNormal = stage.overlayError < 4;
                    const isWarning = stage.overlayError >= 4 && stage.overlayError < 10;
                    return (
                      <div key={stage.stage} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-6">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 ${isNormal ? 'bg-emerald-500 text-emerald-950' : isWarning ? 'bg-amber-500 text-amber-950' : 'bg-rose-500 text-rose-950'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-slate-900 z-10`}>
                          {isNormal ? <CheckCircle2 className="w-5 h-5" /> : isWarning ? <AlertTriangle className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-slate-200">{stage.stage}</h4>
                            <span className={`text-xs font-mono ${isNormal ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'}`}>
                              {isNormal ? 'Normal' : isWarning ? 'Increasing Drift' : 'High Overlay'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl flex flex-col h-80">
                <div className="p-4 border-b border-[var(--color-border-light)] flex justify-between items-center bg-slate-900/50">
                  <h3 className="font-semibold text-white flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-sky-400" /> Drift-Sense AI Copilot
                  </h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/20">
                  {chatLog.map((c, i) => (
                    <div key={i} className={`flex ${c.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${c.role === 'ai' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-sky-600 text-white'}`}>
                        {c.msg}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-[var(--color-border-light)] bg-slate-900/50 flex space-x-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask about this wafer..." 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                  <button onClick={handleSendChat} className="bg-sky-500 hover:bg-sky-400 text-white p-1.5 rounded-lg transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
