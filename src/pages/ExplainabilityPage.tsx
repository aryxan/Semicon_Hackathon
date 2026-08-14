import React from 'react';
import { AlertOctagon, HelpCircle, GitCommit, Crosshair, ZoomIn } from 'lucide-react';

export default function ExplainabilityPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-[var(--color-border-light)] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Failure Analysis</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Investigate localization errors and algorithmic failure modes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-red-500/30 rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-red-500/30 bg-red-950/20 flex justify-between items-center">
               <h3 className="font-medium text-red-200 flex items-center"><AlertOctagon className="w-4 h-4 mr-2" /> Error Case: TEST-004</h3>
               <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">550.2 px Error</span>
             </div>
             
             <div className="p-4 grid grid-cols-2 gap-4 bg-[#0A0F1C]">
                {/* Reference */}
                <div className="space-y-2 text-center">
                  <div className="h-64 border border-slate-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')] relative flex items-center justify-center group">
                    <ZoomIn className="absolute w-8 h-8 text-white opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Reference Pattern</span>
                </div>
                {/* Search */}
                <div className="space-y-2 text-center">
                  <div className="h-64 border border-slate-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik00MCAwaC0xdjQwaDFWMHptMC0xdjFIMHYtMWg0MHpNMCA0MHYtMWg0MHYxSDB6IiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+')] relative">
                     {/* Ground Truth */}
                     <div className="absolute top-[15%] left-[23%] w-[10%] h-[10%] border-2 border-emerald-500 bg-emerald-500/20"></div>
                     {/* Prediction */}
                     <div className="absolute top-[65%] left-[78%] w-[10%] h-[10%] border-2 border-red-500 bg-red-500/20"></div>
                     <div className="absolute top-[15%] left-[23%] flex items-center text-xs text-emerald-400 -mt-5 -ml-2 whitespace-nowrap">
                       Ground Truth
                     </div>
                     <div className="absolute top-[65%] left-[78%] flex items-center text-xs text-red-400 -mt-5 -ml-2 whitespace-nowrap">
                       Prediction
                     </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Search Image (10× FOV)</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border-light)]">
               <h4 className="text-sm text-[var(--color-text-secondary)] mb-1">Failure Type</h4>
               <p className="font-medium text-[var(--color-text-primary)]">Highly Periodic Region</p>
             </div>
             <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border-light)]">
               <h4 className="text-sm text-[var(--color-text-secondary)] mb-1">Confidence Score</h4>
               <p className="font-medium text-red-400">61.4% (Ambiguous)</p>
             </div>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border-light)]">
            <h4 className="text-sm text-[var(--color-text-secondary)] mb-2 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" /> Root Cause Analysis
            </h4>
            <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              Multiple regions produced highly similar structural responses. The DRAM layout in this region is perfectly periodic without any unique defects or structural markers to act as anchors. The algorithm localized onto a visually identical but physically incorrect neighboring bit-line structure.
            </p>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50">
               <h3 className="font-medium text-[var(--color-text-primary)]">Execution Timeline</h3>
             </div>
             <div className="p-6">
                <div className="relative border-l border-slate-700 ml-3 space-y-6">
                  {[
                    { title: 'Reference extracted', desc: '1000×1000 patch normalized', type: 'normal' },
                    { title: 'Candidate A detected', desc: 'Score: 92.1% (Ground Truth)', type: 'normal' },
                    { title: 'Candidate B detected', desc: 'Score: 91.8%', type: 'normal' },
                    { title: 'Candidate C detected', desc: 'Score: 92.4%', type: 'normal' },
                    { title: 'Similarity scores converged', desc: 'Delta < 1% across top 5 candidates', type: 'warning' },
                    { title: 'Incorrect candidate selected', desc: 'Center-distance fallback failed due to drift magnitude', type: 'error' },
                    { title: 'Localization error detected', desc: 'Deviation of 550.2 px from GT', type: 'error' },
                  ].map((step, i) => (
                    <div key={i} className="pl-6 relative">
                      <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-[var(--color-surface)] ${
                        step.type === 'error' ? 'bg-red-500' : step.type === 'warning' ? 'bg-amber-500' : 'bg-slate-500'
                      }`} />
                      <h4 className={`text-sm font-medium ${
                        step.type === 'error' ? 'text-red-400' : step.type === 'warning' ? 'text-amber-400' : 'text-[var(--color-text-primary)]'
                      }`}>{step.title}</h4>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
