import { Target, Crosshair, ArrowRight, Save, Activity, Settings, AlertTriangle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { ProcessStage, CVResult } from '../types';
import { RealCVProvider } from '../services/realProviders';
import { getWaferById, waferDatabase } from '../data/wafers';
import { useAppContext } from '../context/AppContext';

const cvProvider = new RealCVProvider();
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:49999';

// Based on calibration: 1 px = 10 nm
const PX_TO_NM = 10.0;

export default function InlineInspection() {
  const { selectedWaferId, setSelectedWaferId, updateWaferFromCV, wafers } = useAppContext() as any;
  
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<CVResult | null>(null);
  
  const selectedWafer = selectedWaferId || getWaferById(null).waferId;
  const [selectedStage, setSelectedStage] = useState<ProcessStage>('Metal-1');

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResults(null);
    
    try {
      const stageMap: Record<string, string> = {
        'Lithography': '1_01_Lithography',
        'Etching': '2_02_Etch',
        'CMP': '3_03_CMP',
        'Metal-1': '4_04_Metal1'
      };
      const searchImg = `${selectedWafer.replace('W-', 'WF-')}_Stage${stageMap[selectedStage]}.png`;

      const res = await cvProvider.locate({
        waferId: selectedWafer,
        stage: selectedStage,
        referenceImage: '000_golden_reference.png',
        searchImage: searchImg
      });
      setResults(res);
      updateWaferFromCV(selectedWafer, res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            Inline Inspection
            <span className="ml-4 bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-xs tracking-wider uppercase">OpenCV Live</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
            Real OpenCV geometric measurement and scale-aware localization.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-6 items-center">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Wafer ID</label>
          <select 
            value={selectedWafer}
            onChange={(e) => { setSelectedWaferId(e.target.value); setResults(null); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
          >
            {(wafers || []).slice(0, 30).map((w: any) => (
              <option key={w.waferId} value={w.waferId}>{w.waferId} ({w.status})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Process Stage</label>
          <select 
            value={selectedStage}
            onChange={(e) => { setSelectedStage(e.target.value as ProcessStage); setResults(null); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="Lithography">Lithography</option>
            <option value="Etching">Etching</option>
            <option value="CMP">CMP</option>
            <option value="Metal-1">Metal-1</option>
          </select>
        </div>
        <div className="flex-none pt-5">
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-[var(--color-accent)] hover:bg-sky-400 text-slate-950 font-semibold py-2 px-6 rounded-lg flex items-center transition-all disabled:opacity-50"
          >
            {analyzing ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {analyzing ? 'Analyzing...' : 'Run Registration'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center"><Settings className="mr-2 h-5 w-5 text-sky-400" /> Image Inputs</span>
              <span className="text-xs text-slate-500">Golden Ref → Current</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative">
                <div className="absolute top-2 left-2 bg-black/60 text-[10px] text-white px-2 py-1 rounded z-10">REFERENCE (1000x1000)</div>
                <div className="absolute top-2 right-2 bg-black/60 text-[10px] text-sky-400 font-mono px-2 py-1 rounded z-10">1 nm/px</div>
                <div className="aspect-square bg-slate-900 flex items-center justify-center p-4">
                  <img src={`${API_BASE}/images/000_golden_reference.png`} alt="Golden Ref" className="w-full h-full object-contain opacity-80 border-4 border-slate-700/50 rounded" />
                </div>
              </div>

              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative">
                <div className="absolute top-2 left-2 bg-black/60 text-[10px] text-white px-2 py-1 rounded z-10">SEARCH IMAGE (1000x1000)</div>
                <div className="absolute top-2 right-2 bg-black/60 text-[10px] text-slate-400 font-mono px-2 py-1 rounded z-10">10 nm/px</div>
                <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  <img src={`${API_BASE}/images/${selectedWafer.replace('W-', 'WF-')}_Stage${selectedStage === 'Lithography' ? '1_01_Lithography' : selectedStage === 'Etching' ? '2_02_Etch' : selectedStage === 'CMP' ? '3_03_CMP' : '4_04_Metal1'}.png`} alt="Search" className="w-full h-full object-cover opacity-60" />
                   
                   {/* Scanning animation */}
                   {analyzing && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/20 to-transparent animate-[scan_1.5s_ease-in-out_infinite]"></div>}
                   
                   {/* Result match region */}
                   {results && results.matchStatus !== 'FAILED' && (
                     <div 
                       className={`absolute border-2 ${results.matchStatus === 'MATCH' ? 'border-emerald-500' : 'border-amber-500'} bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-300`}
                       style={{ 
                         left: `${(results.matchRegion.x / 1000) * 100}%`, 
                         top: `${(results.matchRegion.y / 1000) * 100}%`, 
                         width: `${(results.matchRegion.width / 1000) * 100}%`, 
                         height: `${(results.matchRegion.height / 1000) * 100}%` 
                       }}
                     >
                       <Crosshair className={`h-4 w-4 ${results.matchStatus === 'MATCH' ? 'text-emerald-500' : 'text-amber-500'}`} />
                     </div>
                   )}

                   {results && results.matchStatus === 'FAILED' && (
                     <div className="absolute inset-0 flex items-center justify-center bg-rose-950/40">
                       <AlertCircle className="h-12 w-12 text-rose-500 opacity-80" />
                     </div>
                   )}
                </div>
              </div>
            </div>

            {analyzing && (
              <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex justify-between text-xs text-sky-400 mb-2 font-mono">
                  <span>Processing...</span>
                  <span className="animate-pulse">Running OpenCV SIFT...</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-400 h-1.5 rounded-full animate-[progress_1.5s_ease-in-out]"></div>
                </div>
              </div>
            )}
          </div>

          {results && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Localization Confidence</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Overall Match</span>
                    <span className={results.confidence > 90 ? 'text-emerald-400' : results.confidence > 70 ? 'text-amber-400' : 'text-rose-400'}>{results.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${results.confidence > 90 ? 'bg-emerald-500' : results.confidence > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${results.confidence}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Scale Consistency</span>
                    <span className="text-slate-300">{results.metrics.scaleConsistency.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${results.metrics.scaleConsistency}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Geometric Fit</span>
                    <span className="text-slate-300">{results.metrics.geometricFit.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${results.metrics.geometricFit}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Inlier Quality</span>
                    <span className="text-slate-300">{results.metrics.inlierQuality.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${results.metrics.inlierQuality}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-6">Metrology Output</h2>
            
            {!results && !analyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <Target className="h-10 w-10 mb-4 opacity-20" />
                <p>Run registration to extract errors.</p>
              </div>
            )}
            
            {analyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-sky-400 border-2 border-dashed border-sky-900/50 rounded-xl">
                <Activity className="h-10 w-10 mb-4 animate-spin opacity-50" />
                <p className="animate-pulse font-mono text-sm">Calculating geometric parameters...</p>
              </div>
            )}

            {results && (
              <div className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {results.matchStatus === 'FAILED' ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-rose-400 mb-2">LOCALIZATION FAILED</h3>
                    <p className="text-slate-400 text-sm">Feature matching confidence fell below the acceptable threshold (65%). Cannot reliably extract metrology data.</p>
                  </div>
                ) : (
                  <>
                    {results.matchStatus === 'LOW_CONFIDENCE' && (
                      <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-lg flex items-start text-sm">
                        <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                        <p><strong>Low Confidence Match:</strong> The registration succeeded but confidence is below optimal levels. Manual review recommended.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">ΔX Displacement</span>
                        <div className="flex items-end justify-between">
                          <span className={`text-2xl font-mono ${Math.abs(results.xError * PX_TO_NM) > 10 ? 'text-rose-400' : 'text-white'}`}>
                            {results.xError * PX_TO_NM > 0 ? '+' : ''}{(results.xError * PX_TO_NM).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 mb-1">nm</span>
                        </div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">ΔY Displacement</span>
                        <div className="flex items-end justify-between">
                          <span className={`text-2xl font-mono ${Math.abs(results.yError * PX_TO_NM) > 10 ? 'text-rose-400' : 'text-white'}`}>
                            {results.yError * PX_TO_NM > 0 ? '+' : ''}{(results.yError * PX_TO_NM).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 mb-1">nm</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Rotation</span>
                        <span className="text-xl font-mono text-slate-300 block">{results.rotation > 0 ? '+' : ''}{results.rotation.toFixed(3)}°</span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Scale</span>
                        <span className="text-xl font-mono text-slate-300 block">{results.scale.toFixed(4)}×</span>
                      </div>

                      <div className="col-span-2 bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Total Overlay Error</span>
                          <span className={`text-3xl font-mono ${results.overlayError * PX_TO_NM > 10 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {(results.overlayError * PX_TO_NM).toFixed(2)} nm
                          </span>
                        </div>
                        <div className="text-right">
                          {results.overlayError * PX_TO_NM > 10 ? (
                            <span className="inline-flex items-center bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider">OUT OF TOLERANCE</span>
                          ) : (
                            <span className="inline-flex items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider">WITHIN TOLERANCE</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-slate-500 block mb-0.5">Matched Center</span>
                        <span className="font-mono text-sky-400">({results.centerX.toFixed(1)}, {results.centerY.toFixed(1)})</span>
                      </div>
                      <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center text-white border border-white/10">
                        <Save className="h-4 w-4 mr-2" /> Save Results
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
