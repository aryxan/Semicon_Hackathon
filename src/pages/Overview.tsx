import { CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, Cpu, Server, ActivitySquare, Database, Crosshair } from 'lucide-react';
import { waferDatabase } from '../data/wafers';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAppContext } from '../context/AppContext';

export default function Overview() {
  const { openWaferDrawer } = useAppContext();
  const totalWafers = waferDatabase.length;
  const normalWafers = waferDatabase.filter(w => w.status === 'NORMAL').length;
  const driftWafers = waferDatabase.filter(w => w.status === 'DRIFT').length;
  const criticalWafers = waferDatabase.filter(w => w.status === 'CRITICAL').length;

  const avgOverlayError = totalWafers > 0
    ? (waferDatabase.reduce((acc, w) => acc + (w.stages?.[3]?.overlayError ?? 0), 0) / totalWafers).toFixed(2)
    : '0.00';
  const avgConfidence = totalWafers > 0
    ? (waferDatabase.reduce((acc, w) => acc + (w.stages?.[3]?.confidence ?? 0), 0) / totalWafers).toFixed(1)
    : '0.0';

  const pieData = [
    { name: 'NORMAL', value: normalWafers, color: '#10b981' },
    { name: 'DRIFT', value: driftWafers, color: '#f59e0b' },
    { name: 'CRITICAL', value: criticalWafers, color: '#ef4444' }
  ];

  const trendData = [
    { stage: 'Lithography', overlay: totalWafers > 0 ? (waferDatabase.reduce((acc, w) => acc + (w.stages?.[0]?.overlayError ?? 0), 0) / totalWafers) : 0 },
    { stage: 'Etching', overlay: totalWafers > 0 ? (waferDatabase.reduce((acc, w) => acc + (w.stages?.[1]?.overlayError ?? 0), 0) / totalWafers) : 0 },
    { stage: 'CMP', overlay: totalWafers > 0 ? (waferDatabase.reduce((acc, w) => acc + (w.stages?.[2]?.overlayError ?? 0), 0) / totalWafers) : 0 },
    { stage: 'Metal-1', overlay: totalWafers > 0 ? (waferDatabase.reduce((acc, w) => acc + (w.stages?.[3]?.overlayError ?? 0), 0) / totalWafers) : 0 }
  ];

  const alerts = waferDatabase.filter(w => w.status !== 'NORMAL').sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
            High-level metrics and system health.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
          <ActivitySquare className="h-5 w-5 text-emerald-400" />
          <span className="text-slate-300 font-medium">System ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center justify-between">
            Dataset <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">READY</span>
          </div>
          <div className="flex items-center mt-2">
            <Database className="h-5 w-5 text-slate-500 mr-2" />
            <span className="text-xl font-medium text-slate-200">{totalWafers} wafers</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center justify-between">
            CV Engine <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px]">OPENCV LIVE</span>
          </div>
          <div className="flex items-center mt-2">
            <Crosshair className="h-5 w-5 text-sky-500 mr-2" />
            <span className="text-xl font-medium text-slate-200">OpenCV Geometric</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center justify-between">
            Risk Model <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px]">XGBOOST LIVE</span>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-xl font-medium text-slate-200">XGBoost Classifier</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center justify-between">
            AI Analysis <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px]">READY</span>
          </div>
          <div className="flex items-center mt-2">
            <Cpu className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-xl font-medium text-slate-200">AI Copilot</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Total Wafers</div>
          <div className="text-3xl font-mono text-white">{totalWafers}</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Drift Risk</div>
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-mono text-amber-400">{driftWafers}</div>
            <div className="text-sm text-slate-500">/ {criticalWafers} Critical</div>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Avg. Overlay Error</div>
          <div className="text-3xl font-mono text-rose-400">{avgOverlayError} nm</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border-light)]">
          <div className="text-slate-400 text-sm mb-2">Avg. Localization Conf.</div>
          <div className="text-3xl font-mono text-emerald-400">{avgConfidence}%</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-6">Risk Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center text-sm text-slate-400">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-6">Average Drift Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val.toFixed(1)}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="overlay" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Alerts</h2>
            <div className="space-y-4">
              {alerts.map(wafer => (
                <div key={wafer.waferId} onClick={() => openWaferDrawer(wafer.waferId)} className="flex flex-col p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-lg cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-lg text-slate-200">{wafer.waferId}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${wafer.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {wafer.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-slate-400">Risk: <span className="text-slate-200">{wafer.riskScore.toFixed(1)}%</span></div>
                    <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">HOLD / STOP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
