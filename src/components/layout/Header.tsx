import { Crosshair, Database, Activity, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="h-14 border-b border-[var(--color-border-light)] bg-[var(--color-surface)] flex items-center justify-between px-4 z-10 relative">
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2 group">
          <Crosshair className="h-6 w-6 text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)] transition-colors" />
          <span className="font-semibold text-lg tracking-tight text-[var(--color-text-primary)]">
            Drift-Sense
          </span>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs text-[var(--color-text-secondary)]">
          <Database className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <span>Dataset: <span className="text-[var(--color-accent)]">Ready</span></span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[var(--color-text-secondary)]">
          <Cpu className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <span>Model: <span className="text-[var(--color-accent)]">Loaded</span></span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[var(--color-text-secondary)]">
          <Activity className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <span>Status: <span className="text-emerald-400">Idle</span></span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="h-7 w-7 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border-light)] flex items-center justify-center text-xs font-medium text-[var(--color-accent)]">
          DS
        </div>
      </div>
    </header>
  );
}
