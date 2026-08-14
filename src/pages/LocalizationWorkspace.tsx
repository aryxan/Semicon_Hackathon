import React, { useState } from 'react';
import { Upload, Play, CheckCircle2, Crosshair, Map, Image as ImageIcon, Copy, Download, AlertCircle } from 'lucide-react';

interface MatchCandidate {
  id: number;
  x: number;
  y: number;
  similarity: number;
  distanceFromCenter: number;
  status: 'Selected' | 'Rejected';
}

interface LocalizationResult {
  x: number;
  y: number;
  normX: number;
  normY: number;
  scale: number;
  confidence: number;
  runtime: number;
}

export default function LocalizationWorkspace() {
  const [refImage, setRefImage] = useState<File | null>(null);
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<LocalizationResult | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  
  const handleLoadDemo = () => {
    // Simulated demo mode
    setStatus('idle');
    // We would normally set fake File objects or URLs here, but for now we'll just simulate the state
    setTimeout(() => {
      handleRunLocalization();
    }, 500);
  };

  const handleRunLocalization = () => {
    setStatus('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      setCandidates([
        { id: 1, x: 243.2, y: 311.4, similarity: 91.2, distanceFromCenter: 328, status: 'Rejected' },
        { id: 2, x: 486.7, y: 521.3, similarity: 97.8, distanceFromCenter: 42.3, status: 'Selected' },
        { id: 3, x: 731.8, y: 688.1, similarity: 95.1, distanceFromCenter: 401, status: 'Rejected' },
      ]);
      setResult({
        x: 486.72,
        y: 521.34,
        normX: 48.67,
        normY: 52.13,
        scale: 10.0,
        confidence: 97.8,
        runtime: 184
      });
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[var(--color-border-light)] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Localization Workspace</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Locate the high-resolution reference pattern inside the 10× wide-search field.</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleLoadDemo}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)] rounded-md text-sm font-medium transition-colors"
          >
            Load Demo
          </button>
          <button 
            onClick={handleRunLocalization}
            disabled={status === 'processing'}
            className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-slate-950 rounded-md text-sm font-semibold transition-colors flex items-center disabled:opacity-50"
          >
            {status === 'processing' ? (
              <><span className="animate-pulse mr-2 h-2 w-2 bg-slate-950 rounded-full"></span> Processing...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Run Localization</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Inputs & Viewer */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Upload Area */}
          <div className="grid grid-cols-2 gap-4">
            {/* Reference Upload */}
            <div className="border border-dashed border-[var(--color-border-light)] hover:border-[var(--color-accent)] bg-[var(--color-surface)] rounded-lg p-6 flex flex-col items-center justify-center text-center h-48 cursor-pointer transition-colors relative group">
              <Upload className="w-8 h-8 text-[var(--color-text-tertiary)] mb-3 group-hover:text-[var(--color-accent)] transition-colors" />
              <p className="text-sm font-medium">Upload Reference Image</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">1000 × 1000 px Grayscale</p>
            </div>
            
            {/* Search Upload */}
            <div className="border border-dashed border-[var(--color-border-light)] hover:border-[var(--color-accent)] bg-[var(--color-surface)] rounded-lg p-6 flex flex-col items-center justify-center text-center h-48 cursor-pointer transition-colors relative group">
              <Upload className="w-8 h-8 text-[var(--color-text-tertiary)] mb-3 group-hover:text-[var(--color-accent)] transition-colors" />
              <p className="text-sm font-medium">Upload Search Image</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">10× field of view</p>
            </div>
          </div>

          {/* Analysis Viewer Placeholder */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg h-[600px] flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-light)] bg-[#0A0F1C]">
              <span className="text-sm font-medium flex items-center"><Map className="w-4 h-4 mr-2 text-[var(--color-accent)]"/> Analysis Viewer</span>
              <div className="flex space-x-2 text-xs">
                 <label className="flex items-center space-x-1 cursor-pointer">
                   <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/>
                   <span>Candidates</span>
                 </label>
                 <label className="flex items-center space-x-1 cursor-pointer">
                   <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/>
                   <span>Grid</span>
                 </label>
              </div>
            </div>
            <div className="flex-1 bg-black/50 relative flex items-center justify-center">
               {status === 'processing' && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-sm">
                   <div className="flex flex-col items-center">
                     <div className="w-64 h-1 bg-slate-800 rounded overflow-hidden mb-4">
                       <div className="h-full bg-[var(--color-accent)] w-1/2 animate-[bounce_1s_infinite]"></div>
                     </div>
                     <span className="text-sm text-[var(--color-accent)] font-mono animate-pulse">Running Scale-Aware Localization...</span>
                   </div>
                 </div>
               )}
               {status === 'success' ? (
                 <div className="w-[500px] h-[500px] border border-slate-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik00MCAwaC0xdjQwaDFWMHptMC0xdjFIMHYtMWg0MHpNMCA0MHYtMWg0MHYxSDB6IiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+')] relative">
                    <div className="absolute top-[52.13%] left-[48.67%] w-12 h-12 -ml-6 -mt-6 border-2 border-[var(--color-accent)] flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                      <Crosshair className="w-full h-full text-[var(--color-accent)] opacity-80" />
                    </div>
                 </div>
               ) : (
                 <div className="text-[var(--color-text-tertiary)] flex flex-col items-center">
                   <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                   <p>Upload images or Load Demo to view</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Results & Candidates */}
        <div className="space-y-6">
          
          {/* Result Panel */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50">
              <h3 className="font-medium text-[var(--color-text-primary)]">Localization Result</h3>
            </div>
            <div className="p-4">
              {status === 'success' && result ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded p-3 border border-slate-800">
                       <span className="text-xs text-[var(--color-text-tertiary)] block mb-1">Predicted X</span>
                       <span className="text-2xl font-mono text-[var(--color-text-primary)]">{result.x.toFixed(2)}<span className="text-sm text-[var(--color-text-tertiary)] ml-1">px</span></span>
                    </div>
                    <div className="bg-slate-900 rounded p-3 border border-slate-800">
                       <span className="text-xs text-[var(--color-text-tertiary)] block mb-1">Predicted Y</span>
                       <span className="text-2xl font-mono text-[var(--color-text-primary)]">{result.y.toFixed(2)}<span className="text-sm text-[var(--color-text-tertiary)] ml-1">px</span></span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="text-[var(--color-text-secondary)]">Scale</span>
                    <span className="text-right font-mono">{result.scale.toFixed(1)}×</span>
                    
                    <span className="text-[var(--color-text-secondary)]">Confidence</span>
                    <span className="text-right font-mono text-emerald-400">{result.confidence}%</span>
                    
                    <span className="text-[var(--color-text-secondary)]">Processing Time</span>
                    <span className="text-right font-mono">{result.runtime} ms</span>
                  </div>

                  <div className="flex space-x-2 pt-2 border-t border-[var(--color-border-light)]">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-sm py-2 rounded transition-colors flex items-center justify-center">
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </button>
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-sm py-2 rounded transition-colors flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
                  Awaiting localization...
                </div>
              )}
            </div>
          </div>

          {/* Candidate Matches */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-medium text-[var(--color-text-primary)]">Candidate Matches</h3>
              {status === 'success' && <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-300">{candidates.length} Found</span>}
            </div>
            <div className="p-4">
              {status === 'success' ? (
                <div className="space-y-3">
                  {candidates.map((c, i) => (
                    <div key={i} className={`p-3 rounded border text-sm ${c.status === 'Selected' ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]' : 'bg-slate-900/50 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Candidate #{c.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${c.status === 'Selected' ? 'bg-[var(--color-accent)] text-slate-900 font-semibold' : 'bg-slate-800 text-slate-400'}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-slate-400 font-mono">
                        <span>X: {c.x}</span>
                        <span>Y: {c.y}</span>
                        <span>Sim: {c.similarity}%</span>
                        <span>Dist: {c.distanceFromCenter}px</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded flex items-start text-xs text-blue-200">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                    <p>Multiple visually similar regions detected. Candidate #2 selected because it is closest to the search-image center.</p>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
                  No candidates yet
                </div>
              )}
            </div>
          </div>
          
          {/* Pipeline */}
           <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
             <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-900/50">
              <h3 className="font-medium text-[var(--color-text-primary)]">Processing Pipeline</h3>
            </div>
            <div className="p-4 space-y-4">
              {['Scale normalization', 'Candidate search', 'Similarity scoring', 'Coordinate estimation'].map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{step}</div>
                    <div className="text-xs text-slate-500 font-mono">{status === 'success' ? `${Math.floor(Math.random() * 50 + 10)} ms` : 'Pending'}</div>
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
