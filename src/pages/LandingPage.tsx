import { Link } from 'react-router-dom';
import { Crosshair, ArrowRight, Layers, Target, Maximize, Play, Database, Activity, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';
import WebThreads from '../components/ui/WebThreads';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-[var(--color-accent)] selection:text-slate-900 relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <WebThreads
          color1="#0ea5e9"
          color2="#3b82f6"
          color3="#FFFFFF"
          speed={0.2}
          threadCount={6}
          frequency={5.0}
          spread={0.18}
          taper={1.0}
          position={0.5}
          fanMode="center"
          glow={0.02}
          falloff={0.6}
          thickness={1.1}
          brightness={0.6}
          opacity={0.6}
          mirror={true}
          shimmer={true}
          grain={true}
          grainIntensity={0.05}
          mouseInteraction={true}
          mouseStrength={0.3}
        />
      </div>

      <div className="relative z-10 pointer-events-auto">
        {/* Header */}
        <header className={`fixed top-0 inset-x-0 z-50 h-16 border-b transition-all duration-300 flex items-center justify-between px-8 ${scrolled ? 'bg-[#020617]/90 backdrop-blur-xl border-white/5' : 'bg-transparent border-transparent'}`}>
          <div className="flex items-center space-x-2">
            <Crosshair className="h-6 w-6 text-[var(--color-accent)]" />
            <span className="font-bold text-xl tracking-tight text-white">Drift-Sense</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#pipeline" className="hover:text-white transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
          </div>
          <div>
            <Link to="/app" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-4 py-2 rounded-full text-sm transition-all flex items-center backdrop-blur-md">
              Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="w-full min-h-screen flex items-center justify-center pt-16 bg-transparent relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]/80 pointer-events-none"></div>
            <div className="flex flex-col items-center max-w-4xl text-center space-y-8 relative z-10">
               <div className="inline-flex items-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-1.5 text-sm text-[var(--color-accent)] backdrop-blur-md">
                 <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent)] mr-2 shadow-[0_0_8px_var(--color-accent)]"></span>
                 Nanoscale Navigation-Error Recovery
               </div>
               <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                 Finding a Needle in a <br className="hidden md:block"/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                   Nanoscale Haystack
                 </span>
               </h1>
               <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed whitespace-normal px-4">
                 Recovering precise inspection coordinates from navigation drift using scale-aware image localization. Designed for high-resolution semiconductor metrology.
               </p>
               <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-8 justify-center w-full sm:w-auto">
                 <Link to="/app" className="bg-[var(--color-accent)] hover:bg-sky-400 text-slate-950 font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transform hover:-translate-y-0.5">
                   Open Workspace
                 </Link>
                 <Link to="/about" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-full transition-all flex items-center justify-center text-lg backdrop-blur-md">
                   Explore Methodology
                 </Link>
               </div>
            </div>
          </section>

        {/* Metric Strip */}
        <section className="py-16 bg-[#020617]/50 backdrop-blur-md border-b border-white/5 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-8">
            {[
              { label: 'Scale Difference', value: '10×', icon: Maximize },
              { label: 'Image Resolution', value: '1000²', icon: Layers },
              { label: 'Reference Pixel', value: '1 nm', icon: Target },
              { label: 'Search Pixel', value: '10 nm', icon: Crosshair }
            ].map((metric) => (
              <div key={metric.label} className="flex flex-col items-center p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors group">
                <metric.icon className="w-6 h-6 text-slate-500 mb-4 group-hover:text-[var(--color-accent)] transition-colors" />
                <span className="text-3xl font-bold text-white font-mono tracking-tight">{metric.value}</span>
                <span className="text-xs text-slate-400 mt-2 uppercase tracking-[0.2em]">{metric.label}</span>
              </div>
            ))}
          </div>
        </section>


        {/* The Problem Section */}
        <section id="problem" className="py-32 px-8 bg-[#04081c]/50 backdrop-blur-md relative z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Finding the Same Site at a Different Scale</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                During automated inspection, stage movement introduces positional errors. Our system locates the original high-resolution region inside a lower-resolution, wider search field.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
              {/* Reference */}
              <div className="flex flex-col items-center">
                <div className="w-56 h-56 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <Target className="h-16 w-16 text-[var(--color-accent)] z-10" />
                  <div className="absolute bottom-3 left-3 text-xs font-mono bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">1 µm × 1 µm</div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-semibold text-lg text-white tracking-wide">REFERENCE</h3>
                  <p className="text-sm text-slate-500 mt-1">100× zoom (1 nm/px)</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
                  <Maximize className="h-6 w-6 text-sky-400" />
                </div>
                <span className="text-xs font-mono text-sky-400 tracking-widest bg-sky-400/10 px-3 py-1 rounded-full">10× SCALE</span>
              </div>

              {/* Search */}
              <div className="flex flex-col items-center">
                <div className="w-80 h-80 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik00MCAwaC0xdjQwaDFWMHptMC0xdjFIMHYtMWg0MHpNMCA0MHYtMWg0MHYxSDB6IiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+')] opacity-20"></div>
                   {/* Target Box */}
                   <div className="absolute top-[60%] left-[30%] w-[10%] h-[10%] border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                     <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-ping"></div>
                   </div>
                   <div className="absolute bottom-3 left-3 text-xs font-mono bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">10 µm × 10 µm</div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-semibold text-lg text-white tracking-wide">WIDE SEARCH</h3>
                  <p className="text-sm text-slate-500 mt-1">10× zoom (10 nm/px)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why it is hard */}
        <section className="py-32 px-8 bg-[#020617]/50 backdrop-blur-md relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Why Ordinary Template Matching Fails</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Repeating Structures', desc: 'DRAM and FinFET layouts contain highly periodic structures leading to multiple false positives.' },
                { title: 'Scale Difference', desc: 'The reference pattern appears at a true 10× reduced scale in the search image.' },
                { title: 'Imaging Noise', desc: 'Search images are noisier and captured at lower resolutions, obscuring fine details.' },
                { title: 'Navigation Drift', desc: 'Stage movement introduces positional errors, meaning the target could be anywhere.' }
              ].map((card, i) => (
                <div key={i} className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/40 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pipeline Section */}
        <section id="pipeline" className="py-32 px-8 bg-[#04081c]/50 backdrop-blur-md border-t border-white/5 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight">How Drift-Sense Works</h2>
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 text-sm font-mono">
              {['INPUT', '10× SCALE-AWARE PROCESSING', 'PATTERN SEARCH', 'CANDIDATE MATCHES', 'CENTER SELECTION', 'COORDINATE OUTPUT'].map((step, i, arr) => (
                <div key={i} className="flex items-center">
                  <div className="px-5 py-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-sky-100 shadow-lg">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-5 w-5 mx-2 text-slate-600" />}
                </div>
              ))}
            </div>
            <div className="mt-12 text-center text-slate-500 text-sm max-w-2xl mx-auto bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
              <span className="text-sky-400 font-bold mr-2">*</span> 
              If multiple candidate matches are detected with similar confidence, the system automatically selects the candidate closest to the search image center, mitigating errors in highly periodic regions.
            </div>
          </div>
        </section>

      </main>

      <footer className="py-16 px-8 border-t border-white/10 text-center bg-[#020617]/50 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Crosshair className="h-6 w-6 text-sky-400" />
          <span className="font-bold text-2xl text-white tracking-tight">Drift-Sense</span>
        </div>
        <p className="mb-8 max-w-md mx-auto text-slate-400 text-lg">Nanoscale navigation-error recovery through scale-aware image localization.</p>
        <p className="text-sm text-slate-600 max-w-xl mx-auto pt-8 border-t border-white/5">
          Synthetic demonstration interface. Production inference requires connection to the localization backend.
        </p>
      </footer>
      </div>
    </div>
  );
}
