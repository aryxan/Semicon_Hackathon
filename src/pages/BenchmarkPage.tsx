import React from 'react';
import { BarChart3, TrendingUp, Clock, Target, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

const performanceData = [
  { name: '0', error: 0.2 }, { name: '10', error: 0.5 }, { name: '20', error: 0.8 },
  { name: '30', error: 0.4 }, { name: '40', error: 0.9 }, { name: '50', error: 1.2 },
  { name: '60', error: 0.7 }, { name: '70', error: 0.6 }, { name: '80', error: 1.5 },
  { name: '90', error: 0.8 }, { name: '100', error: 0.5 }
];

const scatterData = Array.from({ length: 50 }).map((_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 1000 + 100 // runtime
}));

export default function BenchmarkPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-[var(--color-border-light)] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benchmark & Performance</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Evaluate model accuracy and runtime across randomized test cases.</p>
        </div>
        <button className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)] rounded-md text-sm font-medium transition-colors flex items-center">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Target, label: 'Overall Accuracy', value: '97.3%', color: 'text-emerald-400' },
          { icon: TrendingUp, label: 'Mean Error', value: '0.84 px', color: 'text-[var(--color-accent)]' },
          { icon: Clock, label: 'Median Runtime', value: '184 ms', color: 'text-[var(--color-text-primary)]' },
          { icon: CheckCircle2, label: 'Within Tolerance', value: '97 / 100', color: 'text-emerald-400' },
          { icon: AlertTriangle, label: 'Test Cases', value: '100', color: 'text-[var(--color-text-primary)]' }
        ].map((m, i) => (
          <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg p-4 flex flex-col items-center text-center">
            <m.icon className={`w-6 h-6 mb-2 ${m.color}`} />
            <span className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</span>
            <span className="text-xs text-[var(--color-text-tertiary)] mt-1 uppercase tracking-wider">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg p-6">
          <h3 className="font-medium text-[var(--color-text-primary)] mb-6">Localization Error Distribution (px)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  itemStyle={{ color: '#38BDF8' }}
                />
                <Area type="monotone" dataKey="error" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg p-6">
          <h3 className="font-medium text-[var(--color-text-primary)] mb-6">Processing Time vs Location</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" dataKey="x" name="X" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="number" dataKey="y" name="Y" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <ZAxis type="number" dataKey="z" range={[20, 200]} name="Runtime" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  />
                  <Scatter name="Test Cases" data={scatterData} fill="#38BDF8" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden flex flex-col">
         <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50">
           <h3 className="font-medium text-[var(--color-text-primary)]">Evaluation Results</h3>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[#0A0F1C] border-b border-[var(--color-border-light)]">
               <tr>
                 <th className="px-6 py-3 font-medium">Test ID</th>
                 <th className="px-6 py-3 font-medium">Architecture</th>
                 <th className="px-6 py-3 font-medium">GT (X, Y)</th>
                 <th className="px-6 py-3 font-medium">Pred (X, Y)</th>
                 <th className="px-6 py-3 font-medium">Error (px)</th>
                 <th className="px-6 py-3 font-medium">Runtime (ms)</th>
                 <th className="px-6 py-3 font-medium">Result</th>
               </tr>
             </thead>
             <tbody>
               {[
                 { id: 'TEST-001', arch: 'DRAM', gt: '486, 521', pred: '486, 521', err: 0.1, run: 184, res: 'PASS' },
                 { id: 'TEST-002', arch: 'FinFET', gt: '120, 890', pred: '121, 889', err: 1.4, run: 210, res: 'PASS' },
                 { id: 'TEST-003', arch: 'DRAM', gt: '550, 400', pred: '550, 401', err: 1.0, run: 195, res: 'PASS' },
                 { id: 'TEST-004', arch: 'DRAM', gt: '230, 150', pred: '780, 650', err: 550.2, run: 320, res: 'FAIL' },
                 { id: 'TEST-005', arch: 'FinFET', gt: '900, 900', pred: '900, 900', err: 0.0, run: 175, res: 'PASS' },
               ].map((row, i) => (
                 <tr key={i} className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]">
                   <td className="px-6 py-4 font-mono text-[var(--color-text-secondary)]">{row.id}</td>
                   <td className="px-6 py-4">{row.arch}</td>
                   <td className="px-6 py-4 font-mono text-slate-400">{row.gt}</td>
                   <td className="px-6 py-4 font-mono text-slate-300">{row.pred}</td>
                   <td className="px-6 py-4 font-mono">{row.err}</td>
                   <td className="px-6 py-4 font-mono text-slate-400">{row.run}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-semibold ${row.res === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                       {row.res}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
