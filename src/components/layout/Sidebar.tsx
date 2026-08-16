import { Link, useLocation } from 'react-router-dom';
import { Database, Home, ActivitySquare, Crosshair, Layers, Hexagon, Settings, User, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SystemHealthPanel } from '../system/SystemHealthPanel';
import { useAppContext } from '../../context/AppContext';

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Inline Inspection', href: '/inspection', icon: Crosshair },
  { name: 'Wafer History', href: '/history', icon: Database },
  { name: 'Engineer Dashboard', href: '/dashboard', icon: ActivitySquare },
];

const secondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAppContext();

  return (
    <div className="hidden md:flex w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex-col h-full shadow-2xl">
      {/* Branding Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-lg">
            <img src="/favicon.svg" alt="SemSight" className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">SEMSIGHT</h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-sky-400">Yield Analytics</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-8 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Core Modules
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={twMerge(
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out',
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 shadow-[inset_2px_0_0_0_#38bdf8]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200',
                    isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            System
          </div>
          {secondaryNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200 ease-in-out"
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-5 w-5 text-slate-500 group-hover:text-slate-300 transition-colors duration-200"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 ease-in-out"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-rose-500/70 group-hover:text-rose-400 transition-colors duration-200" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>

      {/* Health Panel */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <SystemHealthPanel />
      </div>
    </div>
  );
}
