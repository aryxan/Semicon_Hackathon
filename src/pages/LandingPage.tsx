import { Link, useNavigate } from 'react-router-dom';
import { Crosshair, ArrowRight, Layers, Target, Maximize, AlertTriangle, TrendingUp, CheckCircle2, Cpu } from 'lucide-react';
import { useEffect, useState, useRef, ReactNode } from 'react';

function FadeInSection({ children }: { children: ReactNode }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Toggle visibility so it fades out when scrolled away
        setVisible(entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
      }`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      navigate('/inspection');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-[var(--color-accent)] selection:text-slate-900 relative overflow-x-hidden">
      
      {/* Loading Overlay */}
      {isLaunching && (
        <div className="fixed inset-0 z-[999] bg-[#020617]/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center">
            {/* Spinning loader */}
            <div className="w-32 h-32 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
            {/* Machine/CPU inside */}
            <Cpu className="absolute h-12 w-12 text-sky-400 animate-pulse" />
          </div>
          <h2 className="mt-10 text-xl font-bold text-sky-400 tracking-[0.2em] uppercase animate-pulse">
            Initializing Fabrication Environment
          </h2>
          <p className="text-slate-400 mt-4 font-mono text-sm">Calibrating measurement sensors...</p>
        </div>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="http://localhost:8080/bg-video2.mp4" type="video/mp4" />
        </video>
        {/* Natural dark overlay to maintain text readability without altering colors */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 pointer-events-auto">
        {/* Header */}
        <header className={`fixed top-0 inset-x-0 z-50 h-16 border-b transition-all duration-300 flex items-center justify-between px-8 ${
          hidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${scrolled ? 'bg-[#020617]/90 backdrop-blur-xl border-white/5' : 'bg-transparent border-transparent'}`}>
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="FabSight Logo" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-white">FabSight</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#challenge" className="hover:text-white transition-colors">The Challenge</a>
            <a href="#fabrication" className="hover:text-white transition-colors">Fabrication Drift</a>
            <a href="#workflow" className="hover:text-white transition-colors">6-Step Workflow</a>
            <a href="#team" className="hover:text-white transition-colors">Team</a>
          </div>
          <div>
            <button onClick={handleLaunch} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-4 py-2 rounded-full text-sm transition-all flex items-center backdrop-blur-md cursor-pointer">
              Launch App <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="w-full min-h-screen flex items-center justify-center pt-16 bg-transparent relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]/90 pointer-events-none"></div>
            <div className="flex flex-col items-center max-w-4xl text-center space-y-8 relative z-10">
               <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                 Monitoring Wafer <br className="hidden md:block"/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                   Evolution Over Time
                 </span>
               </h1>
               <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed whitespace-normal px-4">
                 Our system doesn't just locate SEM images. We monitor how a wafer changes throughout the fabrication process to identify when manufacturing errors begin to accumulate.
               </p>
               <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-8 justify-center w-full sm:w-auto">
                 <button onClick={handleLaunch} className="bg-[var(--color-accent)] hover:bg-sky-400 text-slate-950 font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transform hover:-translate-y-0.5 cursor-pointer">
                   Inline Inspection
                 </button>
                 <Link to="/dashboard" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-full transition-all flex items-center justify-center text-lg backdrop-blur-md">
                   Engineer Dashboard
                 </Link>
               </div>
            </div>
          </section>

        {/* The Navigation Challenge */}
        <section id="challenge" className="py-24 bg-[#020617]/40 backdrop-blur-md relative z-10 border-t border-white/5">
          <FadeInSection>
            <div className="max-w-6xl mx-auto px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 uppercase tracking-widest mb-4">
                  The Problem
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Nanoscale Navigation-Error Recovery</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Automated inspection relies on scale-aware image localization. Finding the original reference site within a lower-resolution, wider search field is exceptionally difficult due to three primary factors:
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-black/50 border border-slate-800 p-8 rounded-2xl hover:border-sky-500/50 transition-colors">
                  <Layers className="h-10 w-10 text-sky-400 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">Repeating Structures</h3>
                  <p className="text-slate-400 leading-relaxed">Layouts like DRAM and FinFETs are highly periodic, leading to false positives during automated pattern matching and registration.</p>
                </div>
                <div className="bg-black/50 border border-slate-800 p-8 rounded-2xl hover:border-sky-500/50 transition-colors">
                  <Maximize className="h-10 w-10 text-sky-400 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">Scale Difference</h3>
                  <p className="text-slate-400 leading-relaxed">The reference pattern often appears at a vastly different scale (e.g., a 10× resolution reduction) in the corresponding search image.</p>
                </div>
                <div className="bg-black/50 border border-slate-800 p-8 rounded-2xl hover:border-sky-500/50 transition-colors">
                  <Target className="h-10 w-10 text-sky-400 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">Imaging Noise</h3>
                  <p className="text-slate-400 leading-relaxed">Wider search fields typically suffer from lower resolution and higher noise, obscuring critical nanoscale features necessary for alignment.</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Fabrication Drift Context */}
        <section id="fabrication" className="py-24 bg-[#020617]/40 backdrop-blur-md border-t border-white/5 relative z-10">
          <FadeInSection>
            <div className="max-w-6xl mx-auto px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">The Reality of Wafer Fabrication</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  During every process, small errors naturally occur. Initially tiny, they accumulate over several stages.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Thermal Expansion', icon: TrendingUp },
                  { title: 'Stage Calibration Error', icon: Target },
                  { title: 'Overlay Misalignment', icon: Layers },
                  { title: 'Mechanical Vibration', icon: ActivityTriangle }
                ].map((card, i) => (
                  <div key={i} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:bg-slate-800/40 transition-colors">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mb-4">
                      <card.icon className="h-6 w-6 text-sky-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* 6-Step Workflow */}
        <section id="workflow" className="py-32 px-8 bg-[#04081c]/40 backdrop-blur-md relative z-10">
          <FadeInSection>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">System Workflow</h2>
                <p className="text-slate-400 text-lg">How we turn standard Inline Inspection into actionable drift analytics.</p>
              </div>

              <div className="space-y-12">
                <WorkflowStep 
                  number="1"
                  title="Wafer Fabrication"
                  desc="A silicon wafer enters the fab, undergoing Lithography, Etching, CMP, Metal deposition. Small errors accumulate at each step."
                />
                <WorkflowStep 
                  number="2"
                  title="Inline Inspection"
                  desc="Images are captured after critical stages (not continuously). We take these standard inspection images as inputs."
                />
                <WorkflowStep 
                  number="3"
                  title="Image Registration (OpenCV)"
                  desc="We don't look for defects yet. We measure geometric change (ΔX, ΔY, Rotation, Overlay) between the current image and previous stage."
                />
                <WorkflowStep 
                  number="4"
                  title="Historical Database"
                  desc="Measurements are stored for every wafer across every stage. We build a comprehensive history of how errors evolve."
                />
                <WorkflowStep 
                  number="5"
                  title="Predictive Analytics"
                  desc="Algorithms analyze the history of measurements to learn how errors accumulate, predict future drift, and identify abnormal process behavior."
                />
                <WorkflowStep 
                  number="6"
                  title="Engineer Dashboard"
                  desc="The UI displays current status, historical trends, risk analysis, and actionable recommendations for process engineers."
                />
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Team Responsibilities */}
        <section id="team" className="py-24 bg-[#020617]/40 backdrop-blur-md border-t border-white/5 relative z-10">
          <FadeInSection>
            <div className="max-w-6xl mx-auto px-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight">Cross-Functional Implementation</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <TeamCard 
                  role="Full Stack Engineer"
                  tasks={['Architect scalable telemetry dashboards', 'Build real-time visualization of wafer drift and inspection imagery', 'Develop interactive data grids and alert integrations', 'Orchestrate seamless integration of CV and AI microservices']}
                />
                <TeamCard 
                  role="VLSI Engineer"
                  tasks={['Define critical metrology and inline inspection parameters', 'Identify root causes of nanoscale process variations', 'Validate physical constraints and lithographic tolerances', 'Bridge algorithmic outputs with semiconductor fabrication realities']}
                />
                <TeamCard 
                  role="OpenCV Engineer"
                  tasks={['Develop scale-aware image registration algorithms', 'Calculate sub-pixel geometric drift (ΔX, ΔY, Rotation)', 'Filter high-frequency noise and repeating structure false-positives', 'Extract precision overlay error metrology']}
                />
                <TeamCard 
                  role="AI Engineer"
                  tasks={['Train machine learning models for temporal drift prediction', 'Conduct probabilistic risk assessment of batch yield degradation', 'Deploy early-warning systems for anomalous stage behaviors', 'Rank and isolate problematic fabrication stages']}
                />
              </div>
            </div>
          </FadeInSection>
        </section>

      </main>

      <footer className="py-12 px-8 border-t border-white/10 text-center bg-[#020617]/80 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img src="/favicon.svg" alt="FabSight Logo" className="h-8 w-8 grayscale opacity-70" />
          <span className="font-bold text-xl text-white tracking-tight">FabSight</span>
        </div>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Built for process engineers, combining VLSI domain expertise, OpenCV, and predictive analytics.
        </p>
      </footer>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center text-xl font-bold border border-sky-500/30">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-lg">{desc}</p>
      </div>
    </div>
  );
}

function TeamCard({ role, tasks }: { role: string, tasks: string[] }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-sky-500/30 transition-colors">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Cpu className="mr-3 h-5 w-5 text-sky-400" /> {role}
      </h3>
      <ul className="space-y-3">
        {tasks.map((task, i) => (
          <li key={i} className="flex items-start text-slate-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Temporary icon for one that didn't exist in imports
function ActivityTriangle(props: any) {
  return <AlertTriangle {...props} />;
}
