import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Target, Maximize, AlertTriangle, TrendingUp, CheckCircle2, Cpu } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import SpecularButton from '../components/ui/SpecularButton';

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
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-[var(--color-accent)] selection:text-slate-900 relative overflow-x-hidden">
      
      {/* Loading Overlay */}
      {isLaunching && (
          <div className="fixed inset-0 z-[999] bg-[#020617]/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center mb-12">
              <div className="absolute w-40 h-40 border border-sky-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute w-32 h-32 border border-sky-500/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="w-24 h-24 border-4 border-slate-800 border-t-sky-400 border-b-sky-400 rounded-full animate-[spin_2s_linear_infinite]"></div>
              <img src="/favicon.svg" alt="SemSight" className="absolute h-12 w-12 animate-pulse drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-[0.3em] uppercase mb-4 shadow-sky-500/50">
              Initializing SemSight
            </h2>
            <div className="flex space-x-2 items-center text-sky-400 font-mono text-sm">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="ml-3 tracking-widest text-slate-400">CONNECTING TO FAB METROLOGY</span>
            </div>
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
          <source src="/bg-video2.mp4" type="video/mp4" />
        </video>
        {/* Natural dark overlay to maintain text readability without altering colors */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 pointer-events-auto">
        {/* Header */}
        <header className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 flex items-center justify-between px-8 ${
          hidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${scrolled ? 'bg-[#020617]/90 backdrop-blur-xl' : 'bg-transparent border-transparent'}`}>
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
            <SpecularButton
              size="sm"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              blur={10}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#020617"
              intensity={1.2}
              shineSize={10}
              shineFade={20}
              thickness={1}
              onClick={handleLaunch}
              className="font-semibold flex items-center"
            >
              Launch App <ArrowRight className="ml-2 h-4 w-4" />
            </SpecularButton>
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
                 <SpecularButton
                   size="lg"
                   radius={9999}
                   tint="#38bdf8"
                   tintOpacity={0.15}
                   blur={12}
                   textColor="#ffffff"
                   lineColor="#38bdf8"
                   baseColor="#020617"
                   intensity={1.5}
                   shineSize={15}
                   shineFade={35}
                   thickness={2}
                   followMouse
                   onClick={handleLaunch}
                 >
                   Inline Inspection
                 </SpecularButton>
                 <SpecularButton
                   size="lg"
                   radius={9999}
                   tint="#ffffff"
                   tintOpacity={0.05}
                   blur={12}
                   textColor="#ffffff"
                   lineColor="#ffffff"
                   baseColor="#020617"
                   intensity={1.2}
                   shineSize={15}
                   shineFade={35}
                   thickness={1.5}
                   followMouse
                   onClick={handleLaunch}
                 >
                   Engineer Dashboard
                 </SpecularButton>
               </div>
            </div>
          </section>

        {/* The Navigation Challenge */}
        <section id="challenge" className="py-48 bg-[#020617]/40 backdrop-blur-md relative z-10">
          <FadeInSection>
            <div className="max-w-6xl mx-auto px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Nanoscale Navigation-Error Recovery</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                  Automated inspection relies on scale-aware image localization. Finding the original reference site within a lower-resolution, wider search field is exceptionally difficult due to three primary factors:
                </p>
                <SpecularButton
                  size="md"
                  radius={9999}
                  tint="#ffffff"
                  tintOpacity={0.05}
                  blur={10}
                  textColor="#ffffff"
                  lineColor="#ffffff"
                  baseColor="#020617"
                  intensity={1.2}
                  shineSize={10}
                  shineFade={20}
                  thickness={1}
                  onClick={() => document.getElementById('fabrication')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Root Causes <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </SpecularButton>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800/80 transition-colors">
                  <Layers className="h-10 w-10 text-slate-400 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">Repeating Structures</h3>
                  <p className="text-slate-400 leading-relaxed">Layouts like DRAM and FinFETs are highly periodic, leading to false positives during automated pattern matching and registration.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800/80 transition-colors">
                  <Maximize className="h-10 w-10 text-slate-400 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">Scale Difference</h3>
                  <p className="text-slate-400 leading-relaxed">The reference pattern often appears at a vastly different scale (e.g., a 10x resolution reduction) in the corresponding search image.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800/80 transition-colors">
                  <Target className="h-10 w-10 text-slate-400 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">Imaging Noise</h3>
                  <p className="text-slate-400 leading-relaxed">Wider search fields typically suffer from lower resolution and higher noise, obscuring critical nanoscale features necessary for alignment.</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Fabrication Drift Context */}
        <section id="fabrication" className="py-48 bg-[#020617]/40 backdrop-blur-md relative z-10">
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
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-slate-800/80 transition-colors">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                      <card.icon className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* 6-Step Workflow */}
        <section id="workflow" className="py-48 px-8 bg-[#04081c]/40 backdrop-blur-md relative z-10">
          <FadeInSection>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">System Workflow</h2>
                <p className="text-slate-400 text-lg">How we turn standard Inline Inspection into actionable drift analytics.</p>
              </div>

              <div className="space-y-12">
                <WorkflowStep 
                  number="1"
                  title="Automated Wafer Simulation"
                  desc="A headless Python daemon operates as a live fab environment, continuously dispatching batches of wafers and streaming mock SEM inspection imagery to the system."
                />
                <WorkflowStep 
                  number="2"
                  title="REST API & Telemetry"
                  desc="A FastAPI backend orchestrates the pipeline, receiving inspection requests and persistently logging all temporal wafer telemetry into a local SQLite database."
                />
                <WorkflowStep 
                  number="3"
                  title="Scale-Aware Image Registration"
                  desc="A custom OpenCV pipeline isolates geometric drift (X/Y shift, Rotation, Scale) by aligning 10x scaled reference patterns against noisy, wider search fields using robust feature matching."
                />
                <WorkflowStep 
                  number="4"
                  title="XGBoost Risk Prediction"
                  desc="Extracted drift parameters are piped into an XGBoost classifier, evaluating stage-by-stage geometric error accumulation to predict batch failure probabilities."
                />
                <WorkflowStep 
                  number="5"
                  title="TreeSHAP Explainability"
                  desc="The ML engine extracts SHAP drivers in real-time, translating black-box risk scores into actionable geometric features (e.g., 'Stage 3 Overlay Error')."
                />
                <WorkflowStep 
                  number="6"
                  title="Ollama AI Copilot & Dashboard"
                  desc="An integrated LLM analyzes the telemetry and SHAP data to generate automated Root Cause Analysis reports directly inside the responsive React dashboard."
                />
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Team Responsibilities */}
        <section id="team" className="py-48 bg-[#020617]/40 backdrop-blur-md relative z-10">
          <FadeInSection>
            <div className="max-w-6xl mx-auto px-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight">Core System Architecture</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <TeamCard 
                  role="Frontend Interface"
                  tasks={['Built a React + Vite responsive SPA with modern Tailwind CSS styling', 'Implemented global Context state with 5-second live database polling', 'Developed interactive UI components including real-time System Health monitoring', 'Designed a glassmorphic aesthetic with cinematic background layers']}
                />
                <TeamCard 
                  role="Backend Engineering"
                  tasks={['Deployed a FastAPI microservice to orchestrate CV and ML processing', 'Integrated SQLite for persistent wafer telemetry and history tracking', 'Developed automated background daemons mimicking live metrology networks', 'Built robust health-check endpoints for seamless frontend integration']}
                />
                <TeamCard 
                  role="Computer Vision Engine"
                  tasks={['Implemented scale-aware image alignment using OpenCV ORB feature matching', 'Resolved 10x resolution differentials between reference and search fields', 'Calculated sub-pixel geometric drift using robust affine transformations', 'Mitigated noise and repeating-structure false positives via RANSAC filtering']}
                />
                <TeamCard 
                  role="Machine Learning Pipeline"
                  tasks={['Integrated XGBoost for high-accuracy temporal batch risk prediction', 'Extracted TreeSHAP (SHapley Additive exPlanations) for explainable AI', 'Connected a local Ollama LLM (Qwen) for automated Root Cause Analysis', 'Engineered structured prompt pipelines translating SHAP arrays into engineering insights']}
                />
              </div>
            </div>
          </FadeInSection>
        </section>

      </main>

      <footer className="py-16 px-8 bg-[#020617] border-t border-slate-800 relative z-10 w-full">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xs">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/favicon.svg" alt="SemSight Logo" className="h-8 w-8" />
              <span className="font-bold text-xl text-white tracking-tight">SemSight</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pioneering automated yield analytics for next-generation semiconductor metrology.
            </p>
          </div>
          
          <div className="flex gap-16 text-sm text-center md:text-left">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#" className="hover:text-sky-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800/50 text-center flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>© 2026 SemSight, Inc. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl font-bold border border-slate-700">
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:bg-slate-800/80 transition-colors">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Cpu className="mr-3 h-5 w-5 text-slate-400" /> {role}
      </h3>
      <ul className="space-y-3">
        {tasks.map((task, i) => (
          <li key={i} className="flex items-start text-slate-300">
            <CheckCircle2 className="h-5 w-5 text-slate-500 mr-3 flex-shrink-0 mt-0.5" />
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

