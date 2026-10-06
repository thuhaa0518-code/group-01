import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LogOutIcon, MenuIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABEL } from '../../utils/permissions';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm">
        
        Bỏ qua tới nội dung
      </a>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-none border-r border-line bg-surface transition-transform duration-200 ease-exp lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        }>
        
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3.5 rounded p-1 text-ink-700 transition-colors duration-150 ease-exp hover:bg-canvas lg:hidden"
          aria-label="Đóng điều hướng">
          
          <XIcon className="h-4 w-4" />
        </button>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      {mobileOpen &&
      <button type="button" aria-label="Đóng điều hướng" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-ink-900/20 lg:hidden" />
      }

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md border border-line p-1.5 text-ink-700 transition-colors duration-150 ease-exp hover:bg-canvas"
            aria-label="Mở điều hướng"
            aria-expanded={mobileOpen}>
            
            <MenuIcon className="h-4 w-4" />
          </button>
          <span className="flex-1 text-sm font-semibold text-ink-900">Procure</span>
          {user && <span className="text-2xs uppercase tracking-wide text-ink-500">{ROLE_LABEL[user.role]}</span>}
          <button type="button" onClick={() => logout('manual')} className="rounded-md p-1.5 text-ink-500 hover:bg-canvas hover:text-danger-600" aria-label="Đăng xuất">
            <LogOutIcon className="h-4 w-4" />
          </button>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}