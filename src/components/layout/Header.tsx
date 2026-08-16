import { Bell, Settings, ActivitySquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center space-x-4">
        <Link to="/app" className="flex items-center space-x-2 text-sky-500 mr-4">
          <img src="/favicon.svg" alt="SemSight" className="h-7 w-7" />
          <span className="text-xl font-bold font-mono tracking-wider">SEM<span className="text-white">SIGHT</span></span>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-5">
        <div className="flex space-x-4 text-xs font-mono uppercase tracking-wider text-slate-400">
          <span>Dataset: <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Live DB</span></span>
          <span>Status: <span className="text-emerald-500 font-bold">ONLINE</span></span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white border border-white/10 shadow-inner">
          SS
        </div>
      </div>
    </header>
  );
}
