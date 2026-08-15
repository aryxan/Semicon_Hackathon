import { Database, Filter, Search, ChevronDown, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { waferDatabase } from '../data/wafers';
import { Wafer, RiskStatus } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';

export default function WaferHistory() {
  const { openWaferDrawer } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RiskStatus | 'ALL'>('ALL');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (waferId: string) => {
    const next = new Set(expandedRows);
    if (next.has(waferId)) next.delete(waferId);
    else next.add(waferId);
    setExpandedRows(next);
  };

  const filteredWafers = waferDatabase.filter(w => {
    const matchesSearch = w.waferId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const batchAvgData = [
    { stage: 'Lithography', overlay: 0.8 },
    { stage: 'Etching', overlay: 1.5 },
    { stage: 'CMP', overlay: 2.1 },
    { stage: 'Metal-1', overlay: 2.5 }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            Wafer History
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
            Historical database of geometric measurements across process stages.
          </p>
        </div>
      </div>

      <div className="flex space-x-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Wafer ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500" 
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NORMAL">Normal</option>
            <option value="DRIFT">Drift</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-sky-400" />
            <h2 className="font-semibold text-white">Wafer Records</h2>
          </div>
          <span className="text-sm text-slate-400">Showing {filteredWafers.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#020617] text-slate-400 font-medium">
              <tr>
                <th className="px-4 py-4 border-b border-white/5 w-10"></th>
                <th className="px-6 py-4 border-b border-white/5">Wafer ID</th>
                <th className="px-6 py-4 border-b border-white/5">Batch ID</th>
                <th className="px-6 py-4 border-b border-white/5">Status</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">Max Overlay (nm)</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">Avg Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWafers.map((wafer) => {
                const isExpanded = expandedRows.has(wafer.waferId);
                const maxOverlay = Math.max(...wafer.stages.map((s: any) => s.overlayError)).toFixed(2);
                const avgConfidence = (wafer.stages.reduce((acc: number, s: any) => acc + s.confidence, 0) / wafer.stages.length).toFixed(1);
                
                return (
                  <React.Fragment key={wafer.waferId}>
                    <tr 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-4 text-slate-500 hover:text-sky-400 cursor-pointer" onClick={() => toggleRow(wafer.waferId)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-sky-400 cursor-pointer hover:underline" onClick={() => openWaferDrawer(wafer.waferId)}>
                        {wafer.waferId}
                      </td>
                      <td className="px-6 py-4 text-slate-400 cursor-pointer" onClick={() => toggleRow(wafer.waferId)}>{wafer.batchId}</td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => toggleRow(wafer.waferId)}>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${
                          wafer.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          wafer.status === 'DRIFT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {wafer.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono ${parseFloat(maxOverlay) > 10 ? 'text-rose-400 font-bold' : ''}`}>{maxOverlay}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400">{avgConfidence}%</td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-950/50">
                        <td colSpan={6} className="p-6 border-b border-white/5">
                          <div className="grid lg:grid-cols-2 gap-8">
                            
                            <div>
                              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
                                <Activity className="h-4 w-4 mr-2 text-sky-400" />
                                Stage-by-Stage Breakdown
                              </h4>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="pb-2 text-left">Stage</th>
                                    <th className="pb-2 text-right">ΔX (nm)</th>
                                    <th className="pb-2 text-right">ΔY (nm)</th>
                                    <th className="pb-2 text-right">Rot (°)</th>
                                    <th className="pb-2 text-right">Overlay</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                  {wafer.stages.map((stage: any) => (
                                    <tr key={stage.stage} className="hover:bg-slate-900 transition-colors">
                                      <td className="py-2.5 font-medium text-slate-300">{stage.stage}</td>
                                      <td className="py-2.5 text-right font-mono text-slate-400">{stage.xError.toFixed(2)}</td>
                                      <td className="py-2.5 text-right font-mono text-slate-400">{stage.yError.toFixed(2)}</td>
                                      <td className="py-2.5 text-right font-mono text-slate-400">{stage.rotation.toFixed(3)}</td>
                                      <td className={`py-2.5 text-right font-mono font-medium ${stage.overlayError > 10 ? 'text-rose-400' : 'text-amber-400'}`}>
                                        {stage.overlayError.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-slate-300 flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2 text-sky-400" />
                                  Batch Comparison: Overlay Error Trend
                                </h4>
                                <span className="text-[10px] uppercase font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                                  {wafer.waferId} vs {wafer.batchId} Avg
                                </span>
                              </div>
                              <div className="h-48 border border-slate-800 rounded-lg p-4 bg-slate-900/50">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={wafer.stages.map((s: any, i: number) => ({
                                    stage: s.stage,
                                    waferOverlay: s.overlayError,
                                    batchOverlay: batchAvgData[i].overlay
                                  }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="stage" stroke="#64748b" fontSize={10} />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Line type="monotone" dataKey="waferOverlay" name={wafer.waferId} stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="batchOverlay" name={`${wafer.batchId} Avg`} stroke="#94a3b8" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
