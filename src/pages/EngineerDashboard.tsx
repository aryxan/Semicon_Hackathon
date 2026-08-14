import { AlertTriangle, CheckCircle2, TrendingUp, AlertOctagon, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const driftData = [
  { stage: 'Lithography', dx: 2.1, dy: -1.0, overlay: 0.5 },
  { stage: 'Etching', dx: 4.5, dy: -2.2, overlay: 1.2 },
  { stage: 'CMP', dx: 8.2, dy: -5.1, overlay: 2.1 },
  { stage: 'Metal-1', dx: 13.4, dy: -7.8, overlay: 4.5 },
];

export default function EngineerDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Engineer Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
          Machine Learning insights and process drift predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Current Wafer</div>
          <div className="text-2xl font-mono text-white">W-17-A</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Drift Risk Score</div>
          <div className="text-2xl font-bold text-amber-500">87 / 100</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Alignment Stability</div>
          <div className="text-2xl font-bold text-rose-500">Critical</div>
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
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Process Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="font-medium text-slate-200">Lithography</span>
                </div>
                <span className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2 py-1 rounded">Normal</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="font-medium text-slate-200">Etching</span>
                </div>
                <span className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2 py-1 rounded">Normal</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                  <span className="font-medium text-slate-200">CMP</span>
                </div>
                <span className="text-xs text-amber-500 font-mono bg-amber-500/20 px-2 py-1 rounded">Increasing Drift</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <div className="flex items-center">
                  <AlertOctagon className="h-5 w-5 text-rose-500 mr-3" />
                  <span className="font-medium text-slate-200">Metal-1</span>
                </div>
                <span className="text-xs text-rose-500 font-mono bg-rose-500/20 px-2 py-1 rounded">High Overlay</span>
              </div>
            </div>
          </div>

          <div className="bg-sky-900/20 border border-sky-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
            <div className="flex items-start">
              <Info className="h-6 w-6 text-sky-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Recommendation</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Cumulative overlay error has exceeded the 10nm tolerance threshold at the Metal-1 stage. Drift pattern strongly correlates with stage calibration degradation.
                </p>
                <div className="mt-4 pt-4 border-t border-sky-500/20">
                  <p className="text-sky-300 font-medium">Action Required:</p>
                  <p className="text-sm text-white mt-1">Recalibrate lithography stage before processing additional wafers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
