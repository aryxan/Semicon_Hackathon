import { Link, useLocation } from 'react-router-dom';
import { Crosshair, Database, BarChart3, HelpCircle, Settings, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Localization', href: '/app', icon: Crosshair },
  { name: 'Dataset Generator', href: '/dataset', icon: Database },
  { name: 'Benchmark', href: '/benchmark', icon: BarChart3 },
  { name: 'Explainability', href: '/explainability', icon: HelpCircle },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 border-r border-[var(--color-border-light)] bg-[var(--color-surface)] flex flex-col">
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={twMerge(
                clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-[var(--color-secondary)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                )
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-[var(--color-border-light)]">
        <button className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors">
          <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors" />
          Settings
        </button>
      </div>
    </div>
  );
}
