import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import WaferDetailDrawer from '../ui/shared/WaferDetailDrawer';
import { useAppContext } from '../../context/AppContext';

export default function Layout() {
  const { isWaferDrawerOpen } = useAppContext();

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 relative min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <Outlet />
        </main>
      </div>
      {isWaferDrawerOpen && <WaferDetailDrawer />}
    </div>
  );
}
