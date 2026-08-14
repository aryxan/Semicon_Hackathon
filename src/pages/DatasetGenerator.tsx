import React, { useState } from 'react';
import { Database, Settings, Image as ImageIcon, Play, FileJson } from 'lucide-react';

export default function DatasetGenerator() {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle');

  const handleGenerate = () => {
    setStatus('generating');
    setTimeout(() => {
      setStatus('success');
    }, 2500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-[var(--color-border-light)] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Synthetic Dataset Generator</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Generate randomized scale-variant image pairs for training and evaluation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50 flex items-center">
               <Settings className="w-4 h-4 mr-2 text-[var(--color-accent)]" />
               <h3 className="font-medium text-[var(--color-text-primary)]">Configuration</h3>
             </div>
             <div className="p-4 space-y-4 text-sm">
                
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Architecture</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white">
                    <option>DRAM (Periodic Contacts)</option>
                    <option>FinFET (Parallel Fins)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--color-text-secondary)] mb-1">Reference Scale</label>
                    <input type="text" value="1 nm/px" readOnly className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-400 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[var(--color-text-secondary)] mb-1">Search Scale</label>
                    <input type="text" value="10 nm/px" readOnly className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-400 font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Number of Samples</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white">
                    <option>30 (Minimal)</option>
                    <option>100 (Standard)</option>
                    <option>500 (Large)</option>
                    <option>1000 (Training)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1 flex justify-between">
                    <span>SEM Noise Level</span>
                    <span className="text-[var(--color-accent)]">Medium</span>
                  </label>
                  <input type="range" className="w-full accent-[var(--color-accent)]" />
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800">
                  <button 
                    onClick={handleGenerate}
                    disabled={status === 'generating'}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-slate-950 font-semibold py-2 rounded transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {status === 'generating' ? (
                      <><span className="animate-pulse mr-2 h-2 w-2 bg-slate-950 rounded-full"></span> Generating...</>
                    ) : (
                      <><Database className="w-4 h-4 mr-2" /> Generate Dataset</>
                    )}
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Preview & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50 flex items-center">
               <ImageIcon className="w-4 h-4 mr-2 text-[var(--color-accent)]" />
               <h3 className="font-medium text-[var(--color-text-primary)]">Dataset Preview</h3>
             </div>
             <div className="p-6 bg-[#0A0F1C] h-80 flex items-center justify-center relative overflow-hidden">
               {status === 'idle' && (
                 <div className="text-slate-500 flex flex-col items-center">
                   <FileJson className="w-12 h-12 mb-2 opacity-30" />
                   <p>No dataset generated yet.</p>
                 </div>
               )}
               {status === 'generating' && (
                 <div className="flex flex-col items-center text-[var(--color-accent)] font-mono text-sm space-y-2">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)] mb-4"></div>
                   <p>Generating synthetic wafer patterns...</p>
                   <p className="opacity-70">Applying SEM noise...</p>
                   <p className="opacity-50">Generating ground-truth coordinates...</p>
                 </div>
               )}
               {status === 'success' && (
                 <div className="flex space-x-8 items-center w-full justify-center">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-slate-700 border border-slate-600 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')]"></div>
                      <span className="text-xs font-mono mt-2 text-slate-400">reference_001.png</span>
                    </div>
                    <div className="text-slate-500 font-mono text-xl">→</div>
                    <div className="flex flex-col items-center relative">
                      <div className="w-48 h-48 bg-slate-800 border border-slate-700 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik00MCAwaC0xdjQwaDFWMHptMC0xdjFIMHYtMWg0MHpNMCA0MHYtMWg0MHYxSDB6IiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+')]">
                        <div className="absolute top-[30%] left-[60%] w-[10%] h-[10%] border border-red-500 bg-red-500/20"></div>
                      </div>
                      <span className="text-xs font-mono mt-2 text-slate-400">search_001.png</span>
                    </div>
                 </div>
               )}
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'Samples Generated', value: status === 'success' ? '100' : '0' },
               { label: 'Valid Pairs', value: status === 'success' ? '100' : '0' },
               { label: 'DRAM Samples', value: status === 'success' ? '50' : '0' },
               { label: 'FinFET Samples', value: status === 'success' ? '50' : '0' },
             ].map((m, i) => (
               <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg p-4 flex flex-col items-center text-center">
                 <span className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">{m.value}</span>
                 <span className="text-xs text-[var(--color-text-tertiary)] mt-1 uppercase tracking-wider">{m.label}</span>
               </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
}
