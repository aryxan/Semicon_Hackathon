import { Target, Crosshair, ArrowRight, Save, Activity } from 'lucide-react';
import { useState } from 'react';

export default function InlineInspection() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{ dx: string, dy: string, rot: string, overlay: string, conf: string } | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setResults({
        dx: '+8.2 nm',
        dy: '-5.1 nm',
        rot: '0.04°',
        overlay: '2.1 nm',
        conf: '95%'
      });
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inline Inspection</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
            Simulate OpenCV geometric measurement between process layers.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Crosshair className="mr-2 h-5 w-5 text-sky-400" /> Image Registration
            </h2>
            <div className="flex gap-4 items-center justify-center bg-[#020617] p-8 rounded-lg border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
              
              <div className="relative text-center">
                <div className="w-32 h-32 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-16 h-16 border-2 border-slate-500 rounded opacity-50"></div>
                </div>
                <span className="text-xs text-slate-400">Previous Stage (Reference)</span>
              </div>
              
              <ArrowRight className="h-6 w-6 text-slate-500 z-10" />
              
              <div className="relative text-center">
                <div className="w-32 h-32 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                   <div className={`absolute inset-0 bg-sky-500/10 transition-opacity ${analyzing ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                   {analyzing && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/20 to-transparent animate-[scan_2s_ease-in-out_infinite]"></div>}
                   <div className={`w-16 h-16 border-2 border-sky-400 rounded transition-all duration-1000 ${results ? 'translate-x-1 -translate-y-1 rotate-3' : ''}`}></div>
                </div>
                <span className="text-xs text-slate-400">Current Stage (Search)</span>
              </div>
            </div>
            
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-6 bg-[var(--color-accent)] hover:bg-sky-400 text-slate-950 font-semibold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Activity className="h-5 w-5 mr-2 animate-spin" /> Extracting Geometric Errors...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" /> Run OpenCV Registration
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-6">Measurement Output</h2>
            
            {!results && !analyzing && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <Activity className="h-10 w-10 mb-4 opacity-20" />
                <p>Run registration to extract errors.</p>
              </div>
            )}
            
            {analyzing && (
              <div className="flex flex-col items-center justify-center h-48 text-sky-400">
                <div className="flex space-x-1 mb-4">
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="animate-pulse">Calculating drift parameters...</p>
              </div>
            )}

            {results && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#020617] p-4 rounded-lg border border-white/5">
                    <span className="text-sm text-slate-400 block mb-1">ΔX Displacement</span>
                    <span className="text-2xl font-mono text-sky-400">{results.dx}</span>
                  </div>
                  <div className="bg-[#020617] p-4 rounded-lg border border-white/5">
                    <span className="text-sm text-slate-400 block mb-1">ΔY Displacement</span>
                    <span className="text-2xl font-mono text-sky-400">{results.dy}</span>
                  </div>
                  <div className="bg-[#020617] p-4 rounded-lg border border-white/5">
                    <span className="text-sm text-slate-400 block mb-1">Rotation</span>
                    <span className="text-2xl font-mono text-sky-400">{results.rot}</span>
                  </div>
                  <div className="bg-[#020617] p-4 rounded-lg border border-white/5">
                    <span className="text-sm text-slate-400 block mb-1">Overlay Error</span>
                    <span className="text-2xl font-mono text-amber-400">{results.overlay}</span>
                  </div>
                </div>
                
                <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-lg flex justify-between items-center mt-4">
                  <div>
                    <span className="text-sm text-sky-200 block">Matching Score</span>
                    <span className="text-lg font-bold text-sky-400">{results.conf}</span>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center text-white">
                    <Save className="h-4 w-4 mr-2" /> Save to Database
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
