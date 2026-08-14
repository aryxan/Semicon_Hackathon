import { Database, Filter, Search } from 'lucide-react';

const mockHistory = [
  { id: 'W-17-A', stages: [
      { name: 'Lithography', dx: '+2.1', dy: '-1.0', rot: '0.01', overlay: '0.5' },
      { name: 'Etching', dx: '+4.5', dy: '-2.2', rot: '0.03', overlay: '1.2' },
      { name: 'CMP', dx: '+8.2', dy: '-5.1', rot: '0.04', overlay: '2.1' },
      { name: 'Metal', dx: '+13.4', dy: '-7.8', rot: '0.08', overlay: '4.5' } // High
    ]
  },
  { id: 'W-18-B', stages: [
      { name: 'Lithography', dx: '+1.5', dy: '+0.8', rot: '0.00', overlay: '0.3' },
      { name: 'Etching', dx: '+2.2', dy: '+1.4', rot: '0.01', overlay: '0.8' },
      { name: 'CMP', dx: '+3.1', dy: '+2.5', rot: '0.02', overlay: '1.4' },
      { name: 'Metal', dx: '+4.5', dy: '+3.8', rot: '0.02', overlay: '1.9' }
    ]
  }
];

export default function WaferHistory() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Wafer History</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
            Historical database of geometric measurements across process stages.
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search Wafer ID..." className="pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
          <button className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-light)] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center text-white">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-light)] flex items-center bg-white/[0.02]">
          <Database className="h-5 w-5 mr-2 text-sky-400" />
          <h2 className="font-semibold text-white">Cumulative Error Logs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#020617] text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4 border-b border-white/5">Wafer ID</th>
                <th className="px-6 py-4 border-b border-white/5">Stage</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">ΔX (nm)</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">ΔY (nm)</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">Rotation (°)</th>
                <th className="px-6 py-4 border-b border-white/5 text-right">Overlay (nm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockHistory.flatMap(wafer => 
                wafer.stages.map((stage, i) => (
                  <tr key={`${wafer.id}-${stage.name}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-sky-300">{i === 0 ? wafer.id : ''}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                        {stage.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">{stage.dx}</td>
                    <td className="px-6 py-4 text-right font-mono">{stage.dy}</td>
                    <td className="px-6 py-4 text-right font-mono">{stage.rot}</td>
                    <td className={`px-6 py-4 text-right font-mono font-medium ${parseFloat(stage.overlay) > 3 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {stage.overlay}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
